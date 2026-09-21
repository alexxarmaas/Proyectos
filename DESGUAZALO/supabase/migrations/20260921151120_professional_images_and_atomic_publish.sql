-- Private per-part photo index for professional stock and atomic publication of inventory rows.

create table if not exists public.donor_part_images (
  id uuid primary key default gen_random_uuid(),
  donor_part_id uuid not null references public.donor_parts(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  position integer not null default 0 check (position between 0 and 9),
  created_at timestamptz not null default now()
);

create unique index if not exists donor_part_images_position_unique
  on public.donor_part_images(donor_part_id, position);

create index if not exists donor_part_images_seller_idx
  on public.donor_part_images(seller_id, donor_part_id);

alter table public.donor_part_images enable row level security;

drop policy if exists "Owners manage donor part images" on public.donor_part_images;
create policy "Owners manage donor part images"
on public.donor_part_images for all
using (seller_id = (select auth.uid()))
with check (
  seller_id = (select auth.uid())
  and exists (
    select 1 from public.donor_parts d
    where d.id = donor_part_images.donor_part_id
      and d.seller_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.donor_part_images to authenticated;

drop function if exists public.pro_inventory_summary();

create function public.pro_inventory_summary()
returns table (
  total bigint,
  available bigint,
  reserved bigint,
  sold bigint,
  published bigint,
  without_price bigint,
  without_oem bigint,
  without_sku bigint,
  without_storage bigint,
  without_images bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    count(*)::bigint,
    count(*) filter (where d.status = 'available')::bigint,
    count(*) filter (where d.status = 'reserved')::bigint,
    count(*) filter (where d.status = 'sold')::bigint,
    count(*) filter (where d.published_listing_id is not null)::bigint,
    count(*) filter (where d.price is null)::bigint,
    count(*) filter (where d.reference_code is null or btrim(d.reference_code) = '')::bigint,
    count(*) filter (where p.internal_sku is null or btrim(p.internal_sku) = '')::bigint,
    count(*) filter (where p.storage_location is null or btrim(p.storage_location) = '')::bigint,
    count(*) filter (where not exists (
      select 1 from public.donor_part_images i where i.donor_part_id = d.id
    ))::bigint
  from public.donor_parts d
  left join public.donor_part_private p
    on p.donor_part_id = d.id
   and p.seller_id = (select auth.uid())
  where d.seller_id = (select auth.uid())
$$;

grant execute on function public.pro_inventory_summary() to authenticated;

create or replace function public.pro_publish_inventory(p_donor_part_ids uuid[])
returns table(donor_part_id uuid, listing_id uuid, slug text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_part record;
  v_listing_id uuid;
  v_slug text;
begin
  if v_user is null then
    raise exception 'Sesión requerida';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_user and p.seller_kind = 'professional'
  ) then
    raise exception 'DESGUÁZALO Pro no está activo';
  end if;

  if p_donor_part_ids is null or cardinality(p_donor_part_ids) = 0 then
    raise exception 'No hay piezas seleccionadas';
  end if;

  if exists (
    select 1
    from unnest(p_donor_part_ids) wanted(id)
    left join public.donor_parts d on d.id = wanted.id and d.seller_id = v_user
    where d.id is null
  ) then
    raise exception 'La selección contiene piezas no válidas';
  end if;

  for v_part in
    select
      d.*,
      l.brand,
      l.model,
      l.generation,
      l.year,
      l.engine,
      l.location
    from public.donor_parts d
    join public.listings l on l.id = d.vehicle_listing_id
    where d.id = any(p_donor_part_ids)
      and d.seller_id = v_user
    order by d.created_at, d.position
  loop
    if v_part.published_listing_id is not null then
      continue;
    end if;

    if v_part.category is null or btrim(v_part.category) = '' or v_part.price is null then
      raise exception 'La pieza % necesita categoría y precio antes de publicarse', v_part.name;
    end if;

    if not exists (
      select 1 from public.donor_part_images i
      where i.donor_part_id = v_part.id and i.seller_id = v_user
    ) then
      raise exception 'La pieza % necesita al menos una foto antes de publicarse', v_part.name;
    end if;

    v_listing_id := gen_random_uuid();
    v_slug := trim(both '-' from regexp_replace(
      lower(translate(v_part.name, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')),
      '[^a-z0-9]+', '-', 'g'
    )) || '-' || substr(replace(v_listing_id::text,'-',''),1,8);

    insert into public.listings(
      id, seller_id, type, title, slug, description,
      brand, model, generation, year, engine, category, condition, price,
      location, mileage, available_parts, reference_code, technical_notes,
      shipping_available, pickup_available, status, hidden
    ) values (
      v_listing_id, v_user, 'part', v_part.name, v_slug, v_part.notes,
      v_part.brand, v_part.model, v_part.generation, v_part.year, v_part.engine,
      v_part.category, v_part.condition, v_part.price,
      v_part.location, null, null, v_part.reference_code, null,
      false, true, v_part.status, false
    );

    insert into public.listing_compatibilities(
      listing_id, brand, model, generation, year_from, year_to, engine
    ) values (
      v_listing_id, v_part.brand, v_part.model, v_part.generation,
      v_part.year, v_part.year, v_part.engine
    );

    insert into public.listing_images(listing_id, storage_path, public_url, position)
    select v_listing_id, i.storage_path, i.public_url, i.position
    from public.donor_part_images i
    where i.donor_part_id = v_part.id
      and i.seller_id = v_user
    order by i.position
    limit 10;

    update public.donor_parts
    set published_listing_id = v_listing_id, updated_at = now()
    where id = v_part.id;

    donor_part_id := v_part.id;
    listing_id := v_listing_id;
    slug := v_slug;
    return next;
  end loop;
end
$$;

revoke execute on function public.pro_publish_inventory(uuid[]) from anon;
revoke execute on function public.pro_publish_inventory(uuid[]) from public;
grant execute on function public.pro_publish_inventory(uuid[]) to authenticated;
