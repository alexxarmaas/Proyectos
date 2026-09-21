-- Keep the basic vehicle-donor inventory available to private sellers too.
-- DESGUAZALO Pro gates batch/import tooling in the application and inventory_batches RLS.

drop trigger if exists donor_parts_require_professional on public.donor_parts;
drop function if exists private.require_professional_inventory();
