create index if not exists part_requests_requester_idx on public.part_requests(requester_id);

drop policy if exists "Users manage own garage" on public.user_vehicles;
create policy "Users manage own garage" on public.user_vehicles for all
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Open requests are public" on public.part_requests;
create policy "Open requests are public" on public.part_requests for select
using (status = 'open' or requester_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users create own requests" on public.part_requests;
create policy "Users create own requests" on public.part_requests for insert
with check (requester_id = (select auth.uid()));

drop policy if exists "Users manage own requests" on public.part_requests;
create policy "Users manage own requests" on public.part_requests for update
using (requester_id = (select auth.uid()) or private.is_admin())
with check (requester_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users delete own requests" on public.part_requests;
create policy "Users delete own requests" on public.part_requests for delete
using (requester_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users manage own saved searches" on public.saved_searches;
create policy "Users manage own saved searches" on public.saved_searches for all
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Profiles visible when relevant" on public.profiles;
create policy "Profiles visible when relevant" on public.profiles for select
using (
  id = (select auth.uid())
  or private.is_admin()
  or exists (select 1 from public.listings l where l.seller_id = profiles.id and l.hidden = false)
  or exists (select 1 from public.part_requests r where r.requester_id = profiles.id and r.status = 'open')
);
