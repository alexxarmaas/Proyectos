"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProfessionalShell } from "@/components/ProfessionalShell";
import { getBrowserSupabase } from "@/lib/supabase";
import type { InventoryBatch } from "@/lib/types";

type Summary = { total:number; available:number; reserved:number; sold:number; published:number; without_price:number; without_oem:number; without_sku:number; without_storage:number; without_images:number };
type Vehicle = { id:string; title:string; slug:string; brand:string; model:string; generation:string|null; year:number|null; engine:string|null; status:string };
type PartLink = { vehicle_listing_id:string };
const zero:Summary={total:0,available:0,reserved:0,sold:0,published:0,without_price:0,without_oem:0,without_sku:0,without_storage:0,without_images:0};

export default function ProDashboardPage(){
  const supabase=getBrowserSupabase();
  const [summary,setSummary]=useState<Summary>(zero);
  const [vehicles,setVehicles]=useState<Vehicle[]>([]);
  const [parts,setParts]=useState<PartLink[]>([]);
  const [batches,setBatches]=useState<InventoryBatch[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{if(!supabase){setLoading(false);return;}void(async()=>{
    const {data:auth}=await supabase.auth.getSession(); const user=auth.session?.user; if(!user)return;
    const [s,v,p,b]=await Promise.all([
      supabase.rpc("pro_inventory_summary"),
      supabase.from("listings").select("id,title,slug,brand,model,generation,year,engine,status").eq("seller_id",user.id).eq("type","vehicle").eq("hidden",false).order("created_at",{ascending:false}),
      supabase.from("donor_parts").select("vehicle_listing_id").eq("seller_id",user.id),
      supabase.from("inventory_batches").select("*").eq("seller_id",user.id).order("created_at",{ascending:false}).limit(6)
    ]);
    if(s.data?.[0])setSummary(Object.fromEntries(Object.entries(s.data[0]).map(([k,val])=>[k,Number(val)])) as unknown as Summary);
    setVehicles((v.data??[]) as Vehicle[]); setParts((p.data??[]) as PartLink[]); setBatches((b.data??[]) as InventoryBatch[]); setLoading(false);
  })();},[supabase]);

  const perVehicle=useMemo(()=>{const map:Record<string,number>={};for(const row of parts)map[row.vehicle_listing_id]=(map[row.vehicle_listing_id]??0)+1;return map;},[parts]);
  const completeness=summary.total?Math.round(((summary.total-summary.without_price)+(summary.total-summary.without_oem)+(summary.total-summary.without_sku)+(summary.total-summary.without_storage)+(summary.total-summary.without_images))/(summary.total*5)*100):0;

  return <ProfessionalShell active="dashboard">
    <div className="pro-heading"><div><h1>Panel profesional</h1><p>Stock, calidad de datos y vehículos donantes en un solo sitio.</p></div><div className="pro-heading-actions"><Link href="/pro/lote" className="button button-dark">+ Añadir lote</Link><Link href="/pro/importar" className="button button-ghost">Importar CSV</Link><Link href="/pro/fotos" className="button button-primary">Fotos por SKU</Link></div></div>
    {loading?<div className="loading-block">Calculando inventario…</div>:<>
      <section className="pro-stats">
        <div><span>Inventario</span><strong>{summary.total}</strong><small>{summary.available} disponibles</small></div>
        <div><span>Publicadas</span><strong>{summary.published}</strong><small>{summary.total-summary.published} aún internas</small></div>
        <div><span>Vendidas</span><strong>{summary.sold}</strong><small>{summary.reserved} reservadas</small></div>
        <div><span>Datos completos</span><strong>{completeness}%</strong><small>precio · OEM · SKU · ubicación · fotos</small></div>
      </section>

      <section className="pro-quality">
        <div className="pro-section-title"><div><span className="kicker">CALIDAD DEL STOCK</span><h2>Qué falta por completar</h2></div><Link href="/pro/inventario">Abrir inventario →</Link></div>
        <div className="pro-quality-grid">
          <div><strong>{summary.without_price}</strong><span>sin precio</span></div><div><strong>{summary.without_oem}</strong><span>sin OEM</span></div>
          <div><strong>{summary.without_sku}</strong><span>sin SKU</span></div><div><strong>{summary.without_storage}</strong><span>sin ubicación interna</span></div><div><strong>{summary.without_images}</strong><span>sin fotos</span></div>
        </div>
      </section>

      <div className="pro-dashboard-grid">
        <section>
          <div className="pro-section-title"><div><span className="kicker">VEHÍCULOS DONANTES</span><h2>Stock por vehículo</h2></div><Link href="/publicar?type=vehicle">+ Nuevo vehículo</Link></div>
          <div className="pro-vehicle-list">{vehicles.length?vehicles.map(v=><article key={v.id}><div><Link href={"/pieza/"+v.slug}><strong>{v.title}</strong></Link><span>{[v.brand,v.model,v.generation,v.year,v.engine].filter(Boolean).join(" · ")}</span></div><div><b>{perVehicle[v.id]??0}</b><span>piezas</span><Link href={"/cuenta/anuncios/"+v.id+"/editar"}>Gestionar →</Link></div></article>):<div className="empty-state"><h3>Primero necesitas un vehículo donante</h3><p>Publica un coche para despiece y úsalo como origen de tus lotes.</p><Link href="/publicar?type=vehicle" className="button button-primary">Publicar vehículo</Link></div>}</div>
        </section>
        <section>
          <div className="pro-section-title"><div><span className="kicker">ÚLTIMAS CARGAS</span><h2>Lotes recientes</h2></div></div>
          <div className="pro-batch-list">{batches.length?batches.map(b=><article key={b.id}><div><strong>{b.source==="csv"?(b.filename||"Importación CSV"):"Carga manual"}</strong><span>{new Date(b.created_at).toLocaleString("es-ES",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span></div><b>{b.row_count} piezas</b></article>):<p className="pro-empty-copy">Todavía no has cargado ningún lote profesional.</p>}</div>
        </section>
      </div>
    </>}
  </ProfessionalShell>;
}
