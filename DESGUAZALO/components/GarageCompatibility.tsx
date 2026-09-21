"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import type { ListingCompatibility, UserVehicle } from "@/lib/types";

function same(a?: string | null, b?: string | null) {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());
}

function fits(c: ListingCompatibility, v: UserVehicle) {
  if (!same(c.brand, v.brand) || !same(c.model, v.model)) return false;
  if (c.generation && v.generation && !same(c.generation, v.generation)) return false;
  if (c.engine && v.engine && !same(c.engine, v.engine)) return false;
  if (v.year && c.year_from && v.year < c.year_from) return false;
  if (v.year && c.year_to && v.year > c.year_to) return false;
  return true;
}

export function GarageCompatibility({ brand, model, generation, compatibilities }: { brand: string; model: string; generation: string | null; compatibilities: ListingCompatibility[] }) {
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setLogged(Boolean(auth.user));
      if (!auth.user) return;
      const { data } = await supabase.from("user_vehicles").select("*").eq("user_id", auth.user.id);
      setVehicles((data ?? []) as UserVehicle[]);
    })();
  }, []);

  const matches = useMemo(() => vehicles.filter((v) => {
    if (compatibilities.length) return compatibilities.some((c) => fits(c, v));
    return same(v.brand, brand) && same(v.model, model) && (!generation || !v.generation || same(v.generation, generation));
  }), [vehicles, compatibilities, brand, model, generation]);

  if (!logged) return <div className="compatibility-box neutral"><strong>¿Sirve para tu coche?</strong><p className="mt-1 text-sm text-[var(--dg-muted)]">Guarda tu coche en Mi garaje y DESGUÁZALO te ayudará a comparar compatibilidades.</p><Link className="text-sm font-bold underline" href="/login?next=/cuenta/garaje">Entrar y añadir coche</Link></div>;
  if (!vehicles.length) return <div className="compatibility-box neutral"><strong>Añade tu coche para comprobar compatibilidad</strong><p className="mt-1 text-sm text-[var(--dg-muted)]">Tardarás menos de un minuto.</p><Link className="text-sm font-bold underline" href="/cuenta/garaje">Ir a Mi garaje</Link></div>;
  if (matches.length) return <div className="compatibility-box good"><strong>✓ Coincide con {matches.length === 1 ? "un coche de tu garaje" : matches.length + " coches de tu garaje"}</strong><p className="mt-1 text-sm text-[var(--dg-muted)]">{matches.map((v) => v.nickname || (v.brand + " " + v.model)).join(", ")}. Comprueba siempre la referencia OEM antes de comprar.</p></div>;
  return <div className="compatibility-box neutral"><strong>Compatibilidad no confirmada</strong><p className="mt-1 text-sm text-[var(--dg-muted)]">No encontramos una coincidencia declarada con tu garaje. Compara referencia OEM, generación y motor con el vendedor.</p></div>;
}
