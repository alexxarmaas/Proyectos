"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

type AdminListing = { id:string; title:string; seller_id:string; status:string; hidden:boolean; created_at:string };
type AdminProfile = { id:string; display_name:string; location:string|null; is_admin:boolean; created_at:string };
type AdminReport = { id:string; listing_id:string; reason:string; status:string; created_at:string };

export default function AdminPage(){
  const [allowed,setAllowed]=useState<boolean|null>(null); const [listings,setListings]=useState<AdminListing[]>([]); const [users,setUsers]=useState<AdminProfile[]>([]); const [reports,setReports]=useState<AdminReport[]>([]);
  const supabase=getBrowserSupabase();
  useEffect(()=>{
    const client=getBrowserSupabase();
    if(!client){setAllowed(false);return;}
    void (async()=>{
      const {data:auth}=await client.auth.getUser();
      if(!auth.user){window.location.href="/login?next=/admin";return;}
      const {data:me}=await client.from("profiles").select("is_admin").eq("id",auth.user.id).single();
      if(!me?.is_admin){setAllowed(false);return;}
      setAllowed(true);
      const [l,u,r]=await Promise.all([client.from("listings").select("id,title,seller_id,status,hidden,created_at").order("created_at",{ascending:false}).limit(100),client.from("profiles").select("id,display_name,location,is_admin,created_at").order("created_at",{ascending:false}).limit(100),client.from("reports").select("id,listing_id,reason,status,created_at").order("created_at",{ascending:false}).limit(100)]);
      setListings((l.data??[]) as AdminListing[]);setUsers((u.data??[]) as AdminProfile[]);setReports((r.data??[]) as AdminReport[]);
    })();
  },[]);
  async function toggleHidden(row:AdminListing){if(!supabase)return;const {error}=await supabase.from("listings").update({hidden:!row.hidden}).eq("id",row.id);if(!error)setListings(prev=>prev.map(x=>x.id===row.id?{...x,hidden:!x.hidden}:x));}
  async function deleteListing(id:string){if(!supabase||!confirm("Eliminar este contenido de forma permanente?"))return;const {data:images}=await supabase.from("listing_images").select("storage_path").eq("listing_id",id);const paths=(images??[]).map(image=>image.storage_path).filter(Boolean);if(paths.length)await supabase.storage.from("listing-images").remove(paths);const {error}=await supabase.from("listings").delete().eq("id",id);if(!error)setListings(prev=>prev.filter(x=>x.id!==id));}
  async function resolve(id:string){if(!supabase)return;const {error}=await supabase.from("reports").update({status:"resolved",resolved_at:new Date().toISOString()}).eq("id",id);if(!error)setReports(prev=>prev.map(x=>x.id===id?{...x,status:"resolved"}:x));}
  if(allowed===null)return <div className="shell account-page loading-block">Comprobando permisos…</div>;
  if(!allowed)return <div className="shell account-page"><div className="empty-state"><h1>Acceso restringido</h1><p>Esta zona está reservada a administradores.</p></div></div>;
  const active=listings.filter(x=>!x.hidden&&x.status!=="sold").length; const sold=listings.filter(x=>x.status==="sold").length; const open=reports.filter(x=>x.status==="open").length;
  return <div className="shell admin-page"><div className="admin-head"><span className="kicker">BACKOFFICE</span><h1>Panel de control</h1><p>Moderación mínima para operar el MVP con usuarios reales.</p></div><div className="stats-grid"><div><span>Usuarios</span><strong>{users.length}</strong></div><div><span>Anuncios activos</span><strong>{active}</strong></div><div><span>Vendidos</span><strong>{sold}</strong></div><div><span>Reportes abiertos</span><strong>{open}</strong></div></div>
  <section className="admin-section"><h2>Reportes</h2><div className="admin-table">{reports.length?reports.map(r=><div className="admin-row" key={r.id}><div><strong>{r.reason}</strong><span>Anuncio {r.listing_id.slice(0,8)} · {r.status}</span></div>{r.status==="open"&&<button onClick={()=>resolve(r.id)}>Resolver</button>}</div>):<p>Sin reportes.</p>}</div></section>
  <section className="admin-section"><h2>Publicaciones</h2><div className="admin-table">{listings.map(l=><div className="admin-row" key={l.id}><div><strong>{l.title}</strong><span>{l.status} · {l.hidden?"oculta":"visible"}</span></div><div><button onClick={()=>toggleHidden(l)}>{l.hidden?"Mostrar":"Ocultar"}</button><button className="danger-link" onClick={()=>deleteListing(l.id)}>Eliminar</button></div></div>)}</div></section>
  <section className="admin-section"><h2>Usuarios</h2><div className="admin-table">{users.map(u=><div className="admin-row" key={u.id}><div><strong>{u.display_name}</strong><span>{u.location||"Sin ubicación"}{u.is_admin?" · admin":""}</span></div><code>{u.id.slice(0,8)}</code></div>)}</div></section></div>;
}
