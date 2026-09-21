-- Dashboard summary is account data; expose it only to signed-in users.

revoke execute on function public.pro_inventory_summary() from anon;
revoke execute on function public.pro_inventory_summary() from public;
grant execute on function public.pro_inventory_summary() to authenticated;
