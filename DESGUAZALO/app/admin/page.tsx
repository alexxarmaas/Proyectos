"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

type AdminListing = { id:string; title:string; seller_id:string; status:string; hidden:boolean; created_at:string };
type AdminProfile = { id:string; display_name:string; location:string|null; is_admin:boolean; created_at:string };
type AdminReport = { id:string; listing_id:string; reason:string; status:string; created_at:string };
type AdminRequest = { id:string; title:string; requester_id:string; status:string; created_at:string };
type ProductEvent = { id:string; name:string; created_at:string };
type BetaFeedback = { id:string; category:string; attempted:string; happened:string; suggestion:string|null; page_url:string; created_at:string };

export default function AdminPage(){
  const router=useRouter();
  const supabase=getBrowserSupabase();
  const [allowed,setAllowed]=useState<boolean|null>(()=>supabase?null:false);
  const [listings,setListings]=useState<AdminListing[]>([]);
  const [users,setUsers]=useState<AdminProfile[]>([]);
  const [reports,setReports]=useState<AdminReport[]>([]);
  const [requests,setRequests]=useState<AdminRequest[]>([]);
  const [events,setEvents]=useState<ProductEvent[]>([]);
  const [feedback,setFeedback]=useState<BetaFeedback[]>([]);

  useEffect(()=>{
    if(!supabase)return;
    void (async()=>{
      const {data:auth}=await supabase.auth.getUser();
      if(!auth.user){router.replace("/login?next=/admin");return;}
      const {data:me}=await supabase.from("profiles").select("is_admin").eq("id",auth.user.id).single();
      if(!me?.is_admin){setAllowed(false);return;}
      setAllowed(true);
      const since=new Date(Date.now()-7*86_400_000).toISOString();
      const [l,u,r,q,e,f]=await Promise.all([
        supabase.from("listings").select("id,title,seller_id,status,hidden,created_at").order("created_at",{ascending:false}).limit(100),
        supabase.from("profiles").select("id,display_name,location,is_admin,created_at").order("created_at",{ascending:false}).limit(100),
        supabase.from("reports").select("id,listing_id,reason,status,created_at").order("created_at",{ascending:false}).limit(100),
        supabase.from("part_requests").select("id,title,requester_id,status,created_at").order("created_at",{ascending:false}).limit(100),
        supabase.from("product_events").select("id,name,created_at").gte("created_at",since).order("created_at",{ascending:false}).limit(1000),
        supabase.from("beta_feedback").select("id,category,attempted,happened,suggestion,page_url,created_at").order("created_at",{ascending:false}).limit(50)
      ]);
      setListings((l.data??[]) as AdminListing[]);
      setUsers((u.data??[]) as AdminProfile[]);
      setReports((r.data??[]) as AdminReport[]);
      setRequests((q.data??[]) as AdminRequest[]);
      setEvents((e.data??[]) as ProductEvent[]);
      setFeedback((f.data??[]) as BetaFeedback[]);
    })();
  },[router,supabase]);

  async function toggleHidden(row:AdminListing){if(!supabase)return;const {error}=await supabase.from("listings").update({hidden:!row.hidden}).eq("id",row.id);if(!error)setListings(prev=>prev.map(x=>x.id===row.id?{...x,hidden:!x.hidden}:x));}
  async function deleteListing(id:string){if(!supabase||!confirm("¿Eliminar este contenido de forma permanente?"))return;const {data:images}=await supabase.from("listing_images").select("storage_path").eq("listing_id",id);const paths=(images??[]).map(image=>image.storage_path).filter(Boolean);if(paths.length)await supabase.storage.from("listing-images").remove(paths);const {error}=await supabase.from("listings").delete().eq("id",id);if(!error)setListings(prev=>prev.filter(x=>x.id!==id));}
  async function resolve(id:string){if(!supabase)return;const {error}=await supabase.from("reports").update({status:"resolved",resolved_at:new Date().toISOString()}).eq("id",id);if(!error)setReports(prev=>prev.map(x=>x.id===id?{...x,status:"resolved"}:x));}
  async function closeRequest(id:string){if(!supabase)return;const {error}=await supabase.from("part_requests").update({status:"closed"}).eq("id",id);if(!error)setRequests(prev=>prev.map(x=>x.id===id?{...x,status:"closed"}:x));}
  async function deleteRequest(id:string){if(!supabase||!confirm("¿Eliminar esta solicitud?"))return;const {error}=await supabase.from("part_requests").delete().eq("id",id);if(!error)setRequests(prev=>prev.filter(x=>x.id!==id));}

  if(allowed===null)return <div className="shell account-page loading-block">Comprobando permisos…</div>;
  if(!allowed)return <div className="shell account-page"><div className="empty-state"><h1>Acceso restringido</h1><p>Esta zona está reservada a administradores.</p></div></div>;

  const active=listings.filter(x=>!x.hidden&&x.status!=="sold").length;
  const sold=listings.filter(x=>x.status==="sold").length;
  const open=reports.filter(x=>x.status==="open").length;
  const wanted=requests.filter(x=>x.status==="open").length;
  const eventCount=(name:string)=>events.filter(event=>event.name===name).length;
  const searches=eventCount("search");
  const listingOpens=eventCount("listing_open");
  const favorites=eventCount("favorite");
  const contacts=eventCount("contact_whatsapp")+eventCount("contact_phone");
  const publishStarted=eventCount("publish_started");
  const publishCompleted=eventCount("publish_completed");

  return <div className="shell admin-page">
    <div className="admin-head"><span className="kicker">BACKOFFICE</span><h1>Panel de control</h1><p>Moderación de anuncios, solicitudes y reportes.</p></div>
    <div className="stats-grid"><div><span>Usuarios</span><strong>{users.length}</strong></div><div><span>Anuncios activos</span><strong>{active}</strong></div><div><span>Vendidos</span><strong>{sold}</strong></div><div><span>Se busca abiertos</span><strong>{wanted}</strong></div></div>

    <section className="admin-section">
      <div className="admin-section-head"><div><span className="kicker">ÚLTIMOS 7 DÍAS</span><h2>Uso de la beta</h2></div><span>{events.length} eventos</span></div>
      <div className="stats-grid">
        <div><span>Búsquedas</span><strong>{searches}</strong></div>
        <div><span>Fichas abiertas</span><strong>{listingOpens}</strong></div>
        <div><span>Favoritos</span><strong>{favorites}</strong></div>
        <div><span>Contactos</span><strong>{contacts}</strong></div>
      </div>
      <p className="admin-funnel-note">Publicación: <strong>{publishCompleted}</strong> completadas de <strong>{publishStarted}</strong> iniciadas · Solicitudes: <strong>{eventCount("request_created")}</strong> · Importaciones Pro: <strong>{eventCount("pro_csv_import")}</strong></p>
    </section>

    <section className="admin-section"><h2>Feedback beta</h2><div className="admin-table">{feedback.length?feedback.map(item=><div className="admin-row admin-feedback-row" key={item.id}><div><strong>{item.category.toUpperCase()} · {item.attempted}</strong><span>{item.happened}</span>{item.suggestion&&<span>Mejoraría: {item.suggestion}</span>}<code>{item.page_url}</code></div><time>{new Date(item.created_at).toLocaleDateString("es-ES")}</time></div>):<p>Todavía no hay feedback.</p>}</div></section>

    <section className="admin-section"><h2>Reportes</h2><div className="admin-table">{reports.length?reports.map(r=><div className="admin-row" key={r.id}><div><strong>{r.reason}</strong><span>Anuncio {r.listing_id.slice(0,8)} · {r.status}</span></div>{r.status==="open"&&<button onClick={()=>resolve(r.id)}>Resolver</button>}</div>):<p>Sin reportes.</p>}</div></section>

    <section className="admin-section"><h2>Solicitudes “Se busca”</h2><div className="admin-table">{requests.length?requests.map(r=><div className="admin-row" key={r.id}><div><strong>{r.title}</strong><span>{r.status} · usuario {r.requester_id.slice(0,8)}</span></div><div>{r.status==="open"&&<button onClick={()=>closeRequest(r.id)}>Cerrar</button>}<button className="danger-link" onClick={()=>deleteRequest(r.id)}>Eliminar</button></div></div>):<p>Sin solicitudes.</p>}</div></section>

    <section className="admin-section"><h2>Publicaciones</h2><div className="admin-table">{listings.map(l=><div className="admin-row" key={l.id}><div><strong>{l.title}</strong><span>{l.status} · {l.hidden?"oculta":"visible"}</span></div><div><button onClick={()=>toggleHidden(l)}>{l.hidden?"Mostrar":"Ocultar"}</button><button className="danger-link" onClick={()=>deleteListing(l.id)}>Eliminar</button></div></div>)}</div></section>

    <section className="admin-section"><h2>Usuarios</h2><div className="admin-table">{users.map(u=><div className="admin-row" key={u.id}><div><strong>{u.display_name}</strong><span>{u.location||"Sin ubicación"}{u.is_admin?" · admin":""}</span></div><code>{u.id.slice(0,8)}</code></div>)}</div></section>
  </div>;
}
