"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProfessionalShell } from "@/components/ProfessionalShell";
import { formatPrice } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase";
import type { DonorPart, ListingStatus } from "@/lib/types";

type Vehicle = { id:string; title:string; slug:string; brand:string; model:string; generation:string|null; year:number|null; engine:string|null; location:string };
type Published = { id:string; slug:string; title:string; status:ListingStatus; hidden:boolean };
type InventoryRow = DonorPart & { vehicle:Vehicle|null; published_listing:Published|null };

function chunks<T>(items:T[],size=100){const out:T[][]=[];for(let i=0;i<items.length;i+=size)out.push(items.slice(i,i+size));return out;}
function quality(row:InventoryRow){const meta=row.private_meta;const fields=[row.price!==null,Boolean(row.reference_code?.trim()),Boolean(meta?.internal_sku?.trim()),Boolean(meta?.storage_location?.trim()),Boolean(row.category),Boolean(row.condition),Boolean(row.donor_part_images?.length)];return Math.round(fields.filter(Boolean).length/fields.length*100);}
function vehicleLabel(row:InventoryRow){return row.vehicle?[row.vehicle.brand,row.vehicle.model,row.vehicle.generation,row.vehicle.year,row.vehicle.engine].filter(Boolean).join(" · "):"Vehículo no disponible";}

export default function ProfessionalInventoryPage(){
  const supabase=getBrowserSupabase();
  const [rows,setRows]=useState<InventoryRow[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("");
  const [bulkPrice,setBulkPrice]=useState("");
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState<{type:"ok"|"error";text:string}|null>(null);

  async function load(){
    if(!supabase){setLoading(false);return;}
    const {data:auth}=await supabase.auth.getSession(); const user=auth.session?.user; if(!user)return;
    const all:InventoryRow[]=[]; let offset=0;
    while(true){
      const {data,error}=await supabase.from("donor_parts")
        .select("*, private_meta:donor_part_private!donor_part_private_donor_part_id_fkey(donor_part_id,seller_id,internal_sku,storage_location,purchase_price,private_notes,batch_id), donor_part_images(id,public_url,position), vehicle:listings!donor_parts_vehicle_listing_id_fkey(id,title,slug,brand,model,generation,year,engine,location), published_listing:listings!donor_parts_published_listing_id_fkey(id,slug,title,status,hidden)")
        .eq("seller_id",user.id).order("created_at",{ascending:false}).range(offset,offset+999);
      if(error){setFeedback({type:"error",text:error.message});break;}
      const batch=(data??[]) as unknown as InventoryRow[]; all.push(...batch);
      if(batch.length<1000)break; offset+=1000;
    }
    setRows(all);setLoading(false);
  }

  useEffect(()=>{void load();},[supabase]);

  const visible=useMemo(()=>{
    const needle=search.trim().toLowerCase();
    return rows.filter(row=>{
      if(statusFilter&&row.status!==statusFilter)return false;
      if(!needle)return true;
      const hay=[row.name,row.private_meta?.internal_sku,row.reference_code,row.private_meta?.storage_location,row.category,row.condition,row.vehicle?.title,vehicleLabel(row)].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
  },[rows,search,statusFilter]);

  const selectedRows=useMemo(()=>rows.filter(row=>selected.includes(row.id)),[rows,selected]);
  const allVisibleSelected=visible.length>0&&visible.every(row=>selected.includes(row.id));

  function toggleAll(){setSelected(allVisibleSelected?selected.filter(id=>!visible.some(row=>row.id===id)):Array.from(new Set([...selected,...visible.map(row=>row.id)])));}
  function toggle(id:string){setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}

  async function setStatus(value:ListingStatus){
    if(!supabase||!selected.length)return;setBusy(true);setFeedback(null);
    try{
      for(const ids of chunks(selected)) { const {error}=await supabase.from("donor_parts").update({status:value}).in("id",ids); if(error)throw error; }
      const published=selectedRows.map(x=>x.published_listing_id).filter((x):x is string=>Boolean(x));
      for(const ids of chunks(published)){const {error}=await supabase.from("listings").update({status:value}).in("id",ids);if(error)throw error;}
      setRows(prev=>prev.map(row=>selected.includes(row.id)?{...row,status:value,published_listing:row.published_listing?{...row.published_listing,status:value}:null}:row));
      setFeedback({type:"ok",text:selected.length+" piezas actualizadas."});
    }catch(error){setFeedback({type:"error",text:error instanceof Error?error.message:"No se pudo actualizar el estado."});}
    setBusy(false);
  }

  async function applyPrice(){
    const value=Number(bulkPrice.replace(",","."));
    if(!supabase||!selected.length||!Number.isFinite(value)||value<0){setFeedback({type:"error",text:"Indica un precio válido."});return;}
    setBusy(true);setFeedback(null);
    try{
      for(const ids of chunks(selected)){const {error}=await supabase.from("donor_parts").update({price:value}).in("id",ids);if(error)throw error;}
      const published=selectedRows.map(x=>x.published_listing_id).filter((x):x is string=>Boolean(x));
      for(const ids of chunks(published)){const {error}=await supabase.from("listings").update({price:value}).in("id",ids);if(error)throw error;}
      setRows(prev=>prev.map(row=>selected.includes(row.id)?{...row,price:value}:row));setBulkPrice("");
      setFeedback({type:"ok",text:"Precio aplicado a "+selected.length+" piezas."});
    }catch(error){setFeedback({type:"error",text:error instanceof Error?error.message:"No se pudo cambiar el precio."});}
    setBusy(false);
  }

  async function publishSelected(){
    if(!supabase||!selected.length)return;
    const targets=selectedRows.filter(row=>!row.published_listing_id);
    if(!targets.length){setFeedback({type:"error",text:"La selección ya está publicada."});return;}
    const incomplete=targets.filter(row=>!row.vehicle||!row.category||row.price===null||!(row.donor_part_images?.length));
    if(incomplete.length){setFeedback({type:"error",text:incomplete.length+" piezas necesitan vehículo, categoría, precio y al menos una foto antes de publicarse."});return;}
    setBusy(true);setFeedback(null);
    try{
      const {data,error}=await supabase.rpc("pro_publish_inventory",{p_donor_part_ids:targets.map(row=>row.id)});
      if(error)throw error;
      const publishedCount=Array.isArray(data)?data.length:targets.length;
      setFeedback({type:"ok",text:publishedCount+" piezas publicadas de forma atómica en el marketplace."});
      setSelected([]);await load();
    }catch(error){setFeedback({type:"error",text:error instanceof Error?error.message:"No se pudo publicar la selección."});}
    setBusy(false);
  }

  async function hideSelected(){
    if(!supabase)return;const published=selectedRows.map(x=>x.published_listing_id).filter((x):x is string=>Boolean(x));
    if(!published.length){setFeedback({type:"error",text:"No hay publicaciones en la selección."});return;}
    setBusy(true);for(const ids of chunks(published)){const {error}=await supabase.from("listings").update({hidden:true}).in("id",ids);if(error){setFeedback({type:"error",text:error.message});setBusy(false);return;}}
    setRows(prev=>prev.map(row=>selected.includes(row.id)&&row.published_listing?{...row,published_listing:{...row.published_listing,hidden:true}}:row));setFeedback({type:"ok",text:"Publicaciones ocultadas. El inventario interno se conserva."});setBusy(false);
  }

  async function showSelected(){
    if(!supabase)return;const published=selectedRows.map(x=>x.published_listing_id).filter((x):x is string=>Boolean(x));
    if(!published.length){setFeedback({type:"error",text:"No hay publicaciones en la selección."});return;}
    setBusy(true);for(const ids of chunks(published)){const {error}=await supabase.from("listings").update({hidden:false}).in("id",ids);if(error){setFeedback({type:"error",text:error.message});setBusy(false);return;}}
    setRows(prev=>prev.map(row=>selected.includes(row.id)&&row.published_listing?{...row,published_listing:{...row.published_listing,hidden:false}}:row));setFeedback({type:"ok",text:"Publicaciones visibles de nuevo."});setBusy(false);
  }

  async function deleteSelected(){
    if(!supabase||!selected.length)return;
    if(selectedRows.some(row=>row.published_listing_id)){setFeedback({type:"error",text:"Oculta o gestiona primero los anuncios publicados. Solo se eliminan piezas que siguen siendo internas."});return;}
    if(!confirm("¿Eliminar "+selected.length+" piezas del inventario?"))return;
    setBusy(true);for(const ids of chunks(selected)){const {error}=await supabase.from("donor_parts").delete().in("id",ids);if(error){setFeedback({type:"error",text:error.message});setBusy(false);return;}}
    setRows(prev=>prev.filter(row=>!selected.includes(row.id)));setSelected([]);setFeedback({type:"ok",text:"Piezas eliminadas del inventario."});setBusy(false);
  }

  return <ProfessionalShell active="inventory">
    <div className="pro-heading"><div><h1>Inventario</h1><p>{rows.length} piezas internas. Busca por SKU, OEM, vehículo o ubicación de almacén.</p></div><div className="pro-heading-actions"><Link href="/pro/lote" className="button button-dark">+ Añadir lote</Link><Link href="/pro/importar" className="button button-ghost">Importar CSV</Link><Link href="/pro/fotos" className="button button-primary">Fotos por SKU</Link></div></div>

    <div className="pro-inventory-toolbar">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar SKU, OEM, pieza, vehículo, estantería…" />
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="">Todos los estados</option><option value="available">Disponible</option><option value="reserved">Reservada</option><option value="sold">Vendida</option></select>
      <span>{visible.length} resultados</span>
    </div>

    {selected.length>0&&<div className="pro-bulkbar">
      <strong>{selected.length} seleccionadas</strong>
      <div className="pro-bulk-actions">
        <button disabled={busy} onClick={()=>void setStatus("available")}>Disponible</button><button disabled={busy} onClick={()=>void setStatus("reserved")}>Reservar</button><button disabled={busy} onClick={()=>void setStatus("sold")}>Vendida</button>
        <div className="pro-price-action"><input inputMode="decimal" value={bulkPrice} onChange={e=>setBulkPrice(e.target.value)} placeholder="Precio €"/><button disabled={busy} onClick={()=>void applyPrice()}>Aplicar</button></div>
        <button className="primary" disabled={busy} onClick={()=>void publishSelected()}>Publicar</button><button disabled={busy} onClick={()=>void showSelected()}>Mostrar</button><button disabled={busy} onClick={()=>void hideSelected()}>Ocultar</button><button className="danger" disabled={busy} onClick={()=>void deleteSelected()}>Eliminar</button>
      </div>
    </div>}

    {feedback&&<div className={feedback.type==="ok"?"form-success pro-feedback":"form-error pro-feedback"}>{feedback.text}</div>}
    {loading?<div className="loading-block">Cargando inventario…</div>:<div className="pro-table-wrap"><table className="pro-table"><thead><tr><th><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Seleccionar resultados"/></th><th>Pieza</th><th>Vehículo</th><th>OEM / SKU</th><th>Almacén</th><th>Precio</th><th>Estado</th><th>Fotos</th><th>Calidad</th><th>Publicación</th></tr></thead><tbody>
      {visible.map(row=><tr key={row.id}><td><input type="checkbox" checked={selected.includes(row.id)} onChange={()=>toggle(row.id)} aria-label={"Seleccionar "+row.name}/></td>
        <td><Link href={"/pro/inventario/"+row.id}><strong>{row.name}</strong></Link><span>{row.category||"Sin categoría"} · {row.condition||"Sin estado"}{row.quantity>1?" · "+row.quantity+" uds":""}</span></td>
        <td>{row.vehicle?<><Link href={"/pieza/"+row.vehicle.slug}>{row.vehicle.title}</Link><span>{vehicleLabel(row)}</span></>:<span>Sin vehículo</span>}</td>
        <td><code>{row.reference_code||"—"}</code><span>SKU {row.private_meta?.internal_sku||"—"}</span></td>
        <td><strong>{row.private_meta?.storage_location||"—"}</strong><span>{row.private_meta?.private_notes||""}</span></td>
        <td><strong>{formatPrice(row.price)}</strong>{row.private_meta?.purchase_price!==null&&row.private_meta?.purchase_price!==undefined&&<span>Coste {formatPrice(row.private_meta.purchase_price)}</span>}</td>
        <td><span className={"status status-"+row.status}>{row.status==="available"?"Disponible":row.status==="reserved"?"Reservada":"Vendida"}</span></td>
        <td><strong>{row.donor_part_images?.length??0}/10</strong></td>
        <td><div className="quality-meter"><i style={{width:quality(row)+"%"}}/><span>{quality(row)}%</span></div></td>
        <td>{row.published_listing?<><Link href={"/pieza/"+row.published_listing.slug}>{row.published_listing.hidden?"Oculta":"Publicada"} →</Link></>:<span className="pro-muted">Interna</span>}</td>
      </tr>)}
      {!visible.length&&<tr><td colSpan={10}><div className="pro-table-empty">No hay piezas que coincidan con los filtros.</div></td></tr>}
    </tbody></table></div>}
  </ProfessionalShell>;
}
