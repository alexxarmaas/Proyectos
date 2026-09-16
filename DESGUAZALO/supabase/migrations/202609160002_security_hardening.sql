-- Keep SECURITY DEFINER helpers out of the exposed public API schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create or replace function private.handle_new_user()
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

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

drop policy if exists "Profiles visible when relevant" on public.profiles;
create policy "Profiles visible when relevant"
on public.profiles for select
using (
  id = auth.uid()
  or private.is_admin()
  or exists (
    select 1 from public.listings l
    where l.seller_id = profiles.id and l.hidden = false
  )
);

drop policy if exists "Listings visible to marketplace owner or admin" on public.listings;
create policy "Listings visible to marketplace owner or admin"
on public.listings for select
using (hidden = false or seller_id = auth.uid() or private.is_admin());

drop policy if exists "Owners or admins update listings" on public.listings;
create policy "Owners or admins update listings"
on public.listings for update
using (seller_id = auth.uid() or private.is_admin())
with check (seller_id = auth.uid() or private.is_admin());

drop policy if exists "Owners or admins delete listings" on public.listings;
create policy "Owners or admins delete listings"
on public.listings for delete
using (seller_id = auth.uid() or private.is_admin());

drop policy if exists "Images visible with listing" on public.listing_images;
create policy "Images visible with listing"
on public.listing_images for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (l.hidden = false or l.seller_id = auth.uid() or private.is_admin())
  )
);

drop policy if exists "Owners or admins delete listing images" on public.listing_images;
create policy "Owners or admins delete listing images"
on public.listing_images for delete
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id and (l.seller_id = auth.uid() or private.is_admin())
  )
);

drop policy if exists "Compatibility visible with listing" on public.listing_compatibilities;
create policy "Compatibility visible with listing"
on public.listing_compatibilities for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_compatibilities.listing_id
      and (l.hidden = false or l.seller_id = auth.uid() or private.is_admin())
  )
);

drop policy if exists "Reporter or admin reads reports" on public.reports;
create policy "Reporter or admin reads reports"
on public.reports for select
using (reporter_id = auth.uid() or private.is_admin());

drop policy if exists "Admins resolve reports" on public.reports;
create policy "Admins resolve reports"
on public.reports for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "Owners or admins delete listing files" on storage.objects;
create policy "Owners or admins delete listing files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or private.is_admin()
  )
);

drop function if exists public.handle_new_user();
drop function if exists public.is_admin();
