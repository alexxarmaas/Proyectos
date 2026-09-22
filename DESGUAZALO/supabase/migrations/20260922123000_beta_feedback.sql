-- Closed beta feedback collection. Anyone can submit, only admins can read.

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  category text not null check (category in ('bug', 'design', 'idea', 'confusing')),
  attempted text not null check (char_length(attempted) between 3 and 1000),
  happened text not null check (char_length(happened) between 3 and 1500),
  suggestion text check (suggestion is null or char_length(suggestion) <= 1500),
  page_url text not null check (char_length(page_url) between 1 and 1000),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  viewport_width integer check (viewport_width is null or viewport_width between 0 and 10000),
  viewport_height integer check (viewport_height is null or viewport_height between 0 and 10000),
  created_at timestamptz not null default now()
);

create index if not exists beta_feedback_created_idx
  on public.beta_feedback(created_at desc);

create index if not exists beta_feedback_user_idx
  on public.beta_feedback(user_id, created_at desc)
  where user_id is not null;

alter table public.beta_feedback enable row level security;

drop policy if exists "Anyone submits beta feedback" on public.beta_feedback;
create policy "Anyone submits beta feedback"
on public.beta_feedback
for insert
to anon, authenticated
with check (
  user_id is null
  or user_id = (select auth.uid())
);

drop policy if exists "Admins read beta feedback" on public.beta_feedback;
create policy "Admins read beta feedback"
on public.beta_feedback
for select
to authenticated
using (private.is_admin());

revoke all on public.beta_feedback from anon, authenticated;
grant insert on public.beta_feedback to anon, authenticated;
grant select on public.beta_feedback to authenticated;
