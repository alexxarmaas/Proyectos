"use client";

import { useState } from "react";
import { parseAutomotiveQuery } from "@/lib/search";

type Suggestions={title?:string;brand?:string;model?:string;generation?:string;year?:string;engine?:string;category?:string;referenceCode?:string};
type PhotoResult={index:number;score:number;warning:string|null};

type BarcodeResult={rawValue:string};
type BarcodeDetectorLike={detect:(source:ImageBitmap)=>Promise<BarcodeResult[]>};
type BarcodeDetectorCtor=new(options?:{formats?:string[]})=>BarcodeDetectorLike;
type TextResult={rawValue?:string};
type TextDetectorLike={detect:(source:ImageBitmap)=>Promise<TextResult[]>};
type TextDetectorCtor=new()=>TextDetectorLike;

function titleFromFilename(name:string){
  const base=name.replace(/\.[^.]+$/,"").replace(/^(img|dsc|photo|foto)[-_ ]*\d*[-_ ]*/i,"").replace(/[_-]+/g," ").replace(/\s+/g," ").trim();
  if(!base||/^\d+$/.test(base))return undefined;
  return base.split(" ").slice(0,8).map(x=>x?x[0].toUpperCase()+x.slice(1):x).join(" ");
}

async function visualScore(file:File,index:number):Promise<PhotoResult>{
  const bitmap=await createImageBitmap(file);
  const canvas=document.createElement("canvas");canvas.width=64;canvas.height=64;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx){bitmap.close();return{index,score:0,warning:null};}
  ctx.drawImage(bitmap,0,0,64,64);const pixels=ctx.getImageData(0,0,64,64).data;
  let lum=0;let contrast=0;let previous=0;
  for(let i=0;i<pixels.length;i+=4){
    const current=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];lum+=current;
    if(i>0)contrast+=Math.abs(current-previous);previous=current;
  }
  const count=pixels.length/4;const avg=lum/count;const edge=contrast/Math.max(1,count-1);
  const resolution=Math.min(1,(bitmap.width*bitmap.height)/(1600*1200));bitmap.close();
  let warning:string|null=null;
  if(avg<45)warning="Algo oscura";
  else if(avg>225)warning="Muy sobreexpuesta";
  else if(edge<9)warning="Puede estar poco nítida";
  else if(resolution<.35)warning="Resolución baja";
  const lightScore=Math.max(0,1-Math.abs(avg-135)/135);
  return{index,score:resolution*35+lightScore*30+Math.min(1,edge/28)*35,warning};
}

async function detectVisibleCodes(file:File){
  const texts:string[]=[];
  const scope=window as unknown as {BarcodeDetector?:BarcodeDetectorCtor;TextDetector?:TextDetectorCtor};
  const bitmap=await createImageBitmap(file);
  if(scope.BarcodeDetector){
    try{
      const detector=new scope.BarcodeDetector({formats:["code_128","code_39","ean_13","qr_code"]});
      const results=await detector.detect(bitmap);texts.push(...results.map(x=>x.rawValue).filter(Boolean));
    }catch{}
  }
  if(scope.TextDetector){
    try{
      const detector=new scope.TextDetector();
      const results=await detector.detect(bitmap);texts.push(...results.map(x=>x.rawValue||"").filter(Boolean));
    }catch{}
  }
  bitmap.close();return texts;
}

export function PhotoAssistant({files,onApply,onMakeCover}:{files:File[];onApply:(values:Suggestions)=>void;onMakeCover:(index:number)=>void}){
  const [state,setState]=useState<"idle"|"loading"|"ready"|"error">("idle");
  const [suggestions,setSuggestions]=useState<Suggestions>({});
  const [photos,setPhotos]=useState<PhotoResult[]>([]);

  async function analyze(){
    if(!files.length)return;setState("loading");
    try{
      const visual=await Promise.all(files.map((file,index)=>visualScore(file,index)));
      const visibleTexts:string[]=[];
      for(const file of files.slice(0,3))visibleTexts.push(...await detectVisibleCodes(file));
      const source=[...files.map(x=>x.name),...visibleTexts].join(" ");
      const parsed=parseAutomotiveQuery(source);
      const title=files.map(x=>titleFromFilename(x.name)).find(Boolean);
      setSuggestions({
        title,
        brand:parsed.filters.brand,
        model:parsed.filters.model,
        generation:parsed.filters.generation,
        year:parsed.filters.year,
        engine:parsed.filters.engine,
        category:parsed.filters.category,
        referenceCode:parsed.filters.oem
      });
      setPhotos(visual.sort((a,b)=>b.score-a.score));setState("ready");
    }catch{setState("error");}
  }

  const usable=Object.values(suggestions).some(Boolean);
  return <div className="photo-assistant">
    <div className="photo-assistant-head"><div><span className="kicker">ASISTENTE DE FOTO · BETA</span><strong>Revisión local antes de publicar</strong><p>Analiza calidad, nombres de archivo y, si tu navegador lo permite, códigos o texto detectables. No decide compatibilidades por ti.</p></div><button type="button" onClick={()=>void analyze()} disabled={state==="loading"}>{state==="loading"?"Analizando…":"Analizar fotos"}</button></div>
    {state==="ready"&&<div className="photo-assistant-results">
      {photos.length>0&&<div className="photo-cover-suggestion"><strong>Portada sugerida: foto {photos[0].index+1}</strong><button type="button" onClick={()=>onMakeCover(photos[0].index)}>Usar como portada</button><span>{photos.filter(x=>x.warning).map(x=>"Foto "+(x.index+1)+": "+x.warning).join(" · ")||"La tanda tiene una calidad visual razonable."}</span></div>}
      <div className="photo-data-suggestion"><div><strong>Datos sugeridos</strong><span>{usable?Object.entries(suggestions).filter(([,v])=>v).map(([k,v])=>k+": "+v).join(" · "):"No hemos encontrado datos fiables en nombres/códigos. Completa los campos manualmente."}</span></div>{usable&&<button type="button" onClick={()=>onApply(suggestions)}>Aplicar sugerencias</button>}</div>
    </div>}
    {state==="error"&&<p className="form-error">No se pudieron analizar estas fotos. Puedes continuar manualmente.</p>}
  </div>;
}
