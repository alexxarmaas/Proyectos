-- DESGUÁZALO MVP database schema
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  location text,
  phone text,
  whatsapp text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('part', 'vehicle')),
  title text not null check (char_length(title) between 2 and 120),
  slug text not null unique check (char_length(slug) between 2 and 160),
  description text check (description is null or char_length(description) <= 1500),
  brand text not null check (char_length(brand) between 1 and 60),
  model text not null check (char_length(model) between 1 and 80),
  generation text,
  year integer check (year is null or year between 1900 and 2100),
  engine text,
  category text,
  condition text not null,
  price numeric(12,2) check (price is null or price >= 0),
  location text not null check (char_length(location) between 1 and 120),
  mileage integer check (mileage is null or mileage >= 0),
  available_parts text[],
  reference_code text,
  technical_notes text,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  hidden boolean not null default false,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listing_shape check (
    (type = 'part' and category is not null and price is not null)
    or type = 'vehicle'
  )
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  position smallint not null check (position between 0 and 4),
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);

-- Kept deliberately simple in the MVP, but this table means one part can fit
-- several vehicle variants later without changing the listing model.
create table public.listing_compatibilities (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  brand text not null,
  model text not null,
  generation text,
  year_from integer,
  year_to integer,
  engine text,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index listings_seller_idx on public.listings(seller_id);
create index listings_marketplace_idx on public.listings(hidden, status, created_at desc);
create index listings_vehicle_idx on public.listings(brand, model, year);
create index listings_category_idx on public.listings(category);
create index listings_search_idx on public.listings using gin(search_vector);
create index listing_images_listing_idx on public.listing_images(listing_id, position);
create index compat_listing_idx on public.listing_compatibilities(listing_id);
create index reports_status_idx on public.reports(status, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger listings_touch_updated_at
before update on public.listings
for each row execute function public.touch_updated_at();

create or replace function public.refresh_listing_search_vector()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.search_vector := to_tsvector(
    'spanish'::regconfig,
    concat_ws(' ',
      coalesce(new.title, ''),
      coalesce(new.brand, ''),
      coalesce(new.model, ''),
      coalesce(new.generation, ''),
      coalesce(new.engine, ''),
      coalesce(new.category, ''),
      coalesce(new.description, ''),
      coalesce(new.reference_code, ''),
      coalesce(new.technical_notes, ''),
      coalesce(array_to_string(new.available_parts, ' '), '')
    )
  );
  return new;
end;
$$;

create trigger listings_search_vector_trigger
before insert or update of title, brand, model, generation, engine, category, description, reference_code, technical_notes, available_parts
on public.listings
for each row execute function public.refresh_listing_search_vector();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, location, phone, whatsapp)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(new.email, 'usuario'), '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'location'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'whatsapp'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_compatibilities enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

create policy "Profiles visible when relevant"
on public.profiles for select
using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.listings l
    where l.seller_id = profiles.id and l.hidden = false
  )
);

create policy "Users update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Listings visible to marketplace owner or admin"
on public.listings for select
using (hidden = false or seller_id = auth.uid() or public.is_admin());

create policy "Users create own listings"
on public.listings for insert
with check (seller_id = auth.uid());

create policy "Owners or admins update listings"
on public.listings for update
using (seller_id = auth.uid() or public.is_admin())
with check (seller_id = auth.uid() or public.is_admin());

create policy "Owners or admins delete listings"
on public.listings for delete
using (seller_id = auth.uid() or public.is_admin());

create policy "Images visible with listing"
on public.listing_images for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (l.hidden = false or l.seller_id = auth.uid() or public.is_admin())
  )
);

create policy "Owners insert listing images"
on public.listing_images for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id and l.seller_id = auth.uid()
  )
);

create policy "Owners or admins delete listing images"
on public.listing_images for delete
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id and (l.seller_id = auth.uid() or public.is_admin())
  )
);

create policy "Compatibility visible with listing"
on public.listing_compatibilities for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_compatibilities.listing_id
      and (l.hidden = false or l.seller_id = auth.uid() or public.is_admin())
  )
);

create policy "Owners manage compatibility"
on public.listing_compatibilities for all
using (
  exists (select 1 from public.listings l where l.id = listing_compatibilities.listing_id and l.seller_id = auth.uid())
)
with check (
  exists (select 1 from public.listings l where l.id = listing_compatibilities.listing_id and l.seller_id = auth.uid())
);

create policy "Users read own favorites"
on public.favorites for select
using (user_id = auth.uid());

create policy "Users create own favorites"
on public.favorites for insert
with check (user_id = auth.uid());

create policy "Users delete own favorites"
on public.favorites for delete
using (user_id = auth.uid());

create policy "Reporter or admin reads reports"
on public.reports for select
using (reporter_id = auth.uid() or public.is_admin());

create policy "Users create own reports"
on public.reports for insert
with check (reporter_id = auth.uid());

create policy "Admins resolve reports"
on public.reports for update
using (public.is_admin())
with check (public.is_admin());

-- Column privileges are an extra barrier on top of RLS. In particular, a user
-- cannot promote their own profile by updating is_admin through PostgREST.
revoke insert, delete, update on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name, location, phone, whatsapp, avatar_url, updated_at) on public.profiles to authenticated;

grant select on public.listings to anon, authenticated;
grant insert, delete on public.listings to authenticated;
revoke update on public.listings from authenticated;
grant update (title, description, brand, model, generation, year, engine, category, condition, price, location, mileage, available_parts, reference_code, technical_notes, status, hidden, updated_at) on public.listings to authenticated;

grant select on public.listing_images to anon, authenticated;
grant insert, delete on public.listing_images to authenticated;
grant select on public.listing_compatibilities to anon, authenticated;
grant insert, update, delete on public.listing_compatibilities to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update on public.reports to authenticated;

-- Public image delivery keeps the MVP simple and fast. Writes/deletes remain
-- protected by storage policies and user-scoped folder names.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read listing images"
on storage.objects for select
using (bucket_id = 'listing-images');

create policy "Users upload inside own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners or admins delete listing files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);
