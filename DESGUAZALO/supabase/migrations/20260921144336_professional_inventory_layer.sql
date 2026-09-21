-- Professional inventory primitives: internal metadata, import batches and dashboard summary.

alter table public.donor_parts
  add column if not exists internal_sku text,
  add column if not exists storage_location text,
  add column if not exists condition text not null default 'Usada',
  add column if not exists quantity integer not null default 1 check (quantity >= 0),
  add column if not exists purchase_price numeric(10,2) check (purchase_price is null or purchase_price >= 0),
  add column if not exists private_notes text check (private_notes is null or char_length(private_notes) <= 1200),
  add column if not exists batch_id uuid;

create unique index if not exists donor_parts_seller_sku_unique
  on public.donor_parts(seller_id, lower(internal_sku))
  where internal_sku is not null and btrim(internal_sku) <> '';

create index if not exists donor_parts_storage_idx
  on public.donor_parts(seller_id, storage_location)
  where storage_location is not null;

create table if not exists public.inventory_batches (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_listing_id uuid references public.listings(id) on delete set null,
  source text not null default 'manual' check (source in ('manual','csv')),
  filename text,
  row_count integer not null default 0 check (row_count >= 0),
  created_at timestamptz not null default now()
);

alter table public.donor_parts
  drop constraint if exists donor_parts_batch_id_fkey;

alter table public.donor_parts
  add constraint donor_parts_batch_id_fkey
  foreign key (batch_id) references public.inventory_batches(id) on delete set null;

create index if not exists inventory_batches_seller_idx
  on public.inventory_batches(seller_id, created_at desc);

create index if not exists inventory_batches_vehicle_idx
  on public.inventory_batches(vehicle_listing_id, created_at desc)
  where vehicle_listing_id is not null;

alter table public.inventory_batches enable row level security;

create policy "Professionals manage own inventory batches"
on public.inventory_batches for all
using (seller_id = (select auth.uid()))
with check (
  seller_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.seller_kind = 'professional'
  )
);

grant select, insert, update, delete on public.inventory_batches to authenticated;

create or replace function private.require_professional_inventory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kind text;
begin
  select p.seller_kind into kind
  from public.profiles p
  where p.id = new.seller_id;

  if kind is distinct from 'professional' then
    raise exception 'El inventario profesional requiere una cuenta profesional';
  end if;

  return new;
end
$$;

drop trigger if exists donor_parts_require_professional on public.donor_parts;
create trigger donor_parts_require_professional
before insert on public.donor_parts
for each row execute function private.require_professional_inventory();

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
    count(*) filter (where d.internal_sku is null or btrim(d.internal_sku) = '')::bigint,
    count(*) filter (where d.storage_location is null or btrim(d.storage_location) = '')::bigint
  from public.donor_parts d
  where d.seller_id = (select auth.uid())
$$;

grant execute on function public.pro_inventory_summary() to authenticated;
