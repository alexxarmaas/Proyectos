"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/format";

type LeafletMap={remove:()=>void;fitBounds:(bounds:unknown,options?:Record<string,unknown>)=>void;setView:(center:[number,number],zoom:number)=>void};
type LeafletMarker={addTo:(map:LeafletMap)=>LeafletMarker;bindPopup:(node:HTMLElement)=>LeafletMarker};
type LeafletLayer={addTo:(map:LeafletMap)=>LeafletLayer};
type LeafletApi={
  map:(element:HTMLElement,options?:Record<string,unknown>)=>LeafletMap;
  tileLayer:(url:string,options?:Record<string,unknown>)=>LeafletLayer;
  marker:(point:[number,number])=>LeafletMarker;
  latLngBounds:(points:Array<[number,number]>)=>unknown;
};
declare global { interface Window { L?:LeafletApi } }

let leafletPromise:Promise<LeafletApi>|null=null;
function loadLeaflet(){
  if(window.L)return Promise.resolve(window.L);
  if(leafletPromise)return leafletPromise;
  leafletPromise=new Promise((resolve,reject)=>{
    if(!document.querySelector('link[data-dg-leaflet]')){
      const link=document.createElement("link");link.rel="stylesheet";link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";link.dataset.dgLeaflet="1";document.head.appendChild(link);
    }
    const existing=document.querySelector<HTMLScriptElement>('script[data-dg-leaflet]');
    if(existing){
      existing.addEventListener("load",()=>window.L?resolve(window.L):reject(new Error("Leaflet no disponible")),{once:true});
      existing.addEventListener("error",()=>reject(new Error("No se pudo cargar el mapa")),{once:true});
      return;
    }
    const script=document.createElement("script");script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";script.async=true;script.dataset.dgLeaflet="1";
    script.onload=()=>window.L?resolve(window.L):reject(new Error("Leaflet no disponible"));script.onerror=()=>reject(new Error("No se pudo cargar el mapa"));document.head.appendChild(script);
  });
  return leafletPromise;
}

export function MarketplaceMap({listings}:{listings:Listing[]}){
  const ref=useRef<HTMLDivElement|null>(null);
  const [error,setError]=useState("");
  const mapped=useMemo(()=>listings.filter((x):x is Listing&{latitude:number;longitude:number}=>typeof x.latitude==="number"&&typeof x.longitude==="number"),[listings]);

  useEffect(()=>{
    if(!ref.current||!mapped.length)return;
    let map:LeafletMap|null=null;let cancelled=false;
    void loadLeaflet().then((L)=>{
      if(cancelled||!ref.current)return;
      map=L.map(ref.current,{scrollWheelZoom:false});
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors",maxZoom:18}).addTo(map);
      const points:Array<[number,number]>=[];
      for(const listing of mapped){
        const point:[number,number]=[listing.latitude,listing.longitude];points.push(point);
        const node=document.createElement("div");node.className="dg-map-popup";
        const title=document.createElement("strong");title.textContent=listing.title;
        const detail=document.createElement("span");detail.textContent=[formatPrice(listing.price),listing.location,listing.distance_km!==undefined&&listing.distance_km!==null?listing.distance_km.toFixed(1)+" km":null].filter(Boolean).join(" · ");
        const link=document.createElement("a");link.href="/pieza/"+listing.slug;link.textContent="Ver anuncio →";
        node.append(title,detail,link);L.marker(point).addTo(map).bindPopup(node);
      }
      if(points.length===1)map.setView(points[0],11);else map.fitBounds(L.latLngBounds(points),{padding:[35,35],maxZoom:12});
    }).catch(()=>setError("No se pudo cargar el mapa. Puedes seguir usando la vista de tarjetas."));
    return()=>{cancelled=true;map?.remove();};
  },[mapped]);

  if(!mapped.length)return <div className="dg-panel p-8 text-center"><strong>Aún no hay anuncios con ubicación aproximada.</strong><p className="mt-2 text-sm text-[var(--dg-muted)]">Los nuevos anuncios pueden añadirla al publicar.</p></div>;
  if(error)return <div className="form-error">{error}</div>;
  return <div className="market-map-shell"><div ref={ref} className="market-map" /><p>Los pines son aproximados para no revelar la dirección exacta del vendedor.</p></div>;
}
