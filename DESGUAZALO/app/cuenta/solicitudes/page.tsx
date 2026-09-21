"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTabs } from "@/components/AccountTabs";
import { getBrowserSupabase } from "@/lib/supabase";
import type { PartRequest } from "@/lib/types";

export default function MyRequestsPage() {
  const router=useRouter(); const supabase=getBrowserSupabase();
  const [rows,setRows]=useState<PartRequest[]>([]); const [loading,setLoading]=useState(true);

  useEffect(()=>{if(!supabase){setLoading(false);return;}void(async()=>{const {data:auth}=await supabase.auth.getUser();if(!auth.user){router.replace("/login?next=/cuenta/solicitudes");return;}const {data}=await supabase.from("part_requests").select("*").eq("requester_id",auth.user.id).order("created_at",{ascending:false});setRows((data??[]) as PartRequest[]);setLoading(false);})();},[router,supabase]);

  async function status(id:string,value:"open"|"closed"){if(!supabase)return;const {error}=await supabase.from("part_requests").update({status:value}).eq("id",id);if(!error)setRows((prev)=>prev.map((x)=>x.id===id?{...x,status:value}:x));}
  async function remove(id:string){if(!supabase||!confirm("¿Eliminar esta solicitud?"))return;const {error}=await supabase.from("part_requests").delete().eq("id",id);if(!error)setRows((prev)=>prev.filter((x)=>x.id!==id));}

  return <div className="shell account-page"><div className="account-head"><div><span className="kicker">LO QUE BUSCAS</span><h1>Mis solicitudes</h1><p className="muted">Cierra una solicitud cuando ya hayas encontrado la pieza.</p></div></div><AccountTabs active="solicitudes"/>{loading?<div className="loading-block">Cargando solicitudes…</div>:rows.length?<div className="request-grid">{rows.map((row)=><article className="request-card" key={row.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><span className={"status status-"+(row.status==="open"?"available":"sold")}>{row.status==="open"?"Buscando":"Cerrada"}</span><h2 className="mt-2 text-xl">{row.title}</h2><p className="mt-1 text-sm text-[var(--dg-muted)]">{[row.brand,row.model,row.generation,row.year,row.engine].filter(Boolean).join(" · ")}</p>{row.reference_code&&<p className="mt-1 text-sm"><strong>OEM:</strong> {row.reference_code}</p>}</div><div className="flex flex-wrap gap-2">{row.status==="open"?<button className="button button-small" onClick={()=>status(row.id,"closed")}>Ya la encontré</button>:<button className="button button-small" onClick={()=>status(row.id,"open")}>Reabrir</button>}<button className="danger-link text-sm" onClick={()=>remove(row.id)}>Eliminar</button></div></div></article>)}</div>:<div className="empty-state"><h2>No tienes solicitudes</h2><p>Si una pieza no aparece en el marketplace, publícala en “Se busca”.</p><a className="button button-primary" href="/solicitar">Pedir una pieza</a></div>}</div>;
}
