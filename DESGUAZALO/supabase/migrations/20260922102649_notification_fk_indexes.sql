-- Cover notification foreign keys used by cleanup and joins.

create index if not exists notifications_listing_idx
  on public.notifications(listing_id)
  where listing_id is not null;

create index if not exists notifications_request_idx
  on public.notifications(request_id)
  where request_id is not null;

create index if not exists notifications_saved_search_idx
  on public.notifications(saved_search_id)
  where saved_search_id is not null;
