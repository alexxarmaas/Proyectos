-- Vehicle donor inventory, automatic "Se busca" matching and OEM-derived compatibility knowledge.

create or replace function private.normalize_reference(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(regexp_replace(coalesce(value, ''), '[^a-zA-Z0-9]', '', 'g'))
$$;

alter table public.listings
  add column if not exists reference_code_normalized text
  generated always as (private.normalize_reference(reference_code)) stored;

alter table public.part_requests
  add column if not exists reference_code_normalized text
  generated always as (private.normalize_reference(reference_code)) stored;

create index if not exists listings_reference_normalized_idx
  on public.listings(reference_code_normalized)
  where reference_code_normalized <> '';

create index if not exists part_requests_reference_normalized_idx
  on public.part_requests(reference_code_normalized)
  where reference_code_normalized <> '';

create table if not exists public.donor_parts (
  id uuid primary key default gen_random_uuid(),
  vehicle_listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  category text,
  reference_code text,
  price numeric(10,2) check (price is null or price >= 0),
  status text not null default 'available' check (status in ('available','reserved','sold')),
  notes text check (notes is null or char_length(notes) <= 600),
  published_listing_id uuid references public.listings(id) on delete set null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donor_parts_vehicle_idx on public.donor_parts(vehicle_listing_id, status, position, created_at);
create index if not exists donor_parts_seller_idx on public.donor_parts(seller_id, created_at desc);
create index if not exists donor_parts_published_listing_idx on public.donor_parts(published_listing_id) where published_listing_id is not null;

create or replace function private.validate_donor_part()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  vehicle_seller uuid;
  vehicle_type text;
  published_seller uuid;
  published_type text;
begin
  select l.seller_id, l.type into vehicle_seller, vehicle_type
  from public.listings l where l.id = new.vehicle_listing_id;

  if vehicle_seller is null then raise exception 'Vehículo donante no encontrado'; end if;
  if vehicle_type <> 'vehicle' then raise exception 'El inventario solo puede pertenecer a un vehículo en despiece'; end if;

  new.seller_id := vehicle_seller;

  if new.published_listing_id is not null then
    select l.seller_id, l.type into published_seller, published_type
    from public.listings l where l.id = new.published_listing_id;
    if published_seller is distinct from vehicle_seller or published_type <> 'part' then
      raise exception 'La publicación vinculada debe ser una pieza del mismo vendedor';
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists donor_parts_validate on public.donor_parts;
create trigger donor_parts_validate before insert or update on public.donor_parts
for each row execute function private.validate_donor_part();

drop trigger if exists donor_parts_touch_updated_at on public.donor_parts;
create trigger donor_parts_touch_updated_at before update on public.donor_parts
for each row execute function public.touch_updated_at();

create or replace function private.sync_donor_part_from_listing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.type = 'part' and new.status is distinct from old.status then
    update public.donor_parts
    set status = new.status, updated_at = now()
    where published_listing_id = new.id and status is distinct from new.status;
  end if;
  return new;
end
$$;

drop trigger if exists listings_sync_donor_part_status on public.listings;
create trigger listings_sync_donor_part_status after update of status on public.listings
for each row execute function private.sync_donor_part_from_listing();

alter table public.donor_parts enable row level security;

create policy "Donor inventory is visible with listing" on public.donor_parts for select
using (
  seller_id = (select auth.uid())
  or private.is_admin()
  or exists (select 1 from public.listings l where l.id = donor_parts.vehicle_listing_id and l.hidden = false)
);

create policy "Sellers create donor inventory" on public.donor_parts for insert
with check (
  seller_id = (select auth.uid())
  and exists (
    select 1 from public.listings l
    where l.id = donor_parts.vehicle_listing_id
      and l.seller_id = (select auth.uid())
      and l.type = 'vehicle'
  )
);

create policy "Sellers update donor inventory" on public.donor_parts for update
using (seller_id = (select auth.uid()) or private.is_admin())
with check (seller_id = (select auth.uid()) or private.is_admin());

create policy "Sellers delete donor inventory" on public.donor_parts for delete
using (seller_id = (select auth.uid()) or private.is_admin());

grant select on public.donor_parts to anon, authenticated;
grant insert, update, delete on public.donor_parts to authenticated;

create table if not exists public.request_matches (
  request_id uuid not null references public.part_requests(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  score integer not null check (score >= 0),
  reasons text[] not null default '{}',
  seen_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (request_id, listing_id)
);

create index if not exists request_matches_request_idx on public.request_matches(request_id, score desc, created_at desc);
create index if not exists request_matches_listing_idx on public.request_matches(listing_id);

alter table public.request_matches enable row level security;

create policy "Requesters see own matches" on public.request_matches for select
using (
  private.is_admin()
  or exists (
    select 1 from public.part_requests r
    where r.id = request_matches.request_id
      and r.requester_id = (select auth.uid())
  )
);

create policy "Requesters mark own matches seen" on public.request_matches for update
using (
  exists (
    select 1 from public.part_requests r
    where r.id = request_matches.request_id
      and r.requester_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.part_requests r
    where r.id = request_matches.request_id
      and r.requester_id = (select auth.uid())
  )
);

grant select, update on public.request_matches to authenticated;

create or replace function private.refresh_request_matches_for_listing(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.request_matches where listing_id = p_listing_id;

  insert into public.request_matches(request_id, listing_id, score, reasons)
  select
    r.id,
    l.id,
    (
      case when r.reference_code_normalized <> '' and r.reference_code_normalized = l.reference_code_normalized then 100 else 0 end +
      case when lower(r.brand) = lower(l.brand) then 30 else 0 end +
      case when lower(r.model) = lower(l.model) then 30 else 0 end +
      case when r.generation is not null and l.generation is not null and lower(r.generation) = lower(l.generation) then 10 else 0 end +
      case when r.engine is not null and l.engine is not null and lower(r.engine) = lower(l.engine) then 10 else 0 end +
      case when r.year is not null and l.year is not null and r.year = l.year then 5 else 0 end +
      case when l.search_vector @@ websearch_to_tsquery('spanish', r.title) then 20 else 0 end
    )::integer,
    array_remove(array[
      case when r.reference_code_normalized <> '' and r.reference_code_normalized = l.reference_code_normalized then 'Referencia OEM exacta' end,
      case when lower(r.brand) = lower(l.brand) and lower(r.model) = lower(l.model) then 'Mismo vehículo' end,
      case when r.generation is not null and l.generation is not null and lower(r.generation) = lower(l.generation) then 'Misma generación' end,
      case when r.engine is not null and l.engine is not null and lower(r.engine) = lower(l.engine) then 'Mismo motor' end,
      case when l.search_vector @@ websearch_to_tsquery('spanish', r.title) then 'Descripción compatible' end
    ], null)
  from public.listings l
  join public.part_requests r on r.status = 'open'
  where l.id = p_listing_id
    and l.type = 'part'
    and l.hidden = false
    and l.status <> 'sold'
    and (
      (r.reference_code_normalized <> '' and r.reference_code_normalized = l.reference_code_normalized)
      or (
        lower(r.brand) = lower(l.brand)
        and lower(r.model) = lower(l.model)
        and (
          l.search_vector @@ websearch_to_tsquery('spanish', r.title)
          or lower(l.title) like '%' || lower(split_part(r.title, ' ', 1)) || '%'
        )
      )
    )
  on conflict (request_id, listing_id)
  do update set score = excluded.score, reasons = excluded.reasons, created_at = public.request_matches.created_at;
end
$$;

create or replace function private.refresh_request_matches_for_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.request_matches where request_id = p_request_id;

  insert into public.request_matches(request_id, listing_id, score, reasons)
  select
    r.id,
    l.id,
    (
      case when r.reference_code_normalized <> '' and r.reference_code_normalized = l.reference_code_normalized then 100 else 0 end +
      case when lower(r.brand) = lower(l.brand) then 30 else 0 end +
      case when lower(r.model) = lower(l.model) then 30 else 0 end +
      case when r.generation is not null and l.generation is not null and lower(r.generation) = lower(l.generation) then 10 else 0 end +
      case when r.engine is not null and l.engine is not null and lower(r.engine) = lower(l.engine) then 10 else 0 end +
      case when r.year is not null and l.year is not null and r.year = l.year then 5 else 0 end +
      case when l.search_vector @@ websearch_to_tsquery('spanish', r.title) then 20 else 0 end
    )::integer,
    array_remove(array[
      case when r.reference_code_normalized <> '' and r.reference_code_normalized = l.reference_code_normalized then 'Referencia OEM exacta' end,
      case when lower(r.brand) = lower(l.brand) and lower(r.model) = lower(l.model) then 'Mismo vehículo' end,
      case when r.generation is not null and l.generation is not null and lower(r.generation) = lower(l.generation) then 'Misma generación' end,
      case when r.engine is not null and l.engine is not null and lower(r.engine) = lower(l.engine) then 'Mismo motor' end,
      case when l.search_vector @@ websearch_to_tsquery('spanish', r.title) then 'Descripción compatible' end
    ], null)
  from public.part_requests r
  join public.listings l on l.type = 'part' and l.hidden = false and l.status <> 'sold'
  where r.id = p_request_id
    and r.status = 'open'
    and (
      (r.reference_code_normalized <> '' and r.reference_code_normalized = l.reference_code_normalized)
      or (
        lower(r.brand) = lower(l.brand)
        and lower(r.model) = lower(l.model)
        and (
          l.search_vector @@ websearch_to_tsquery('spanish', r.title)
          or lower(l.title) like '%' || lower(split_part(r.title, ' ', 1)) || '%'
        )
      )
    )
  on conflict (request_id, listing_id)
  do update set score = excluded.score, reasons = excluded.reasons, created_at = public.request_matches.created_at;
end
$$;

create or replace function private.listing_refresh_request_matches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.refresh_request_matches_for_listing(new.id);
  return new;
end
$$;

create or replace function private.request_refresh_matches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.refresh_request_matches_for_request(new.id);
  return new;
end
$$;

drop trigger if exists listings_refresh_request_matches on public.listings;
create trigger listings_refresh_request_matches
after insert or update of title, brand, model, generation, year, engine, reference_code, status, hidden on public.listings
for each row execute function private.listing_refresh_request_matches();

drop trigger if exists part_requests_refresh_matches on public.part_requests;
create trigger part_requests_refresh_matches
after insert or update of title, brand, model, generation, year, engine, reference_code, status on public.part_requests
for each row execute function private.request_refresh_matches();

create or replace function public.oem_compatibility_suggestions(p_reference text)
returns table (
  brand text,
  model text,
  generation text,
  year_from integer,
  year_to integer,
  engine text,
  occurrences bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.brand, c.model, c.generation, c.year_from, c.year_to, c.engine, count(*)::bigint as occurrences
  from public.listings l
  join public.listing_compatibilities c on c.listing_id = l.id
  where l.hidden = false
    and l.type = 'part'
    and l.reference_code_normalized <> ''
    and l.reference_code_normalized = private.normalize_reference(p_reference)
  group by c.brand, c.model, c.generation, c.year_from, c.year_to, c.engine
  order by occurrences desc, c.brand, c.model
  limit 20
$$;

grant execute on function public.oem_compatibility_suggestions(text) to anon, authenticated;

do $$
declare rec record;
begin
  for rec in select id from public.listings where type='part' and hidden=false and status<>'sold'
  loop
    perform private.refresh_request_matches_for_listing(rec.id);
  end loop;
end
$$;
