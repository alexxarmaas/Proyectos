"use client";

import Link from "next/link";
import { FormEvent, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfessionalShell } from "@/components/ProfessionalShell";
import { categories, conditions } from "@/lib/catalog";
import { getBrowserSupabase } from "@/lib/supabase";
import type { DonorPart, DonorPartPrivate, ListingStatus } from "@/lib/types";

type Vehicle={id:string;title:string;slug:string;brand:string;model:string;generation:string|null;year:number|null;engine:string|null;location:string};
type Published={id:string;slug:string;title:string;status:ListingStatus;hidden:boolean};
type Row=DonorPart&{private_meta:DonorPartPrivate|null;vehicle:Vehicle|null;published_listing:Published|null};

export default function ProInventoryEditPage({params}:{params:Promise<{id:string}>}){
  const {id}=use(params);const router=useRouter();const supabase=getBrowserSupabase();
  const [row,setRow]=useState<Row|null>(null);
  const [meta,setMeta]=useState({internal_sku:"",storage_location:"",purchase_price:"",private_notes:""});
  const [syncPublic,setSyncPublic]=useState(true);
  const [error,setError]=useState("");const [saved,setSaved]=useState(false);const [busy,setBusy]=useState(false);

  useEffect(()=>{if(!supabase)return;void(async()=>{
    const {data:auth}=await supabase.auth.getSession();const user=auth.session?.user;if(!user){router.replace("/login?next="+encodeURIComponent("/pro/inventario/"+id));return;}
    const {data,error:queryError}=await supabase.from("donor_parts")
      .select("*, private_meta:donor_part_private!donor_part_private_donor_part_id_fkey(donor_part_id,seller_id,internal_sku,storage_location,purchase_price,private_notes,batch_id), donor_part_images(id,public_url,position), vehicle:listings!donor_parts_vehicle_listing_id_fkey(id,title,slug,brand,model,generation,year,engine,location), published_listing:listings!donor_parts_published_listing_id_fkey(id,slug,title,status,hidden)")
      .eq("id",id).eq("seller_id",user.id).maybeSingle();
    if(queryError||!data){setError("No existe esta pieza o no tienes acceso.");return;}
    const typed=data as unknown as Row;setRow(typed);setMeta({internal_sku:typed.private_meta?.internal_sku??"",storage_location:typed.private_meta?.storage_location??"",purchase_price:typed.private_meta?.purchase_price===null||typed.private_meta?.purchase_price===undefined?"":String(typed.private_meta.purchase_price),private_notes:typed.private_meta?.private_notes??""});
  })();},[id,router,supabase]);

  async function save(event:FormEvent){
    event.preventDefault();if(!supabase||!row)return;setBusy(true);setError("");setSaved(false);
    const purchase=meta.purchase_price.trim()?Number(meta.purchase_price.replace(",",".")):null;
    if(purchase!==null&&(!Number.isFinite(purchase)||purchase<0)){setError("El coste no es válido.");setBusy(false);return;}
    try{
      const {data:auth}=await supabase.auth.getSession();const user=auth.session?.user;if(!user)throw new Error("Sesión caducada.");
      const {error:publicError}=await supabase.from("donor_parts").update({name:row.name.trim(),category:row.category,reference_code:row.reference_code,price:row.price,condition:row.condition,quantity:row.quantity,notes:row.notes,status:row.status}).eq("id",row.id);if(publicError)throw publicError;
      const {error:privateError}=await supabase.from("donor_part_private").upsert({donor_part_id:row.id,seller_id:user.id,internal_sku:meta.internal_sku.trim()||null,storage_location:meta.storage_location.trim()||null,purchase_price:purchase,private_notes:meta.private_notes.trim()||null},{onConflict:"donor_part_id"});if(privateError)throw privateError;
      if(syncPublic&&row.published_listing_id){
        const {error:listingError}=await supabase.from("listings").update({title:row.name.trim(),category:row.category,reference_code:row.reference_code,price:row.price,condition:row.condition,status:row.status,description:row.notes||null,updated_at:new Date().toISOString()}).eq("id",row.published_listing_id);if(listingError)throw listingError;
      }
      setSaved(true);
    }catch(caught){setError(caught instanceof Error?caught.message:"No se pudo guardar.");}
    setBusy(false);
  }

  if(error&&!row)return <ProfessionalShell active="inventory"><div className="empty-state"><h2>No se puede abrir la pieza</h2><p>{error}</p><Link href="/pro/inventario">Volver al inventario</Link></div></ProfessionalShell>;
  if(!row)return <ProfessionalShell active="inventory"><div className="loading-block">Cargando pieza…</div></ProfessionalShell>;

  return <ProfessionalShell active="inventory">
    <div className="pro-heading"><div><span className="kicker">FICHA INTERNA</span><h1>{row.name}</h1><p>{row.vehicle?[row.vehicle.brand,row.vehicle.model,row.vehicle.generation,row.vehicle.year,row.vehicle.engine].filter(Boolean).join(" · "):"Vehículo donante"}</p></div><div className="pro-heading-actions">{row.vehicle&&<Link className="button button-ghost" href={"/pieza/"+row.vehicle.slug}>Vehículo donante</Link>}{row.published_listing&&<Link className="button button-dark" href={"/pieza/"+row.published_listing.slug}>Ver anuncio</Link>}<Link className="button button-ghost" href="/pro/inventario">Volver</Link></div></div>
    <div className="pro-inline-note"><span>{row.donor_part_images?.length??0}/10 fotos asociadas a esta pieza. La carga masiva usa el SKU del nombre del archivo.</span><Link href="/pro/fotos">Gestionar fotos por SKU →</Link></div><form className="pro-editor stack-form" onSubmit={save}>
      <div className="two-cols"><label>Pieza<input required value={row.name} onChange={e=>setRow({...row,name:e.target.value})}/></label><label>Categoría<select value={row.category??"Otros"} onChange={e=>setRow({...row,category:e.target.value})}>{categories.map(x=><option key={x}>{x}</option>)}</select></label></div>
      <div className="three-cols"><label>OEM<input value={row.reference_code??""} onChange={e=>setRow({...row,reference_code:e.target.value||null})}/></label><label>SKU interno<input value={meta.internal_sku} onChange={e=>setMeta({...meta,internal_sku:e.target.value})}/></label><label>Ubicación almacén<input value={meta.storage_location} onChange={e=>setMeta({...meta,storage_location:e.target.value})} placeholder="N1-C-04"/></label></div>
      <div className="three-cols"><label>Precio venta<input type="number" min="0" step="0.01" value={row.price??""} onChange={e=>setRow({...row,price:e.target.value?Number(e.target.value):null})}/></label><label>Coste<input inputMode="decimal" value={meta.purchase_price} onChange={e=>setMeta({...meta,purchase_price:e.target.value})}/></label><label>Cantidad<input type="number" min="0" value={row.quantity} onChange={e=>setRow({...row,quantity:Number(e.target.value)})}/></label></div>
      <div className="two-cols"><label>Estado físico<select value={row.condition} onChange={e=>setRow({...row,condition:e.target.value})}>{conditions.map(x=><option key={x}>{x}</option>)}</select></label><label>Disponibilidad<select value={row.status} onChange={e=>setRow({...row,status:e.target.value as ListingStatus})}><option value="available">Disponible</option><option value="reserved">Reservada</option><option value="sold">Vendida</option></select></label></div>
      <label>Nota pública <em>visible si se publica</em><textarea rows={3} value={row.notes??""} onChange={e=>setRow({...row,notes:e.target.value||null})}/></label>
      <label>Nota privada <em>solo tu equipo</em><textarea rows={3} value={meta.private_notes} onChange={e=>setMeta({...meta,private_notes:e.target.value})}/></label>
      {row.published_listing_id&&<label className="delivery-option"><input type="checkbox" checked={syncPublic} onChange={e=>setSyncPublic(e.target.checked)}/> Sincronizar estos cambios con el anuncio público</label>}
      {error&&<div className="form-error">{error}</div>}{saved&&<div className="form-success">Ficha de inventario actualizada.</div>}
      <button className="button button-primary" disabled={busy}>{busy?"Guardando…":"Guardar cambios"}</button>
    </form>
  </ProfessionalShell>;
}
