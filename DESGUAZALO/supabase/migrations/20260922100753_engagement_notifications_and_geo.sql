-- In-app notifications and approximate coordinates for proximity search.

alter table public.listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.listings
  drop constraint if exists listings_latitude_check,
  drop constraint if exists listings_longitude_check;

alter table public.listings
  add constraint listings_latitude_check check (latitude is null or latitude between -90 and 90),
  add constraint listings_longitude_check check (longitude is null or longitude between -180 and 180);

create index if not exists listings_geo_presence_idx
  on public.listings(latitude, longitude)
  where latitude is not null and longitude is not null and hidden = false;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('request_match','saved_search_match','system')),
  title text not null check (char_length(title) between 1 and 160),
  body text check (body is null or char_length(body) <= 500),
  href text,
  listing_id uuid references public.listings(id) on delete set null,
  request_id uuid references public.part_requests(id) on delete set null,
  saved_search_id uuid references public.saved_searches(id) on delete set null,
  unique_key text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists notifications_unique_key_idx
  on public.notifications(unique_key)
  where unique_key is not null;

create index if not exists notifications_user_feed_idx
  on public.notifications(user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
on public.notifications for select
using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users mark own notifications read" on public.notifications;
create policy "Users mark own notifications read"
on public.notifications for update
using (user_id = (select auth.uid()) or private.is_admin())
with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users delete own notifications" on public.notifications;
create policy "Users delete own notifications"
on public.notifications for delete
using (user_id = (select auth.uid()) or private.is_admin());

grant select, delete on public.notifications to authenticated;
revoke update on public.notifications from authenticated;
grant update(read_at) on public.notifications to authenticated;

create or replace function private.safe_numeric(value text)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
begin
  if value is null or btrim(value) = '' then return null; end if;
  return value::numeric;
exception when others then
  return null;
end
$$;

create or replace function private.haversine_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
returns double precision
language sql
immutable
set search_path = ''
as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else 6371.0 * 2.0 * asin(sqrt(
      power(sin(radians(lat2-lat1)/2.0),2) +
      cos(radians(lat1))*cos(radians(lat2))*power(sin(radians(lon2-lon1)/2.0),2)
    ))
  end
$$;

create or replace function private.notify_request_match()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_request_title text;
  v_listing_title text;
  v_listing_slug text;
begin
  select r.requester_id, r.title
    into v_user, v_request_title
  from public.part_requests r
  where r.id = new.request_id;

  select l.title, l.slug
    into v_listing_title, v_listing_slug
  from public.listings l
  where l.id = new.listing_id;

  if v_user is null or v_listing_slug is null then
    return new;
  end if;

  insert into public.notifications(
    user_id, kind, title, body, href, listing_id, request_id, unique_key
  ) values (
    v_user,
    'request_match',
    'Nueva coincidencia para “' || left(v_request_title, 90) || '”',
    v_listing_title,
    '/pieza/' || v_listing_slug,
    new.listing_id,
    new.request_id,
    'request-match:' || new.request_id::text || ':' || new.listing_id::text
  )
  on conflict (unique_key) where unique_key is not null do nothing;

  return new;
end
$$;

drop trigger if exists request_matches_notify on public.request_matches;
create trigger request_matches_notify
after insert on public.request_matches
for each row execute function private.notify_request_match();

create or replace function private.notify_saved_searches_for_listing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.hidden or new.status = 'sold' then
    return new;
  end if;

  insert into public.notifications(
    user_id, kind, title, body, href, listing_id, saved_search_id, unique_key
  )
  select
    s.user_id,
    'saved_search_match',
    'Nuevo resultado para “' || left(s.name, 90) || '”',
    new.title || ' · ' || new.location,
    '/pieza/' || new.slug,
    new.id,
    s.id,
    'saved-search:' || s.id::text || ':' || new.id::text
  from public.saved_searches s
  where s.alerts_enabled = true
    and s.user_id <> new.seller_id
    and (coalesce(s.query_params->>'q','') = '' or new.search_vector @@ websearch_to_tsquery('spanish', s.query_params->>'q'))
    and (
      coalesce(s.query_params->>'oem','') = ''
      or new.reference_code_normalized like '%' || private.normalize_reference(s.query_params->>'oem') || '%'
    )
    and (coalesce(s.query_params->>'brand','') = '' or lower(new.brand) = lower(s.query_params->>'brand'))
    and (coalesce(s.query_params->>'model','') = '' or lower(new.model) like '%' || lower(s.query_params->>'model') || '%')
    and (coalesce(s.query_params->>'engine','') = '' or lower(coalesce(new.engine,'')) like '%' || lower(s.query_params->>'engine') || '%')
    and (coalesce(s.query_params->>'type','') = '' or new.type = s.query_params->>'type')
    and (coalesce(s.query_params->>'category','') = '' or new.category = s.query_params->>'category')
    and (coalesce(s.query_params->>'location','') = '' or lower(new.location) like '%' || lower(s.query_params->>'location') || '%')
    and (coalesce(s.query_params->>'condition','') = '' or new.condition = s.query_params->>'condition')
    and (coalesce(s.query_params->>'status','') = '' or new.status = s.query_params->>'status')
    and (
      private.safe_numeric(s.query_params->>'year') is null
      or new.year = private.safe_numeric(s.query_params->>'year')::integer
    )
    and (
      private.safe_numeric(s.query_params->>'minPrice') is null
      or (new.price is not null and new.price >= private.safe_numeric(s.query_params->>'minPrice'))
    )
    and (
      private.safe_numeric(s.query_params->>'maxPrice') is null
      or (new.price is not null and new.price <= private.safe_numeric(s.query_params->>'maxPrice'))
    )
    and (
      private.safe_numeric(s.query_params->>'latitude') is null
      or private.safe_numeric(s.query_params->>'longitude') is null
      or private.safe_numeric(s.query_params->>'radius') is null
      or (
        new.latitude is not null
        and new.longitude is not null
        and private.haversine_km(
          private.safe_numeric(s.query_params->>'latitude')::double precision,
          private.safe_numeric(s.query_params->>'longitude')::double precision,
          new.latitude,
          new.longitude
        ) <= private.safe_numeric(s.query_params->>'radius')::double precision
      )
    )
  on conflict (unique_key) where unique_key is not null do nothing;

  return new;
end
$$;

drop trigger if exists listings_notify_saved_searches on public.listings;
create trigger listings_notify_saved_searches
after insert or update of title, brand, model, generation, year, engine, category, condition, price, location, reference_code, status, hidden, latitude, longitude
on public.listings
for each row execute function private.notify_saved_searches_for_listing();

insert into public.notifications(
  user_id, kind, title, body, href, listing_id, request_id, unique_key, created_at
)
select
  r.requester_id,
  'request_match',
  'Coincidencia para “' || left(r.title, 90) || '”',
  l.title,
  '/pieza/' || l.slug,
  rm.listing_id,
  rm.request_id,
  'request-match:' || rm.request_id::text || ':' || rm.listing_id::text,
  rm.created_at
from public.request_matches rm
join public.part_requests r on r.id = rm.request_id
join public.listings l on l.id = rm.listing_id
where rm.seen_at is null
on conflict (unique_key) where unique_key is not null do nothing;
