-- REP v1.0 cloud state
create table if not exists public.rep_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  client_updated_at bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.rep_state enable row level security;

drop policy if exists "rep_state_select_own" on public.rep_state;
create policy "rep_state_select_own" on public.rep_state for select to authenticated using (auth.uid() = user_id);

drop policy if exists "rep_state_insert_own" on public.rep_state;
create policy "rep_state_insert_own" on public.rep_state for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "rep_state_update_own" on public.rep_state;
create policy "rep_state_update_own" on public.rep_state for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.rep_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists rep_state_touch_updated_at on public.rep_state;
create trigger rep_state_touch_updated_at before update on public.rep_state
for each row execute function public.rep_touch_updated_at();
