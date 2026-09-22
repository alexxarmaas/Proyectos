-- Request matching now considers declared compatibility, keeps seen state, and exposes demand preview to sellers.

create or replace function private.compute_request_listing_match(
  p_request_id uuid,
  p_listing_id uuid
)
returns table(score integer, reasons text[], is_match boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with base as (
    select
      r.status as request_status,
      l.status as listing_status,
      l.hidden,
      l.type as listing_type,
      r.requester_id,
      l.seller_id,
      (
        r.reference_code_normalized <> ''
        and l.reference_code_normalized <> ''
        and r.reference_code_normalized = l.reference_code_normalized
      ) as oem_exact,
      (
        lower(r.brand) = lower(l.brand)
        and lower(r.model) = lower(l.model)
      ) as direct_vehicle,
      exists (
        select 1
        from public.listing_compatibilities c
        where c.listing_id = l.id
          and lower(c.brand) = lower(r.brand)
          and lower(c.model) = lower(r.model)
          and (r.generation is null or c.generation is null or lower(c.generation) = lower(r.generation))
          and (r.engine is null or c.engine is null or lower(c.engine) = lower(r.engine))
          and (
            r.year is null
            or ((c.year_from is null or r.year >= c.year_from) and (c.year_to is null or r.year <= c.year_to))
          )
      ) as declared_compat,
      (
        r.generation is not null
        and l.generation is not null
        and lower(r.generation) = lower(l.generation)
      ) as generation_exact,
      (
        r.engine is not null
        and l.engine is not null
        and lower(r.engine) = lower(l.engine)
      ) as engine_exact,
      (
        r.year is not null
        and l.year is not null
        and r.year = l.year
      ) as year_exact,
      (
        l.search_vector @@ websearch_to_tsquery('spanish', r.title)
        or lower(l.title) like '%' || lower(split_part(r.title, ' ', 1)) || '%'
      ) as text_match
    from public.part_requests r
    join public.listings l on l.id = p_listing_id
    where r.id = p_request_id
  )
  select
    (
      case when oem_exact then 120 else 0 end +
      case when direct_vehicle then 50 else 0 end +
      case when declared_compat and not direct_vehicle then 55 else 0 end +
      case when generation_exact then 15 else 0 end +
      case when engine_exact then 15 else 0 end +
      case when year_exact then 8 else 0 end +
      case when text_match then 25 else 0 end
    )::integer as score,
    array_remove(array[
      case when oem_exact then 'Referencia OEM exacta' end,
      case when direct_vehicle then 'Mismo vehículo' end,
      case when declared_compat and not direct_vehicle then 'Compatibilidad declarada' end,
      case when generation_exact then 'Misma generación' end,
      case when engine_exact then 'Mismo motor' end,
      case when year_exact then 'Mismo año' end,
      case when text_match then 'Descripción compatible' end
    ], null) as reasons,
    (
      request_status = 'open'
      and listing_type = 'part'
      and listing_status <> 'sold'
      and hidden = false
      and requester_id <> seller_id
      and (
        oem_exact
        or ((direct_vehicle or declared_compat) and text_match)
      )
    ) as is_match
  from base
$$;

create or replace function private.refresh_request_matches_for_listing(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.request_matches(request_id, listing_id, score, reasons)
  select r.id, p_listing_id, m.score, m.reasons
  from public.part_requests r
  cross join lateral private.compute_request_listing_match(r.id, p_listing_id) m
  where m.is_match
  on conflict (request_id, listing_id)
  do update set score = excluded.score, reasons = excluded.reasons;

  delete from public.request_matches rm
  where rm.listing_id = p_listing_id
    and not exists (
      select 1
      from private.compute_request_listing_match(rm.request_id, rm.listing_id) m
      where m.is_match
    );
end
$$;

create or replace function private.refresh_request_matches_for_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.request_matches(request_id, listing_id, score, reasons)
  select p_request_id, l.id, m.score, m.reasons
  from public.listings l
  cross join lateral private.compute_request_listing_match(p_request_id, l.id) m
  where m.is_match
  on conflict (request_id, listing_id)
  do update set score = excluded.score, reasons = excluded.reasons;

  delete from public.request_matches rm
  where rm.request_id = p_request_id
    and not exists (
      select 1
      from private.compute_request_listing_match(rm.request_id, rm.listing_id) m
      where m.is_match
    );
end
$$;

create or replace function public.request_demand_preview(
  p_title text,
  p_brand text,
  p_model text,
  p_generation text default null,
  p_year integer default null,
  p_engine text default null,
  p_reference text default null
)
returns table(
  request_id uuid,
  request_title text,
  location text,
  score integer,
  reasons text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  with candidates as (
    select
      r.id,
      r.title,
      r.location,
      (
        private.normalize_reference(r.reference_code) <> ''
        and private.normalize_reference(p_reference) <> ''
        and private.normalize_reference(r.reference_code) = private.normalize_reference(p_reference)
      ) as oem_exact,
      (lower(r.brand) = lower(coalesce(p_brand,''))) as brand_match,
      (lower(r.model) = lower(coalesce(p_model,''))) as model_match,
      (
        r.generation is not null
        and nullif(btrim(p_generation),'') is not null
        and lower(r.generation) = lower(p_generation)
      ) as generation_match,
      (
        r.engine is not null
        and nullif(btrim(p_engine),'') is not null
        and (
          lower(r.engine) = lower(p_engine)
          or lower(p_engine) like '%' || lower(r.engine) || '%'
          or lower(r.engine) like '%' || lower(p_engine) || '%'
        )
      ) as engine_match,
      (r.year is not null and p_year is not null and r.year = p_year) as year_match,
      (
        to_tsvector(
          'spanish',
          concat_ws(' ', coalesce(p_title,''), coalesce(p_brand,''), coalesce(p_model,''), coalesce(p_generation,''), coalesce(p_engine,''), coalesce(p_reference,''))
        ) @@ websearch_to_tsquery('spanish', r.title)
        or lower(coalesce(p_title,'')) like '%' || lower(split_part(r.title,' ',1)) || '%'
      ) as text_match
    from public.part_requests r
    where r.status = 'open'
      and r.requester_id <> (select auth.uid())
  ),
  scored as (
    select
      id,
      title,
      location,
      (
        case when oem_exact then 120 else 0 end +
        case when brand_match then 30 else 0 end +
        case when model_match then 30 else 0 end +
        case when generation_match then 15 else 0 end +
        case when engine_match then 15 else 0 end +
        case when year_match then 8 else 0 end +
        case when text_match then 25 else 0 end
      )::integer as match_score,
      array_remove(array[
        case when oem_exact then 'OEM exacta' end,
        case when brand_match and model_match then 'Mismo vehículo' end,
        case when generation_match then 'Misma generación' end,
        case when engine_match then 'Mismo motor' end,
        case when year_match then 'Mismo año' end,
        case when text_match then 'Buscan esta pieza' end
      ], null) as match_reasons,
      (oem_exact or (brand_match and model_match and text_match)) as accepted
    from candidates
  )
  select
    id as request_id,
    title as request_title,
    location,
    match_score as score,
    match_reasons as reasons
  from scored
  where accepted
  order by match_score desc, title
  limit 8
$$;

revoke execute on function public.request_demand_preview(text,text,text,text,integer,text,text) from anon;
revoke execute on function public.request_demand_preview(text,text,text,text,integer,text,text) from public;
grant execute on function public.request_demand_preview(text,text,text,text,integer,text,text) to authenticated;

do $$
declare rec record;
begin
  for rec in select id from public.listings where type='part'
  loop
    perform private.refresh_request_matches_for_listing(rec.id);
  end loop;
end
$$;
