"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountTabs } from "@/components/AccountTabs";
import { ListingCard } from "@/components/ListingCard";
import { getBrowserSupabase } from "@/lib/supabase";
import type { Listing } from "@/lib/types";

export default function FavoritesPage() {
  const router=useRouter(); const supabase=getBrowserSupabase(); const [rows,setRows]=useState<Listing[]>([]); const [loading,setLoading]=useState(()=>Boolean(supabase));
  useEffect(()=>{if(!supabase)return;void(async()=>{const {data:auth}=await supabase.auth.getUser();if(!auth.user){router.replace("/login?next=/cuenta/favoritos");return;}const {data}=await supabase.from("favorites").select("listing:listings(*, listing_images(public_url, position), listing_compatibilities(id, brand, model, generation, year_from, year_to, engine), seller:profiles!listings_seller_id_fkey(id, display_name, location, phone, whatsapp, avatar_url, seller_kind))").eq("user_id",auth.user.id).order("created_at",{ascending:false});setRows((data??[]).map((row)=>row.listing).filter(Boolean) as unknown as Listing[]);setLoading(false);})();},[router,supabase]);
  return <div className="shell account-page"><div className="account-head"><div><span className="kicker">GUARDADOS</span><h1>Favoritos</h1></div></div><AccountTabs active="favoritos" />{loading?<div className="loading-block">Cargando favoritos…</div>:rows.length?<div className="listing-grid">{rows.map((x)=><ListingCard key={x.id} listing={x}/>)}</div>:<div className="empty-state"><h2>Tu estantería está vacía.</h2><p>Guarda piezas desde su ficha para volver a ellas luego.</p><Link href="/marketplace" className="button button-primary">Buscar piezas</Link></div>}</div>;
}
