-- Reduce per-row auth function evaluation in RLS and cover common foreign keys.
create index if not exists favorites_listing_idx on public.favorites(listing_id);
create index if not exists reports_listing_idx on public.reports(listing_id);
create index if not exists reports_reporter_idx on public.reports(reporter_id);

-- Split compatibility read/write policies to avoid overlapping SELECT policies.
drop policy if exists "Owners manage compatibility" on public.listing_compatibilities;
create policy "Owners insert compatibility"
on public.listing_compatibilities for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_compatibilities.listing_id
      and l.seller_id = (select auth.uid())
  )
);
create policy "Owners update compatibility"
on public.listing_compatibilities for update
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_compatibilities.listing_id
      and l.seller_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_compatibilities.listing_id
      and l.seller_id = (select auth.uid())
  )
);
create policy "Owners delete compatibility"
on public.listing_compatibilities for delete
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_compatibilities.listing_id
      and l.seller_id = (select auth.uid())
  )
);

-- Recreate policies with auth helpers wrapped in scalar subqueries so Postgres
-- evaluates them once per statement instead of once per row.
drop policy if exists "Profiles visible when relevant" on public.profiles;
create policy "Profiles visible when relevant"
on public.profiles for select
using (
  id = (select auth.uid())
  or (select private.is_admin())
  or exists (
    select 1 from public.listings l
    where l.seller_id = profiles.id and l.hidden = false
  )
);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Listings visible to marketplace owner or admin" on public.listings;
create policy "Listings visible to marketplace owner or admin"
on public.listings for select
using (hidden = false or seller_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "Users create own listings" on public.listings;
create policy "Users create own listings"
on public.listings for insert
with check (seller_id = (select auth.uid()));

drop policy if exists "Owners or admins update listings" on public.listings;
create policy "Owners or admins update listings"
on public.listings for update
using (seller_id = (select auth.uid()) or (select private.is_admin()))
with check (seller_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "Owners or admins delete listings" on public.listings;
create policy "Owners or admins delete listings"
on public.listings for delete
using (seller_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "Images visible with listing" on public.listing_images;
create policy "Images visible with listing"
on public.listing_images for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (l.hidden = false or l.seller_id = (select auth.uid()) or (select private.is_admin()))
  )
);

drop policy if exists "Owners insert listing images" on public.listing_images;
create policy "Owners insert listing images"
on public.listing_images for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id and l.seller_id = (select auth.uid())
  )
);

drop policy if exists "Owners or admins delete listing images" on public.listing_images;
create policy "Owners or admins delete listing images"
on public.listing_images for delete
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (l.seller_id = (select auth.uid()) or (select private.is_admin()))
  )
);

drop policy if exists "Compatibility visible with listing" on public.listing_compatibilities;
create policy "Compatibility visible with listing"
on public.listing_compatibilities for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_compatibilities.listing_id
      and (l.hidden = false or l.seller_id = (select auth.uid()) or (select private.is_admin()))
  )
);

drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites"
on public.favorites for select
using (user_id = (select auth.uid()));

drop policy if exists "Users create own favorites" on public.favorites;
create policy "Users create own favorites"
on public.favorites for insert
with check (user_id = (select auth.uid()));

drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites"
on public.favorites for delete
using (user_id = (select auth.uid()));

drop policy if exists "Reporter or admin reads reports" on public.reports;
create policy "Reporter or admin reads reports"
on public.reports for select
using (reporter_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "Users create own reports" on public.reports;
create policy "Users create own reports"
on public.reports for insert
with check (reporter_id = (select auth.uid()));

drop policy if exists "Admins resolve reports" on public.reports;
create policy "Admins resolve reports"
on public.reports for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Users upload inside own folder" on storage.objects;
create policy "Users upload inside own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Owners or admins delete listing files" on storage.objects;
create policy "Owners or admins delete listing files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select private.is_admin())
  )
);
