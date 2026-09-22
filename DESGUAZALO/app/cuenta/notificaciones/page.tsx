"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountTabs } from "@/components/AccountTabs";
import { relativeDate } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase";
import type { NotificationItem } from "@/lib/types";

function kindLabel(kind:NotificationItem["kind"]){
  if(kind==="request_match")return "Coincidencia";
  if(kind==="saved_search_match")return "Alerta";
  return "DESGUÁZALO";
}

export default function NotificationsPage(){
  const router=useRouter();
  const supabase=getBrowserSupabase();
  const [rows,setRows]=useState<NotificationItem[]>([]);
  const [loading,setLoading]=useState(true);

  async function load(){
    if(!supabase){setLoading(false);return;}
    const {data:auth}=await supabase.auth.getSession();const user=auth.session?.user;
    if(!user){router.replace("/login?next=/cuenta/notificaciones");return;}
    const {data}=await supabase.from("notifications").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100);
    setRows((data??[]) as NotificationItem[]);setLoading(false);
  }

  useEffect(()=>{void load();},[supabase]);

  async function read(id:string){
    if(!supabase)return;
    const now=new Date().toISOString();
    const {error}=await supabase.from("notifications").update({read_at:now}).eq("id",id);
    if(!error)setRows(prev=>prev.map(x=>x.id===id?{...x,read_at:now}:x));
  }

  async function readAll(){
    if(!supabase)return;
    const now=new Date().toISOString();
    const {error}=await supabase.from("notifications").update({read_at:now}).is("read_at",null);
    if(!error)setRows(prev=>prev.map(x=>({...x,read_at:x.read_at??now})));
  }

  async function clearRead(){
    if(!supabase)return;
    const ids=rows.filter(x=>x.read_at).map(x=>x.id);if(!ids.length)return;
    const {error}=await supabase.from("notifications").delete().in("id",ids);
    if(!error)setRows(prev=>prev.filter(x=>!ids.includes(x.id)));
  }

  const unread=rows.filter(x=>!x.read_at).length;
  return <div className="shell account-page">
    <div className="account-head"><div><span className="kicker">ACTIVIDAD</span><h1>Notificaciones</h1><p className="muted">Coincidencias de “Se busca” y novedades de tus búsquedas guardadas.</p></div><div className="notification-actions">{unread>0&&<button className="button button-small" type="button" onClick={()=>void readAll()}>Marcar todo leído</button>}{rows.some(x=>x.read_at)&&<button className="button button-small button-ghost" type="button" onClick={()=>void clearRead()}>Limpiar leídas</button>}</div></div>
    <AccountTabs active="notificaciones"/>
    {loading?<div className="loading-block">Cargando actividad…</div>:rows.length?<div className="notification-list">{rows.map(row=>
      <article key={row.id} className={"notification-row "+(!row.read_at?"unread":"")}>
        <div className="notification-dot" aria-hidden/>
        <div className="notification-copy"><div><span>{kindLabel(row.kind)}</span><time>{relativeDate(row.created_at)}</time></div><strong>{row.title}</strong>{row.body&&<p>{row.body}</p>}</div>
        <div className="notification-row-actions">{row.href?<Link href={row.href} onClick={()=>void read(row.id)}>Abrir →</Link>:!row.read_at?<button type="button" onClick={()=>void read(row.id)}>Marcar leída</button>:null}</div>
      </article>)}</div>:<div className="empty-state"><h2>Todo tranquilo por aquí.</h2><p>Cuando aparezca una pieza para una solicitud o una búsqueda guardada, la verás aquí.</p><Link href="/marketplace" className="button button-primary">Buscar piezas</Link></div>}
  </div>;
}
