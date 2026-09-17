"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { getBrowserSupabase } from "@/lib/supabase";
import type { Listing } from "@/lib/types";

export default function FavoritesPage() {
  const router = useRouter();
  const supabase = getBrowserSupabase();
  const [rows, setRows] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(() => Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace("/login?next=/cuenta/favoritos"); return; }
      const { data } = await supabase.from("favorites").select("listing:listings(*, listing_images(public_url, position), seller:profiles!listings_seller_id_fkey(id, display_name, location, phone, whatsapp, avatar_url))").eq("user_id", auth.user.id).order("created_at", { ascending: false });
      const listings = (data ?? []).map((row) => row.listing).filter(Boolean) as unknown as Listing[];
      setRows(listings);
      setLoading(false);
    })();
  }, [router, supabase]);

  return <div className="shell account-page"><div className="account-head"><div><span className="kicker">GUARDADOS</span><h1>Favoritos</h1></div></div><div className="account-tabs"><Link href="/cuenta/anuncios">Anuncios</Link><Link className="active" href="/cuenta/favoritos">Favoritos</Link><Link href="/cuenta/perfil">Perfil</Link></div>{loading ? <div className="loading-block">Cargando favoritos…</div> : rows.length ? <div className="listing-grid">{rows.map((x) => <ListingCard key={x.id} listing={x} />)}</div> : <div className="empty-state"><h2>Tu estantería está vacía.</h2><p>Guarda piezas desde su ficha para volver a ellas luego.</p><Link href="/marketplace" className="button button-primary">Buscar piezas</Link></div>}</div>;
}
