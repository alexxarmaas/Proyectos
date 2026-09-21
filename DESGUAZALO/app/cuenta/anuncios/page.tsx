"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountTabs } from "@/components/AccountTabs";
import { formatPrice } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase";
import type { Listing, ListingStatus } from "@/lib/types";

export default function MyListingsPage() {
  const router = useRouter(); const supabase = getBrowserSupabase();
  const [rows, setRows] = useState<Listing[]>([]); const [loading, setLoading] = useState(() => Boolean(supabase));
  useEffect(() => { if (!supabase) return; void (async () => { const { data: auth } = await supabase.auth.getUser(); if (!auth.user) { router.replace("/login?next=/cuenta/anuncios"); return; } const { data } = await supabase.from("listings").select("*, listing_images(public_url, position)").eq("seller_id", auth.user.id).order("created_at", { ascending:false }); setRows((data ?? []) as unknown as Listing[]); setLoading(false); })(); }, [router, supabase]);
  async function status(id:string,value:ListingStatus){if(!supabase)return;const {error}=await supabase.from("listings").update({status:value}).eq("id",id);if(!error)setRows((prev)=>prev.map((x)=>x.id===id?{...x,status:value}:x));}
  async function remove(id:string){if(!supabase||!window.confirm("¿Eliminar definitivamente este anuncio?"))return;const {data:images}=await supabase.from("listing_images").select("storage_path").eq("listing_id",id);const paths=(images??[]).map((image)=>image.storage_path).filter(Boolean);if(paths.length)await supabase.storage.from("listing-images").remove(paths);const {error}=await supabase.from("listings").delete().eq("id",id);if(!error)setRows((prev)=>prev.filter((x)=>x.id!==id));}
  async function logout(){if(!supabase)return;await supabase.auth.signOut();router.push("/");}
  return <div className="shell account-page"><div className="account-head"><div><span className="kicker">TU STOCK</span><h1>Mis anuncios</h1></div><Link href="/publicar" className="button button-primary">+ Publicar</Link></div><AccountTabs active="anuncios" /><button type="button" className="mb-5 text-sm font-bold underline" onClick={logout}>Cerrar sesión</button>{loading?<div className="loading-block">Cargando anuncios…</div>:rows.length?<div className="my-listings">{rows.map((x)=>{const img=[...(x.listing_images??[])].sort((a,b)=>a.position-b.position)[0]?.public_url;const params=new URLSearchParams({brand:x.brand,model:x.model,location:x.location});if(x.generation)params.set("generation",x.generation);if(x.year)params.set("year",String(x.year));if(x.engine)params.set("engine",x.engine);return <article className="my-listing" key={x.id}>{img?<div className="my-listing-image"><Image src={img} fill alt={x.title} sizes="100px"/></div>:<div className="my-listing-image placeholder"/>}<div className="my-listing-main"><span className={"status status-"+x.status}>{x.status==="available"?"Disponible":x.status==="reserved"?"Reservada":"Vendida"}</span><Link href={"/pieza/"+x.slug}><h2>{x.title}</h2></Link><strong>{formatPrice(x.price)}</strong><span>{x.location}</span></div><div className="my-listing-actions"><Link href={"/cuenta/anuncios/"+x.id+"/editar"}>Editar</Link><Link href={"/publicar?"+params.toString()}>Otra de este coche</Link>{x.status!=="reserved"&&<button onClick={()=>status(x.id,"reserved")}>Reservar</button>}{x.status!=="available"&&<button onClick={()=>status(x.id,"available")}>Disponible</button>}{x.status!=="sold"&&<button onClick={()=>status(x.id,"sold")}>Vendida</button>}<button className="danger-link" onClick={()=>remove(x.id)}>Eliminar</button></div></article>})}</div>:<div className="empty-state"><h2>Aún no has publicado nada.</h2><p>Una buena foto y la referencia correcta hacen gran parte del trabajo.</p><Link href="/publicar" className="button button-primary">Publicar primera pieza</Link></div>}</div>;
}
