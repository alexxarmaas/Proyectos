-- The import RPC is intentionally callable only by signed-in users and relies on RLS plus explicit ownership checks.

alter function public.pro_import_inventory(uuid,text,text,jsonb) security invoker;
revoke execute on function public.pro_import_inventory(uuid,text,text,jsonb) from anon;
revoke execute on function public.pro_import_inventory(uuid,text,text,jsonb) from public;
grant execute on function public.pro_import_inventory(uuid,text,text,jsonb) to authenticated;
