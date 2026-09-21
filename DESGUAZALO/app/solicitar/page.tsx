"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { popularBrands } from "@/lib/catalog";
import { getBrowserSupabase } from "@/lib/supabase";

export default function RequestPartPage() {
  const router=useRouter(); const supabase=getBrowserSupabase();
  const [form,setForm]=useState({title:"",brand:"",model:"",generation:"",year:"",engine:"",reference_code:"",location:"",notes:""});
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);

  useEffect(()=>{if(!supabase)return;void(async()=>{const query=new URLSearchParams(window.location.search);const {data:auth}=await supabase.auth.getUser();if(!auth.user){router.replace("/login?next="+encodeURIComponent("/solicitar?"+query.toString()));return;}const {data}=await supabase.from("profiles").select("location").eq("id",auth.user.id).single();setForm((prev)=>({...prev,title:query.get("title")||prev.title,brand:query.get("brand")||prev.brand,model:query.get("model")||prev.model,year:query.get("year")||prev.year,reference_code:query.get("oem")||prev.reference_code,location:query.get("location")||data?.location||prev.location}));})();},[router,supabase]);

  async function submit(event:FormEvent){event.preventDefault();if(!supabase)return;setBusy(true);setError("");const {data:auth}=await supabase.auth.getUser();if(!auth.user)return;const {error:err}=await supabase.from("part_requests").insert({requester_id:auth.user.id,title:form.title.trim(),brand:form.brand.trim(),model:form.model.trim(),generation:form.generation.trim()||null,year:form.year?Number(form.year):null,engine:form.engine.trim()||null,reference_code:form.reference_code.trim()||null,location:form.location.trim(),notes:form.notes.trim()||null});if(err){setError(err.message);setBusy(false);return;}router.push("/se-busca");}

  return <div className="publish-shell"><div className="shell narrow"><div className="publish-head"><span className="kicker">NO ESTÁ EN STOCK</span><h1>Publica lo que buscas</h1><p>La solicitud queda visible para vendedores que puedan tener esa pieza.</p></div><form className="publish-card stack-form" onSubmit={submit}>
    <label>¿Qué pieza necesitas?<input required value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Caja de cambios DSG"/></label>
    <div className="two-cols"><label>Marca<input list="request-brands" required value={form.brand} onChange={(e)=>setForm({...form,brand:e.target.value})}/><datalist id="request-brands">{popularBrands.map((x)=><option key={x} value={x}/>)}</datalist></label><label>Modelo<input required value={form.model} onChange={(e)=>setForm({...form,model:e.target.value})}/></label></div>
    <div className="three-cols"><label>Generación<input value={form.generation} onChange={(e)=>setForm({...form,generation:e.target.value})} placeholder="AW / 6J / E46"/></label><label>Año<input inputMode="numeric" value={form.year} onChange={(e)=>setForm({...form,year:e.target.value})}/></label><label>Motor<input value={form.engine} onChange={(e)=>setForm({...form,engine:e.target.value})} placeholder="1.0 TSI"/></label></div>
    <div className="two-cols"><label>Referencia OEM <em>si la sabes</em><input value={form.reference_code} onChange={(e)=>setForm({...form,reference_code:e.target.value})}/></label><label>Zona<input required value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})}/></label></div>
    <label>Detalles <em>opcional</em><textarea rows={4} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Lado, acabado, conectores, color, observaciones…"/></label>
    {error&&<div className="form-error">{error}</div>}<button className="button button-primary" disabled={busy}>{busy?"Publicando…":"Publicar solicitud"}</button>
  </form></div></div>;
}
