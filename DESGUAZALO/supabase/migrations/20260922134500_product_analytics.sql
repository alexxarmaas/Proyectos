-- First-party product analytics for the closed beta.
-- No advertising identifier or analytics cookie is required.

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null check (
    name in (
      'search',
      'listing_open',
      'favorite',
      'contact_whatsapp',
      'contact_phone',
      'publish_started',
      'publish_completed',
      'request_created',
      'pro_csv_import'
    )
  ),
  path text not null check (char_length(path) between 1 and 1000),
  target_id text check (target_id is null or char_length(target_id) <= 200),
  metadata jsonb not null default '{}'::jsonb
    check (octet_length(metadata::text) <= 4096),
  created_at timestamptz not null default now()
);

create index if not exists product_events_name_created_idx
  on public.product_events(name, created_at desc);

create index if not exists product_events_user_created_idx
  on public.product_events(user_id, created_at desc)
  where user_id is not null;

alter table public.product_events enable row level security;

drop policy if exists "Anyone submits product events" on public.product_events;
create policy "Anyone submits product events"
on public.product_events
for insert
to anon, authenticated
with check (
  user_id is null
  or user_id = (select auth.uid())
);

drop policy if exists "Admins read product events" on public.product_events;
create policy "Admins read product events"
on public.product_events
for select
to authenticated
using (private.is_admin());

revoke all on public.product_events from anon, authenticated;
grant insert on public.product_events to anon, authenticated;
grant select on public.product_events to authenticated;
