-- Import a manual/CSV batch atomically so a duplicate SKU or malformed row cannot leave a partial batch behind.

create or replace function public.pro_import_inventory(
  p_vehicle_listing_id uuid,
  p_source text,
  p_filename text,
  p_rows jsonb
)
returns table(batch_id uuid, inserted integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_batch uuid;
  v_item jsonb;
  v_part_id uuid;
  v_inserted integer := 0;
begin
  if v_user is null then
    raise exception 'Sesión requerida';
  end if;

  if p_source not in ('manual','csv') then
    raise exception 'Origen de importación no válido';
  end if;

  if jsonb_typeof(p_rows) is distinct from 'array' then
    raise exception 'Las filas deben enviarse como un array';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_user and p.seller_kind = 'professional'
  ) then
    raise exception 'DESGUÁZALO Pro no está activo';
  end if;

  if not exists (
    select 1 from public.listings l
    where l.id = p_vehicle_listing_id
      and l.seller_id = v_user
      and l.type = 'vehicle'
      and l.hidden = false
  ) then
    raise exception 'Vehículo donante no válido';
  end if;

  insert into public.inventory_batches(seller_id, vehicle_listing_id, source, filename, row_count)
  values (v_user, p_vehicle_listing_id, p_source, nullif(btrim(p_filename), ''), 0)
  returning id into v_batch;

  for v_item in select value from jsonb_array_elements(p_rows)
  loop
    if btrim(coalesce(v_item->>'name','')) = '' then
      raise exception 'Hay una fila sin nombre de pieza';
    end if;

    v_part_id := gen_random_uuid();

    insert into public.donor_parts(
      id, vehicle_listing_id, seller_id, name, category, reference_code, price,
      condition, quantity, status, position, notes
    ) values (
      v_part_id,
      p_vehicle_listing_id,
      v_user,
      btrim(v_item->>'name'),
      nullif(btrim(v_item->>'category'),''),
      nullif(btrim(v_item->>'reference_code'),''),
      nullif(v_item->>'price','')::numeric,
      coalesce(nullif(btrim(v_item->>'condition'),''),'Usada'),
      coalesce(nullif(v_item->>'quantity','')::integer,1),
      'available',
      v_inserted,
      nullif(btrim(v_item->>'notes'),'')
    );

    insert into public.donor_part_private(
      donor_part_id, seller_id, internal_sku, storage_location, purchase_price,
      private_notes, batch_id
    ) values (
      v_part_id,
      v_user,
      nullif(btrim(v_item->>'internal_sku'),''),
      nullif(btrim(v_item->>'storage_location'),''),
      nullif(v_item->>'purchase_price','')::numeric,
      nullif(btrim(v_item->>'private_notes'),''),
      v_batch
    );

    v_inserted := v_inserted + 1;
  end loop;

  update public.inventory_batches
  set row_count = v_inserted
  where id = v_batch;

  return query select v_batch, v_inserted;
end
$$;

revoke all on function public.pro_import_inventory(uuid,text,text,jsonb) from public;
grant execute on function public.pro_import_inventory(uuid,text,text,jsonb) to authenticated;
