"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfessionalShell } from "@/components/ProfessionalShell";
import { categories, conditions } from "@/lib/catalog";
import { getBrowserSupabase } from "@/lib/supabase";

type Vehicle={id:string;title:string;brand:string;model:string;generation:string|null;year:number|null;engine:string|null;location:string};
type FieldKey="name"|"category"|"reference_code"|"internal_sku"|"price"|"purchase_price"|"storage_location"|"condition"|"quantity"|"private_notes";
type Mapping=Record<FieldKey,number>;
type Prepared={line:number;name:string;category:string|null;reference_code:string|null;internal_sku:string|null;price:number|null;purchase_price:number|null;storage_location:string|null;condition:string;quantity:number;private_notes:string|null;errors:string[];warnings:string[]};

const fields:{key:FieldKey;label:string;required?:boolean}[]=[
  {key:"name",label:"Pieza",required:true},{key:"category",label:"Categoría"},{key:"reference_code",label:"OEM"},
  {key:"internal_sku",label:"SKU interno"},{key:"price",label:"Precio venta"},{key:"purchase_price",label:"Coste"},
  {key:"storage_location",label:"Ubicación almacén"},{key:"condition",label:"Estado"},{key:"quantity",label:"Cantidad"},{key:"private_notes",label:"Nota privada"}
];
const aliases:Record<FieldKey,string[]>={
  name:["pieza","part","nombre","name","articulo","artículo","descripcion","descripción"],
  category:["categoria","categoría","category","familia"],
  reference_code:["oem","referencia","reference","ref","referencia oem"],
  internal_sku:["sku","codigo","código","ref interna","referencia interna","internal sku"],
  price:["precio","price","pvp","precio venta","precio_venta"],
  purchase_price:["coste","costo","precio compra","precio_compra","purchase price"],
  storage_location:["ubicacion almacen","ubicación almacén","ubicacion_almacen","almacen","almacén","storage","estanteria","estantería"],
  condition:["estado","condition","condicion","condición"],
  quantity:["cantidad","qty","quantity","stock","uds","unidades"],
  private_notes:["nota","notas","notes","nota privada","notas privadas","private notes"]
};

function emptyMapping():Mapping{return{name:-1,category:-1,reference_code:-1,internal_sku:-1,price:-1,purchase_price:-1,storage_location:-1,condition:-1,quantity:-1,private_notes:-1};}
function normalize(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ");}
function autoMap(headers:string[]):Mapping{const map=emptyMapping();for(const field of fields){const i=headers.findIndex(h=>aliases[field.key].some(a=>normalize(h)===normalize(a)));map[field.key]=i;}return map;}
function delimiterOf(text:string){const first=text.split(/\r?\n/).find(Boolean)??"";return(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?";":",";}
function parseCsv(text:string,delimiter:string){const rows:string[][]=[];let row:string[]=[];let cell="";let quoted=false;for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===delimiter&&!quoted){row.push(cell.trim());cell="";}else if((ch==="\n"||ch==="\r")&&!quoted){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(cell.trim());cell="";if(row.some(Boolean))rows.push(row);row=[];}else cell+=ch;}row.push(cell.trim());if(row.some(Boolean))rows.push(row);return rows;}
function money(value:string){const clean=value.trim().replace(/\s/g,"").replace(/€/g,"").replace(",",".");if(!clean)return null;const n=Number(clean);return Number.isFinite(n)&&n>=0?n:NaN;}
export default function CsvImportPage(){
  const router=useRouter();const supabase=getBrowserSupabase();
  const [vehicles,setVehicles]=useState<Vehicle[]>([]);const [vehicleId,setVehicleId]=useState("");
  const [headers,setHeaders]=useState<string[]>([]);const [rawRows,setRawRows]=useState<string[][]>([]);
  const [mapping,setMapping]=useState<Mapping>(emptyMapping);const [fileName,setFileName]=useState("");
  const [existingSkus,setExistingSkus]=useState<Set<string>>(new Set());
  const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [loadingInventory,setLoadingInventory]=useState(true);

  useEffect(()=>{if(!supabase)return;void(async()=>{
    const {data:auth}=await supabase.auth.getSession();const user=auth.session?.user;if(!user)return;
    const {data:v}=await supabase.from("listings").select("id,title,brand,model,generation,year,engine,location").eq("seller_id",user.id).eq("type","vehicle").eq("hidden",false).order("created_at",{ascending:false});
    setVehicles((v??[]) as Vehicle[]);if(v?.[0])setVehicleId(v[0].id);
    const skuSet=new Set<string>();let offset=0;
    while(true){const {data}=await supabase.from("donor_part_private").select("internal_sku").eq("seller_id",user.id).not("internal_sku","is",null).range(offset,offset+999);const batch=data??[];for(const item of batch)if(item.internal_sku)skuSet.add(String(item.internal_sku).trim().toLowerCase());if(batch.length<1000)break;offset+=1000;}
    setExistingSkus(skuSet);setLoadingInventory(false);
  })();},[supabase]);

  const prepared=useMemo<Prepared[]>(()=>{
    const get=(row:string[],key:FieldKey)=>mapping[key]>=0?(row[mapping[key]]??"").trim():"";
    const skuCounts:Record<string,number>={};
    for(const row of rawRows){const sku=get(row,"internal_sku").toLowerCase();if(sku)skuCounts[sku]=(skuCounts[sku]??0)+1;}
    return rawRows.map((row,index)=>{
      const errors:string[]=[];const warnings:string[]=[];
      const name=get(row,"name");const category=get(row,"category")||null;const reference=get(row,"reference_code")||null;const sku=get(row,"internal_sku")||null;
      const price=money(get(row,"price"));const cost=money(get(row,"purchase_price"));const storage=get(row,"storage_location")||null;
      const condition=get(row,"condition")||"Usada";const qtyRaw=get(row,"quantity");const quantity=qtyRaw?Number(qtyRaw):1;const notes=get(row,"private_notes")||null;
      if(!name)errors.push("Falta pieza");
      if(Number.isNaN(price))errors.push("Precio inválido");if(Number.isNaN(cost))errors.push("Coste inválido");
      if(!Number.isInteger(quantity)||quantity<0)errors.push("Cantidad inválida");
      if(sku&&skuCounts[sku.toLowerCase()]>1)errors.push("SKU repetido en el CSV");
      if(sku&&existingSkus.has(sku.toLowerCase()))errors.push("SKU ya existe");
      if(!sku)warnings.push("Sin SKU");if(!storage)warnings.push("Sin ubicación");if(price===null)warnings.push("Sin precio");if(!reference)warnings.push("Sin OEM");
      if(category&&!categories.some(x=>normalize(x)===normalize(category)))warnings.push("Categoría no estándar");
      if(condition&&!conditions.some(x=>normalize(x)===normalize(condition)))warnings.push("Estado no estándar");
      return{line:index+2,name,category,reference_code:reference,internal_sku:sku,price:Number.isNaN(price)?null:price,purchase_price:Number.isNaN(cost)?null:cost,storage_location:storage,condition,quantity:Number.isFinite(quantity)?quantity:1,private_notes:notes,errors,warnings};
    });
  },[rawRows,mapping,existingSkus]);

  const valid=prepared.filter(row=>!row.errors.length);const errorsCount=prepared.filter(row=>row.errors.length).length;const warningsCount=prepared.reduce((sum,row)=>sum+row.warnings.length,0);

  async function readFile(event:ChangeEvent<HTMLInputElement>){
    setError("");const file=event.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){setError("El CSV supera 5 MB.");return;}
    const text=await file.text();const parsed=parseCsv(text,delimiterOf(text));if(parsed.length<2){setError("El archivo no contiene filas de inventario.");return;}
    const h=parsed[0].map(x=>x.trim());setHeaders(h);setRawRows(parsed.slice(1));setMapping(autoMap(h));setFileName(file.name);
  }

  function setField(key:FieldKey,value:string){setMapping(prev=>({...prev,[key]:Number(value)}));}

  function downloadTemplate(){
    const sample=["pieza;categoria;oem;sku;precio;coste;ubicacion_almacen;estado;cantidad;notas_privadas","Turbo;Motor;04L253016H;G7-001;280;80;N1-C-04;Buen estado;1;Revisado en banco","Alternador;Electrónica;04L903023;G7-002;95;;N1-C-05;Usada;1;"].join("\n");
    const blob=new Blob([sample],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="desguazalo_inventario.csv";a.click();URL.revokeObjectURL(url);
  }

  async function importRows(){
    setError("");if(!supabase||!vehicleId)return setError("Selecciona un vehículo donante.");if(mapping.name<0)return setError("Mapea la columna obligatoria “Pieza”.");if(!valid.length)return setError("No hay filas válidas para importar.");
    setBusy(true);
    try{
      const payload=valid.map(row=>({
        name:row.name,category:row.category,reference_code:row.reference_code,internal_sku:row.internal_sku,
        price:row.price,purchase_price:row.purchase_price,storage_location:row.storage_location,
        condition:row.condition,quantity:row.quantity,private_notes:row.private_notes
      }));
      const {error:importError}=await supabase.rpc("pro_import_inventory",{p_vehicle_listing_id:vehicleId,p_source:"csv",p_filename:fileName,p_rows:payload});
      if(importError)throw importError;
      router.push("/pro/inventario");
    }catch(caught){setError(caught instanceof Error?caught.message:"No se pudo importar el CSV.");setBusy(false);}
  }

  return <ProfessionalShell active="csv">
    <div className="pro-heading"><div><h1>Importar CSV</h1><p>Sube tu inventario existente, asigna columnas y valida antes de crear ninguna pieza.</p></div><div className="pro-heading-actions"><button className="button button-ghost" type="button" onClick={downloadTemplate}>Descargar plantilla</button><Link href="/pro/inventario" className="button button-dark">Inventario</Link></div></div>

    {loadingInventory?<div className="loading-block">Preparando importador…</div>:!vehicles.length?<div className="empty-state"><h2>Necesitas un vehículo donante</h2><p>La primera versión del importador carga cada archivo sobre un único vehículo donante para evitar asociaciones ambiguas.</p><Link href="/publicar?type=vehicle" className="button button-primary">Publicar vehículo</Link></div>:<>
      <section className="csv-source">
        <label>Vehículo donante<select value={vehicleId} onChange={e=>setVehicleId(e.target.value)}>{vehicles.map(v=><option key={v.id} value={v.id}>{v.title}</option>)}</select></label>
        <label className="csv-drop"><input type="file" accept=".csv,text/csv" onChange={readFile}/><strong>{fileName||"Seleccionar CSV"}</strong><span>Separado por coma o punto y coma · máximo 5 MB</span></label>
      </section>

      {headers.length>0&&<>
        <section className="csv-mapping">
          <div className="pro-section-title"><div><span className="kicker">PASO 1</span><h2>Mapea las columnas</h2></div><span>{rawRows.length} filas detectadas</span></div>
          <div className="csv-map-grid">{fields.map(field=><label key={field.key}>{field.label}{field.required&&<b>*</b>}<select value={mapping[field.key]} onChange={e=>setField(field.key,e.target.value)}><option value="-1">No importar</option>{headers.map((header,index)=><option value={index} key={index}>{header||"Columna "+(index+1)}</option>)}</select></label>)}</div>
        </section>

        <section className="csv-validation">
          <div className="pro-section-title"><div><span className="kicker">PASO 2</span><h2>Validación</h2></div></div>
          <div className="csv-validation-stats"><div className="ok"><strong>{valid.length}</strong><span>válidas</span></div><div className={errorsCount?"bad":""}><strong>{errorsCount}</strong><span>con errores</span></div><div><strong>{warningsCount}</strong><span>avisos</span></div></div>
          <div className="pro-table-wrap"><table className="pro-table csv-preview"><thead><tr><th>Línea</th><th>Pieza</th><th>OEM</th><th>SKU</th><th>Precio</th><th>Ubicación</th><th>Resultado</th></tr></thead><tbody>{prepared.slice(0,12).map(row=><tr key={row.line} className={row.errors.length?"csv-error-row":""}><td>{row.line}</td><td><strong>{row.name||"—"}</strong></td><td>{row.reference_code||"—"}</td><td>{row.internal_sku||"—"}</td><td>{row.price===null?"—":row.price+" €"}</td><td>{row.storage_location||"—"}</td><td>{row.errors.length?<span className="csv-errors">{row.errors.join(" · ")}</span>:row.warnings.length?<span className="csv-warnings">{row.warnings.join(" · ")}</span>:<span className="csv-ok">Correcta</span>}</td></tr>)}</tbody></table></div>
          {prepared.length>12&&<p className="pro-muted">Vista previa de 12 de {prepared.length} filas. La validación se ha aplicado al archivo completo.</p>}
        </section>

        {error&&<div className="form-error pro-feedback">{error}</div>}
        <div className="pro-savebar"><div><strong>Importar {valid.length} filas válidas</strong><span>{errorsCount?errorsCount+" filas con error se omitirán. ":""}Los avisos no bloquean la importación.</span></div><button type="button" className="button button-primary" disabled={busy||!valid.length} onClick={()=>void importRows()}>{busy?"Importando…":"Importar inventario"}</button></div>
      </>}
      {!headers.length&&error&&<div className="form-error pro-feedback">{error}</div>}
    </>}
  </ProfessionalShell>;
}
