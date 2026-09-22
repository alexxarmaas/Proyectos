"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import type { DemandPreview as DemandRow } from "@/lib/types";

function confidence(row:DemandRow){
  if(row.reasons.some(x=>x.toLowerCase().includes("oem")))return "OEM exacta";
  if(row.score>=90)return "Alta";
  if(row.score>=70)return "Compatible";
  return "Posible";
}

export function DemandPreview({title,brand,model,generation,year,engine,reference}:{title:string;brand:string;model:string;generation:string;year:string;engine:string;reference:string}){
  const [rows,setRows]=useState<DemandRow[]>([]);
  const [state,setState]=useState<"idle"|"loading"|"ready"|"error">("idle");

  async function check(){
    if(!title.trim()||!brand.trim()||!model.trim())return;
    const supabase=getBrowserSupabase();if(!supabase)return;
    setState("loading");
    const {data,error}=await supabase.rpc("request_demand_preview",{
      p_title:title.trim(),p_brand:brand.trim(),p_model:model.trim(),p_generation:generation.trim()||null,
      p_year:year?Number(year):null,p_engine:engine.trim()||null,p_reference:reference.trim()||null
    });
    if(error){setState("error");return;}
    setRows((data??[]) as DemandRow[]);setState("ready");
  }

  return <div className="demand-preview">
    <div><strong>¿Hay gente buscando esta pieza?</strong><span>Comprobamos solicitudes abiertas sin mostrar datos privados del comprador.</span></div>
    <button type="button" onClick={()=>void check()} disabled={state==="loading"||!title.trim()||!brand.trim()||!model.trim()}>{state==="loading"?"Comprobando…":"Comprobar demanda"}</button>
    {state==="ready"&&<div className="demand-results">{rows.length?<><div className="demand-count"><b>{rows.length}</b><span>solicitudes compatibles encontradas</span></div>{rows.slice(0,4).map(row=><div className="demand-row" key={row.request_id}><div><strong>{row.request_title}</strong><span>{row.location}</span></div><div><b>{confidence(row)}</b><small>{row.reasons.join(" · ")}</small></div></div>)}</>:<p>No hay solicitudes compatibles ahora mismo. Puedes publicar igualmente.</p>}</div>}
    {state==="error"&&<p className="form-error">No se pudo comprobar la demanda ahora mismo.</p>}
  </div>;
}
