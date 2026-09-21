"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export function ShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title, url }); return; }
    await navigator.clipboard.writeText(url); setCopied(true);
  }
  function whatsapp() {
    const url = window.location.href;
    window.open("https://wa.me/?text=" + encodeURIComponent(title + " " + url), "_blank", "noopener,noreferrer");
  }
  return <div className="share-row"><button type="button" onClick={share}>{copied ? "✓ Enlace copiado" : "Compartir"}</button><button type="button" onClick={whatsapp}>WhatsApp</button></div>;
}

export function CopyReferenceButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(value); setCopied(true); }
  return <button type="button" className="text-xs font-bold underline" onClick={copy}>{copied ? "Copiada" : "Copiar referencia"}</button>;
}

export function SellerRepeatButton({ sellerId, brand, model, generation, year, engine, location }: { sellerId: string; brand: string; model: string; generation: string | null; year: number | null; engine: string | null; location: string }) {
  const [own, setOwn] = useState(false);
  useEffect(() => { const supabase=getBrowserSupabase(); if(!supabase)return; void supabase.auth.getUser().then(({data})=>setOwn(data.user?.id===sellerId)); }, [sellerId]);
  if (!own) return null;
  const params = new URLSearchParams({ brand, model, location });
  if (generation) params.set("generation", generation); if (year) params.set("year", String(year)); if (engine) params.set("engine", engine);
  return <Link className="button button-ghost full" href={"/publicar?" + params.toString()}>Publicar otra pieza de este coche</Link>;
}
