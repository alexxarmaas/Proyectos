-- Keep internal SKU, warehouse location, cost and private notes out of the publicly readable donor_parts table.

create table if not exists public.donor_part_private (
  donor_part_id uuid primary key references public.donor_parts(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  internal_sku text,
  storage_location text,
  purchase_price numeric(10,2) check (purchase_price is null or purchase_price >= 0),
  private_notes text check (private_notes is null or char_length(private_notes) <= 1200),
  batch_id uuid references public.inventory_batches(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.donor_part_private (
  donor_part_id, seller_id, internal_sku, storage_location, purchase_price, private_notes, batch_id
)
select id, seller_id, internal_sku, storage_location, purchase_price, private_notes, batch_id
from public.donor_parts
where internal_sku is not null
   or storage_location is not null
   or purchase_price is not null
   or private_notes is not null
   or batch_id is not null
on conflict (donor_part_id) do update set
  seller_id = excluded.seller_id,
  internal_sku = excluded.internal_sku,
  storage_location = excluded.storage_location,
  purchase_price = excluded.purchase_price,
  private_notes = excluded.private_notes,
  batch_id = excluded.batch_id,
  updated_at = now();

drop index if exists public.donor_parts_seller_sku_unique;
drop index if exists public.donor_parts_storage_idx;

create unique index if not exists donor_part_private_seller_sku_unique
  on public.donor_part_private(seller_id, lower(internal_sku))
  where internal_sku is not null and btrim(internal_sku) <> '';

create index if not exists donor_part_private_storage_idx
  on public.donor_part_private(seller_id, storage_location)
  where storage_location is not null;

create index if not exists donor_part_private_batch_idx
  on public.donor_part_private(batch_id)
  where batch_id is not null;

drop trigger if exists donor_part_private_touch_updated_at on public.donor_part_private;
create trigger donor_part_private_touch_updated_at
before update on public.donor_part_private
for each row execute function public.touch_updated_at();

alter table public.donor_part_private enable row level security;

create policy "Owners manage donor private data"
on public.donor_part_private for all
using (seller_id = (select auth.uid()))
with check (
  seller_id = (select auth.uid())
  and exists (
    select 1 from public.donor_parts d
    where d.id = donor_part_private.donor_part_id
      and d.seller_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.donor_part_private to authenticated;

alter table public.donor_parts
  drop constraint if exists donor_parts_batch_id_fkey,
  drop column if exists internal_sku,
  drop column if exists storage_location,
  drop column if exists purchase_price,
  drop column if exists private_notes,
  drop column if exists batch_id;

create or replace function public.pro_inventory_summary()
returns table (
  total bigint,
  available bigint,
  reserved bigint,
  sold bigint,
  published bigint,
  without_price bigint,
  without_oem bigint,
  without_sku bigint,
  without_storage bigint
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
    count(*) filter (where p.storage_location is null or btrim(p.storage_location) = '')::bigint
  from public.donor_parts d
  left join public.donor_part_private p
    on p.donor_part_id = d.id
   and p.seller_id = (select auth.uid())
  where d.seller_id = (select auth.uid())
$$;

grant execute on function public.pro_inventory_summary() to authenticated;
