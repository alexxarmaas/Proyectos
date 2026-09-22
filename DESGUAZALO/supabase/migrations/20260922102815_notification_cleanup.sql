-- Failed/removed listings must not leave stale notification links behind.

create or replace function private.cleanup_listing_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.notifications where listing_id = old.id;
  return old;
end
$$;

drop trigger if exists listings_cleanup_notifications on public.listings;
create trigger listings_cleanup_notifications
before delete on public.listings
for each row execute function private.cleanup_listing_notifications();
