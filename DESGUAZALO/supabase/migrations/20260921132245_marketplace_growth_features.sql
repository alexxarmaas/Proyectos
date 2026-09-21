alter table public.profiles
  add column if not exists seller_kind text not null default 'private'
    check (seller_kind in ('private','professional')),
  add column if not exists last_active_at timestamptz not null default now();

alter table public.listings
  add column if not exists shipping_available boolean not null default false,
  add column if not exists pickup_available boolean not null default true;

alter table public.listing_images drop constraint if exists listing_images_position_check;
alter table public.listing_images add constraint listing_images_position_check check (position between 0 and 9);

create table if not exists public.user_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nickname text,
  brand text not null check (char_length(brand) between 1 and 60),
  model text not null check (char_length(model) between 1 and 80),
  generation text,
  year integer check (year is null or year between 1900 and 2100),
  engine text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.part_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  brand text not null check (char_length(brand) between 1 and 60),
  model text not null check (char_length(model) between 1 and 80),
  generation text,
  year integer check (year is null or year between 1900 and 2100),
  engine text,
  reference_code text,
  location text not null check (char_length(location) between 1 and 120),
  notes text check (notes is null or char_length(notes) <= 1000),
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  query_params jsonb not null default '{}'::jsonb,
  alerts_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  last_checked_at timestamptz
);

create index if not exists user_vehicles_user_idx on public.user_vehicles(user_id, created_at desc);
create index if not exists part_requests_market_idx on public.part_requests(status, created_at desc);
create index if not exists part_requests_vehicle_idx on public.part_requests(brand, model, year);
create index if not exists saved_searches_user_idx on public.saved_searches(user_id, created_at desc);
create index if not exists listing_compatibilities_lookup_idx on public.listing_compatibilities(brand, model, generation, engine);

create trigger part_requests_touch_updated_at before update on public.part_requests for each row execute function public.touch_updated_at();

alter table public.user_vehicles enable row level security;
alter table public.part_requests enable row level security;
alter table public.saved_searches enable row level security;

create policy "Users manage own garage" on public.user_vehicles for all
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Open requests are public" on public.part_requests for select
using (status = 'open' or requester_id = auth.uid() or private.is_admin());

create policy "Users create own requests" on public.part_requests for insert
with check (requester_id = auth.uid());

create policy "Users manage own requests" on public.part_requests for update
using (requester_id = auth.uid() or private.is_admin())
with check (requester_id = auth.uid() or private.is_admin());

create policy "Users delete own requests" on public.part_requests for delete
using (requester_id = auth.uid() or private.is_admin());

create policy "Users manage own saved searches" on public.saved_searches for all
using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.user_vehicles to authenticated;
grant select on public.part_requests to anon, authenticated;
grant insert, update, delete on public.part_requests to authenticated;
grant select, insert, update, delete on public.saved_searches to authenticated;
grant update (seller_kind, last_active_at) on public.profiles to authenticated;
grant update (shipping_available, pickup_available) on public.listings to authenticated;
