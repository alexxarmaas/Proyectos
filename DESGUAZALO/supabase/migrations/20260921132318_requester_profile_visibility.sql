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
  or exists (
    select 1 from public.part_requests r
    where r.requester_id = profiles.id and r.status = 'open'
  )
);
