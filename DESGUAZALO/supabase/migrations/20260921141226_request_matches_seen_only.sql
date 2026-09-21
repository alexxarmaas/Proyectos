-- Request matches are system-generated. Clients may only mark them as seen.

revoke update on public.request_matches from authenticated;
grant update (seen_at) on public.request_matches to authenticated;
