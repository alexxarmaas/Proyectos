-- Re-evaluate request matches when declared compatibility changes and include generation in saved-search notifications.

create or replace function private.compatibility_refresh_request_matches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing_id uuid;
begin
  v_listing_id := coalesce(new.listing_id, old.listing_id);
  perform private.refresh_request_matches_for_listing(v_listing_id);
  return coalesce(new, old);
end
$$;

drop trigger if exists listing_compatibilities_refresh_request_matches on public.listing_compatibilities;
create trigger listing_compatibilities_refresh_request_matches
after insert or update or delete on public.listing_compatibilities
for each row execute function private.compatibility_refresh_request_matches();

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
    and (coalesce(s.query_params->>'oem','') = '' or new.reference_code_normalized like '%' || private.normalize_reference(s.query_params->>'oem') || '%')
    and (coalesce(s.query_params->>'brand','') = '' or lower(new.brand) = lower(s.query_params->>'brand'))
    and (coalesce(s.query_params->>'model','') = '' or lower(new.model) like '%' || lower(s.query_params->>'model') || '%')
    and (coalesce(s.query_params->>'generation','') = '' or lower(coalesce(new.generation,'')) like '%' || lower(s.query_params->>'generation') || '%')
    and (coalesce(s.query_params->>'engine','') = '' or lower(coalesce(new.engine,'')) like '%' || lower(s.query_params->>'engine') || '%')
    and (coalesce(s.query_params->>'type','') = '' or new.type = s.query_params->>'type')
    and (coalesce(s.query_params->>'category','') = '' or new.category = s.query_params->>'category')
    and (coalesce(s.query_params->>'location','') = '' or lower(new.location) like '%' || lower(s.query_params->>'location') || '%')
    and (coalesce(s.query_params->>'condition','') = '' or new.condition = s.query_params->>'condition')
    and (coalesce(s.query_params->>'status','') = '' or new.status = s.query_params->>'status')
    and (private.safe_numeric(s.query_params->>'year') is null or new.year = private.safe_numeric(s.query_params->>'year')::integer)
    and (private.safe_numeric(s.query_params->>'minPrice') is null or (new.price is not null and new.price >= private.safe_numeric(s.query_params->>'minPrice')))
    and (private.safe_numeric(s.query_params->>'maxPrice') is null or (new.price is not null and new.price <= private.safe_numeric(s.query_params->>'maxPrice')))
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

do $$
declare rec record;
begin
  for rec in select id from public.listings where type='part'
  loop
    perform private.refresh_request_matches_for_listing(rec.id);
  end loop;
end
$$;
