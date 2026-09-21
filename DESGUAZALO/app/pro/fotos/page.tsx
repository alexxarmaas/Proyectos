"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ProfessionalShell } from "@/components/ProfessionalShell";
import { getBrowserSupabase } from "@/lib/supabase";

type StockRow={
  donor_part_id:string;
  internal_sku:string|null;
  donor:{id:string;name:string;published_listing_id:string|null}|null;
};
type ExistingImage={id:string;donor_part_id:string;position:number;public_url:string};
type Planned={
  file:File;
  donorPartId:string|null;
  sku:string|null;
  partName:string|null;
  publishedListingId:string|null;
  position:number|null;
  error:string|null;
};

const allowedTypes=new Set(["image/jpeg","image/png","image/webp"]);
const maxImageBytes=8*1024*1024;

function compact(value:string){
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
}

function stripExtension(name:string){
  const index=name.lastIndexOf(".");
  return index>0?name.slice(0,index):name;
}

export default function ProPhotosPage(){
  const supabase=getBrowserSupabase();
  const inputRef=useRef<HTMLInputElement|null>(null);
  const [stock,setStock]=useState<StockRow[]>([]);
  const [existing,setExisting]=useState<ExistingImage[]>([]);
  const [files,setFiles]=useState<File[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState<{type:"ok"|"error";text:string}|null>(null);

  async function load(){
    if(!supabase){setLoading(false);return;}
    const {data:auth}=await supabase.auth.getUser();if(!auth.user)return;
    const [{data:privateRows,error:privateError},{data:imageRows,error:imageError}]=await Promise.all([
      supabase.from("donor_part_private")
        .select("donor_part_id,internal_sku,donor:donor_parts!donor_part_private_donor_part_id_fkey(id,name,published_listing_id)")
        .eq("seller_id",auth.user.id),
      supabase.from("donor_part_images")
        .select("id,donor_part_id,position,public_url")
        .eq("seller_id",auth.user.id)
        .order("position",{ascending:true})
    ]);
    if(privateError||imageError){
      setFeedback({type:"error",text:privateError?.message||imageError?.message||"No se pudo cargar el inventario."});
      setLoading(false);return;
    }
    setStock((privateRows??[]) as unknown as StockRow[]);
    setExisting((imageRows??[]) as ExistingImage[]);
    setLoading(false);
  }

  useEffect(()=>{void load();},[supabase]);

  const indexedStock=useMemo(()=>stock.filter(row=>row.internal_sku?.trim()&&row.donor).map(row=>({
    ...row,
    normalized:compact(row.internal_sku!)
  })).sort((a,b)=>b.normalized.length-a.normalized.length),[stock]);

  const plan=useMemo<Planned[]>(()=>{
    const nextByPart=new Map<string,number>();
    for(const row of indexedStock){
      const positions=existing.filter(image=>image.donor_part_id===row.donor_part_id).map(image=>image.position);
      nextByPart.set(row.donor_part_id,positions.length?Math.max(...positions)+1:0);
    }

    return files.map(file=>{
      if(!allowedTypes.has(file.type))return{file,donorPartId:null,sku:null,partName:null,publishedListingId:null,position:null,error:"Formato no compatible"};
      if(file.size>maxImageBytes)return{file,donorPartId:null,sku:null,partName:null,publishedListingId:null,position:null,error:"Supera 8 MB"};
      const stem=compact(stripExtension(file.name));
      const match=indexedStock.find(row=>stem.startsWith(row.normalized));
      if(!match||!match.donor)return{file,donorPartId:null,sku:null,partName:null,publishedListingId:null,position:null,error:"No se encuentra un SKU al inicio del nombre"};
      const position=nextByPart.get(match.donor_part_id)??0;
      nextByPart.set(match.donor_part_id,position+1);
      if(position>9)return{file,donorPartId:match.donor_part_id,sku:match.internal_sku,partName:match.donor.name,publishedListingId:match.donor.published_listing_id,position:null,error:"La pieza ya alcanza el máximo de 10 fotos"};
      return{file,donorPartId:match.donor_part_id,sku:match.internal_sku,partName:match.donor.name,publishedListingId:match.donor.published_listing_id,position,error:null};
    });
  },[files,indexedStock,existing]);

  const valid=plan.filter(item=>!item.error&&item.donorPartId!==null&&item.position!==null);
  const invalid=plan.filter(item=>item.error);
  const grouped=useMemo(()=>{
    const map=new Map<string,{sku:string;name:string;files:Planned[]}>();
    for(const item of valid){
      const id=item.donorPartId!;
      const group=map.get(id)??{sku:item.sku??"—",name:item.partName??"Pieza",files:[]};
      group.files.push(item);map.set(id,group);
    }
    return [...map.entries()];
  },[valid]);

  function chooseFiles(event:ChangeEvent<HTMLInputElement>){
    setFeedback(null);
    const picked=Array.from(event.target.files??[]);
    if(picked.length>250){setFeedback({type:"error",text:"Carga un máximo de 250 fotos por tanda."});return;}
    setFiles(picked);
  }

  async function upload(){
    if(!supabase||!valid.length)return;
    setBusy(true);setFeedback(null);
    let uploaded=0;let failed=0;
    const {data:auth}=await supabase.auth.getUser();
    if(!auth.user){setFeedback({type:"error",text:"La sesión ha caducado."});setBusy(false);return;}

    for(const item of valid){
      const donorPartId=item.donorPartId!;
      const position=item.position!;
      const ext=item.file.name.split(".").pop()?.toLowerCase()||"jpg";
      const path=auth.user.id+"/pro/"+donorPartId+"/"+position+"-"+crypto.randomUUID()+"."+ext;
      const {error:uploadError}=await supabase.storage.from("listing-images").upload(path,item.file,{
        cacheControl:"3600",upsert:false,contentType:item.file.type
      });
      if(uploadError){failed++;continue;}

      const {data:publicData}=supabase.storage.from("listing-images").getPublicUrl(path);
      const {data:imageRow,error:rowError}=await supabase.from("donor_part_images").insert({
        donor_part_id:donorPartId,
        seller_id:auth.user.id,
        storage_path:path,
        public_url:publicData.publicUrl,
        position
      }).select("id").single();

      if(rowError||!imageRow){
        await supabase.storage.from("listing-images").remove([path]);
        failed++;continue;
      }

      if(item.publishedListingId){
        const {error:listingImageError}=await supabase.from("listing_images").insert({
          listing_id:item.publishedListingId,
          storage_path:path,
          public_url:publicData.publicUrl,
          position
        });
        if(listingImageError){
          await supabase.from("donor_part_images").delete().eq("id",imageRow.id);
          await supabase.storage.from("listing-images").remove([path]);
          failed++;continue;
        }
      }
      uploaded++;
    }

    await load();
    if(uploaded){setFiles([]);if(inputRef.current)inputRef.current.value="";}
    setFeedback({
      type:failed?"error":"ok",
      text:failed?uploaded+" fotos subidas y "+failed+" con error. Revisa la tanda antes de repetir.":uploaded+" fotos asociadas correctamente por SKU."
    });
    setBusy(false);
  }

  return <ProfessionalShell active="photos">
    <div className="pro-heading">
      <div><h1>Fotos por SKU</h1><p>Nombra las fotos con el SKU al principio y DESGUÁZALO las asignará a la pieza correcta.</p></div>
    </div>

    <section className="pro-photo-guide">
      <div><span className="kicker">CONVENCIÓN</span><strong>SKU_1.jpg · SKU_2.jpg · SKU_detalle.webp</strong><p>Ejemplo: <code>G7-001_1.jpg</code> se asociará a la pieza cuyo SKU interno sea <code>G7-001</code>.</p></div>
      <div><strong>{indexedStock.length}</strong><span>piezas con SKU</span></div>
      <div><strong>{existing.length}</strong><span>fotos ya cargadas</span></div>
    </section>

    <label className="pro-photo-drop">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseFiles}/>
      <strong>{files.length?files.length+" fotos seleccionadas":"Seleccionar fotos en lote"}</strong>
      <span>JPG, PNG o WEBP · máximo 8 MB por foto · hasta 250 por tanda</span>
    </label>

    {files.length>0&&<section className="pro-photo-review">
      <div className="pro-section-title"><div><span className="kicker">REVISIÓN</span><h2>Asignación antes de subir</h2></div><span>{valid.length} válidas · {invalid.length} con problema</span></div>

      {grouped.length>0&&<div className="pro-photo-groups">
        {grouped.map(([id,group])=><article key={id}><div><strong>{group.sku}</strong><span>{group.name}</span></div><b>{group.files.length} foto{group.files.length===1?"":"s"}</b></article>)}
      </div>}

      {invalid.length>0&&<div className="pro-photo-errors">
        {invalid.slice(0,20).map((item,index)=><div key={item.file.name+"-"+index}><strong>{item.file.name}</strong><span>{item.error}</span></div>)}
        {invalid.length>20&&<p>Y {invalid.length-20} archivos con problema más.</p>}
      </div>}

      <div className="pro-savebar">
        <div><strong>Subir {valid.length} fotos válidas</strong><span>Los archivos con error no se subirán. Las piezas publicadas recibirán también la nueva foto en su anuncio.</span></div>
        <button className="button button-primary" type="button" disabled={busy||!valid.length} onClick={()=>void upload()}>{busy?"Subiendo…":"Subir fotos"}</button>
      </div>
    </section>}

    {feedback&&<div className={feedback.type==="ok"?"form-success pro-feedback":"form-error pro-feedback"}>{feedback.text}</div>}
    {loading&&<div className="loading-block">Preparando índice de SKU…</div>}
    {!loading&&!indexedStock.length&&<div className="empty-state"><h2>No hay SKU que reconocer</h2><p>Añade SKU internos desde el inventario o importa un CSV antes de cargar fotos masivamente.</p></div>}
  </ProfessionalShell>;
}
