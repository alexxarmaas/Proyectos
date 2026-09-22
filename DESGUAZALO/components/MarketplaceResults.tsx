"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";
import type { Listing, ListingCompatibility, UserVehicle } from "@/lib/types";
import { ListingCard } from "./ListingCard";
import { MarketplaceMap } from "./MarketplaceMap";

function same(a?: string | null, b?: string | null) {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());
}

function fitsVehicle(compatibility: ListingCompatibility, vehicle: UserVehicle) {
  if (!same(compatibility.brand, vehicle.brand) || !same(compatibility.model, vehicle.model)) return false;
  if (compatibility.generation && vehicle.generation && !same(compatibility.generation, vehicle.generation)) return false;
  if (compatibility.engine && vehicle.engine && !same(compatibility.engine, vehicle.engine)) return false;
  if (vehicle.year && compatibility.year_from && vehicle.year < compatibility.year_from) return false;
  if (vehicle.year && compatibility.year_to && vehicle.year > compatibility.year_to) return false;
  return true;
}

function listingFits(listing: Listing, vehicles: UserVehicle[]) {
  const compatibility = listing.listing_compatibilities ?? [];
  if (compatibility.length) return compatibility.some((c) => vehicles.some((v) => fitsVehicle(c, v)));
  return vehicles.some((v) => same(v.brand, listing.brand) && same(v.model, listing.model) && (!v.generation || !listing.generation || same(v.generation, listing.generation)));
}

export function MarketplaceResults({ listings, requestHref }: { listings: Listing[]; requestHref: string }) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "compact" | "map">("grid");
  const [garageOnly, setGarageOnly] = useState(false);
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    void (async () => {
      const { data: auth } = await supabase.auth.getSession();
      const user=auth.session?.user;
      setLogged(Boolean(user));
      if (!user) return;
      const { data } = await supabase.from("user_vehicles").select("*").eq("user_id", user.id).order("is_primary", { ascending: false });
      setVehicles((data ?? []) as UserVehicle[]);
    })();
  }, []);

  const visible = useMemo(() => garageOnly ? listings.filter((listing) => listingFits(listing, vehicles)) : listings, [garageOnly, listings, vehicles]);
  const mappedCount=visible.filter(x=>typeof x.latitude==="number"&&typeof x.longitude==="number").length;

  function toggleGarage() {
    if (!logged) {
      router.push("/login?next=" + encodeURIComponent("/marketplace"));
      return;
    }
    if (!vehicles.length) {
      router.push("/cuenta/garaje");
      return;
    }
    setGarageOnly((value) => !value);
  }

  return (
    <>
      <div className="market-toolbar">
        <p className="m-0 text-sm font-semibold text-[var(--dg-muted)]"><strong className="mr-1 text-2xl font-black text-[var(--dg-ink)]">{visible.length}</strong> anuncios</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={"dg-chip " + (garageOnly ? "active" : "")} onClick={toggleGarage}>⌁ Compatible con mi garaje</button>
          <button type="button" className={"dg-chip " + (view === "grid" ? "active" : "")} onClick={() => setView("grid")}>▦ Tarjetas</button>
          <button type="button" className={"dg-chip " + (view === "compact" ? "active" : "")} onClick={() => setView("compact")}>☰ Compacta</button>
          {mappedCount>0&&<button type="button" className={"dg-chip " + (view === "map" ? "active" : "")} onClick={() => setView("map")}>⌖ Mapa · {mappedCount}</button>}
        </div>
      </div>

      {visible.length ? (
        view==="map"?<MarketplaceMap listings={visible}/>:<div className={view === "grid" ? "grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3" : "compact-grid"}>
          {visible.map((listing) => <ListingCard key={listing.id} listing={listing} compact={view === "compact"} />)}
        </div>
      ) : (
        <div className="dg-panel p-8 text-center sm:p-10">
          <h2 className="font-racing text-2xl font-black uppercase text-[var(--dg-ink)]">No aparece esa pieza</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--dg-muted)]">Prueba otra referencia o publica lo que necesitas para que un vendedor pueda encontrarte.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href={requestHref} className="button button-primary">Publicar lo que busco</Link>
            <Link href="/marketplace" className="button button-ghost">Limpiar filtros</Link>
          </div>
        </div>
      )}
    </>
  );
}
