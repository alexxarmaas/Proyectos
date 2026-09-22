"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { approximateCoordinate } from "@/lib/geo";

export function NearbyControls({ active }: { active:boolean }) {
  const router=useRouter();
  const params=useSearchParams();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  function navigate(next:URLSearchParams){router.push("/marketplace?"+next.toString());}

  function locate(){
    setError("");
    if(!navigator.geolocation){setError("Tu navegador no permite usar ubicación.");return;}
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({coords})=>{
        const next=new URLSearchParams(params.toString());
        next.set("latitude",String(approximateCoordinate(coords.latitude)));
        next.set("longitude",String(approximateCoordinate(coords.longitude)));
        if(!next.get("radius"))next.set("radius","25");
        next.set("sort","distance");
        navigate(next);setBusy(false);
      },
      ()=>{setError("No hemos podido obtener tu ubicación.");setBusy(false);},
      {enableHighAccuracy:false,timeout:8000,maximumAge:300000}
    );
  }

  function radius(value:string){
    const next=new URLSearchParams(params.toString());
    next.set("radius",value);next.set("sort","distance");navigate(next);
  }

  function clear(){
    const next=new URLSearchParams(params.toString());
    next.delete("latitude");next.delete("longitude");next.delete("radius");
    if(next.get("sort")==="distance")next.set("sort","recent");
    navigate(next);
  }

  return <div className="nearby-controls">
    {active?<><span className="nearby-live">● Cerca de ti</span><select value={params.get("radius")||"25"} onChange={e=>radius(e.target.value)} aria-label="Radio de búsqueda"><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option><option value="250">250 km</option></select><button type="button" onClick={clear}>Quitar cercanía</button></>:<button type="button" className="nearby-locate" disabled={busy} onClick={locate}>{busy?"Localizando…":"⌖ Buscar cerca de mí"}</button>}
    {error&&<small>{error}</small>}
  </div>;
}
