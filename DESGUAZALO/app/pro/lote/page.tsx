"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfessionalShell } from "@/components/ProfessionalShell";
import { categories, conditions } from "@/lib/catalog";
import { getBrowserSupabase } from "@/lib/supabase";

type Vehicle={id:string;title:string;brand:string;model:string;generation:string|null;year:number|null;engine:string|null;location:string};
type Draft={key:string;name:string;category:string;reference_code:string;internal_sku:string;price:string;purchase_price:string;storage_location:string;condition:string;quantity:string;private_notes:string};

function makeDraft():Draft{return{key:crypto.randomUUID(),name:"",category:"Motor",reference_code:"",internal_sku:"",price:"",purchase_price:"",storage_location:"",condition:"Usada",quantity:"1",private_notes:""};}
export default function ProBatchPage(){
  const router=useRouter();const supabase=getBrowserSupabase();
  const [vehicles,setVehicles]=useState<Vehicle[]>([]);const [vehicleId,setVehicleId]=useState("");
  const [rows,setRows]=useState<Draft[]>(()=>Array.from({length:5},makeDraft));
  const [error,setError]=useState("");const [busy,setBusy]=useState(false);

  useEffect(()=>{if(!supabase)return;void(async()=>{const {data:auth}=await supabase.auth.getUser();if(!auth.user)return;const {data}=await supabase.from("listings").select("id,title,brand,model,generation,year,engine,location").eq("seller_id",auth.user.id).eq("type","vehicle").eq("hidden",false).order("created_at",{ascending:false});setVehicles((data??[]) as Vehicle[]);if(data?.[0])setVehicleId(data[0].id);})();},[supabase]);

  const selectedVehicle=useMemo(()=>vehicles.find(v=>v.id===vehicleId)??null,[vehicles,vehicleId]);
  function update(key:string,field:keyof Omit<Draft,"key">,value:string){setRows(prev=>prev.map(row=>row.key===key?{...row,[field]:value}:row));}
  function addRows(count=1){setRows(prev=>[...prev,...Array.from({length:count},makeDraft)]);}
  function duplicate(row:Draft){setRows(prev=>[...prev,{...row,key:crypto.randomUUID(),internal_sku:""}]);}
  function remove(key:string){setRows(prev=>prev.length===1?prev:prev.filter(row=>row.key!==key));}

  async function save(){
    setError("");if(!supabase||!vehicleId)return setError("Selecciona un vehículo donante.");
    const valid=rows.filter(row=>row.name.trim());
    if(!valid.length)return setError("Añade al menos una pieza.");
    const skus=valid.map(x=>x.internal_sku.trim().toLowerCase()).filter(Boolean);
    const dup=skus.find((sku,index)=>skus.indexOf(sku)!==index);if(dup)return setError("El SKU "+dup+" está repetido en el lote.");
    for(const row of valid){
      if(row.price&&(!Number.isFinite(Number(row.price.replace(",",".")))||Number(row.price.replace(",","."))<0))return setError("Revisa el precio de "+row.name+".");
      if(row.purchase_price&&(!Number.isFinite(Number(row.purchase_price.replace(",",".")))||Number(row.purchase_price.replace(",","."))<0))return setError("Revisa el coste de "+row.name+".");
      if(!Number.isInteger(Number(row.quantity))||Number(row.quantity)<0)return setError("Revisa la cantidad de "+row.name+".");
    }
    setBusy(true);
    try{
      const payload=valid.map(row=>({
        name:row.name.trim(),category:row.category||null,reference_code:row.reference_code.trim()||null,
        internal_sku:row.internal_sku.trim()||null,price:row.price?Number(row.price.replace(",",".")):null,
        purchase_price:row.purchase_price?Number(row.purchase_price.replace(",",".")):null,
        storage_location:row.storage_location.trim()||null,condition:row.condition||"Usada",
        quantity:Number(row.quantity)||0,private_notes:row.private_notes.trim()||null
      }));
      const {error:importError}=await supabase.rpc("pro_import_inventory",{p_vehicle_listing_id:vehicleId,p_source:"manual",p_filename:"",p_rows:payload});
      if(importError)throw importError;
      router.push("/pro/inventario");
    }catch(caught){setError(caught instanceof Error?caught.message:"No se pudo guardar el lote.");setBusy(false);}
  }

  return <ProfessionalShell active="batch">
    <div className="pro-heading"><div><h1>Añadir lote</h1><p>Carga muchas piezas de un mismo vehículo sin repetir marca, modelo, motor y ubicación.</p></div><Link href="/pro/inventario" className="button button-ghost">Volver al inventario</Link></div>

    {!vehicles.length?<div className="empty-state"><h2>Necesitas un vehículo donante</h2><p>Publica primero un coche para despiece. Después podrás cargar sus piezas en lote.</p><Link href="/publicar?type=vehicle" className="button button-primary">Publicar vehículo</Link></div>:<>
      <section className="pro-batch-vehicle">
        <label>Vehículo donante<select value={vehicleId} onChange={e=>setVehicleId(e.target.value)}>{vehicles.map(v=><option value={v.id} key={v.id}>{v.title}</option>)}</select></label>
        {selectedVehicle&&<div><strong>{selectedVehicle.title}</strong><span>{[selectedVehicle.brand,selectedVehicle.model,selectedVehicle.generation,selectedVehicle.year,selectedVehicle.engine,selectedVehicle.location].filter(Boolean).join(" · ")}</span></div>}
      </section>

      <div className="pro-batch-actions"><button type="button" onClick={()=>addRows(1)}>+ 1 fila</button><button type="button" onClick={()=>addRows(5)}>+ 5 filas</button><span>{rows.filter(x=>x.name.trim()).length} piezas preparadas</span></div>

      <div className="pro-table-wrap"><table className="pro-table pro-edit-table"><thead><tr><th>Pieza</th><th>Categoría</th><th>OEM</th><th>SKU</th><th>Precio</th><th>Coste</th><th>Ubicación</th><th>Estado</th><th>Uds.</th><th>Nota privada</th><th/></tr></thead><tbody>
        {rows.map(row=><tr key={row.key}>
          <td><input value={row.name} onChange={e=>update(row.key,"name",e.target.value)} placeholder="Turbo"/></td>
          <td><select value={row.category} onChange={e=>update(row.key,"category",e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></td>
          <td><input value={row.reference_code} onChange={e=>update(row.key,"reference_code",e.target.value)} placeholder="04L253016H"/></td>
          <td><input value={row.internal_sku} onChange={e=>update(row.key,"internal_sku",e.target.value)} placeholder="G7-001"/></td>
          <td><input inputMode="decimal" value={row.price} onChange={e=>update(row.key,"price",e.target.value)} placeholder="280"/></td>
          <td><input inputMode="decimal" value={row.purchase_price} onChange={e=>update(row.key,"purchase_price",e.target.value)} placeholder="80"/></td>
          <td><input value={row.storage_location} onChange={e=>update(row.key,"storage_location",e.target.value)} placeholder="N1-C-04"/></td>
          <td><select value={row.condition} onChange={e=>update(row.key,"condition",e.target.value)}>{conditions.map(x=><option key={x}>{x}</option>)}</select></td>
          <td><input inputMode="numeric" value={row.quantity} onChange={e=>update(row.key,"quantity",e.target.value)} /></td>
          <td><input value={row.private_notes} onChange={e=>update(row.key,"private_notes",e.target.value)} placeholder="Solo equipo"/></td>
          <td><div className="pro-row-actions"><button type="button" onClick={()=>duplicate(row)}>Duplicar</button><button type="button" className="danger-link" onClick={()=>remove(row.key)}>×</button></div></td>
        </tr>)}
      </tbody></table></div>
      {error&&<div className="form-error pro-feedback">{error}</div>}
      <div className="pro-savebar"><div><strong>Guardar como inventario interno</strong><span>Después podrás seleccionar y publicar las piezas que estén listas.</span></div><button className="button button-primary" type="button" onClick={()=>void save()} disabled={busy}>{busy?"Guardando lote…":"Guardar "+rows.filter(x=>x.name.trim()).length+" piezas"}</button></div>
    </>}
  </ProfessionalShell>;
}
