"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { categories, conditions, popularBrands } from "@/lib/catalog";
import { slugify } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase";
import type { ListingType } from "@/lib/types";

const maxImageBytes = 8 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [type, setType] = useState<ListingType>("part");
  const [form, setForm] = useState({ title:"", brand:"", model:"", generation:"", year:"", engine:"", category:"Motor", condition:"Buen estado", price:"", location:"", description:"", mileage:"", availableParts:"", referenceCode:"", technicalNotes:"" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => { const supabase = getBrowserSupabase(); if (!supabase) return; void supabase.auth.getUser().then(({ data }) => { if (!data.user) router.replace("/login?next=/publicar"); }); }, [router]);
  useEffect(() => () => { previews.forEach((url) => URL.revokeObjectURL(url)); }, [previews]);

  function chooseImages(list: FileList | null) {
    setError(""); if (!list) return;
    const next = Array.from(list).slice(0, 5);
    if (next.length < 1) return;
    const invalid = next.find((file) => !allowedTypes.has(file.type) || file.size > maxImageBytes);
    if (invalid) return setError("Usa JPG, PNG o WEBP de hasta 8 MB por imagen.");
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles(next);
    setPreviews(next.map((file) => URL.createObjectURL(file)));
  }

  function nextStep() {
    setError("");
    if (step === 1 && files.length < 1) return setError("Sube al menos una foto.");
    if (step === 2 && (!form.title.trim() || !form.brand.trim() || !form.model.trim())) return setError("Indica qué es y de qué coche procede.");
    if (step === 2 && type === "part" && !form.category) return setError("Selecciona una categoría.");
    setStep((value) => Math.min(3, value + 1));
  }

  async function publish(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!form.location.trim()) return setError("Añade una localización.");
    if (type === "part" && (!form.price || Number(form.price) < 0)) return setError("Indica el precio de la pieza.");
    setBusy(true);
    const supabase = getBrowserSupabase();
    if (!supabase) { setError("Supabase aún no está configurado."); setBusy(false); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.replace("/login?next=/publicar"); return; }
    const listingId = crypto.randomUUID();
    const uploaded: { path: string; url: string; position: number }[] = [];
    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${auth.user.id}/${listingId}/${index}-${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploaded.push({ path, url: data.publicUrl, position: index });
      }
      const slug = `${slugify(form.title)}-${listingId.slice(0, 6)}`;
      const payload = {
        id: listingId, seller_id: auth.user.id, type, title: form.title.trim(), slug, description: form.description.trim() || null,
        brand: form.brand.trim(), model: form.model.trim(), generation: form.generation.trim() || null, year: form.year ? Number(form.year) : null,
        engine: form.engine.trim() || null, category: type === "part" ? form.category : null, condition: form.condition,
        price: form.price ? Number(form.price) : null, location: form.location.trim(), mileage: form.mileage ? Number(form.mileage) : null,
        available_parts: type === "vehicle" ? form.availableParts.split(",").map((x) => x.trim()).filter(Boolean) : null,
        reference_code: form.referenceCode.trim() || null, technical_notes: form.technicalNotes.trim() || null, status: "available"
      };
      const { error: insertError } = await supabase.from("listings").insert(payload);
      if (insertError) throw insertError;
      const { error: imageError } = await supabase.from("listing_images").insert(uploaded.map((img) => ({ listing_id: listingId, storage_path: img.path, public_url: img.url, position: img.position })));
      if (imageError) throw imageError;
      router.push(`/pieza/${slug}`);
    } catch (caught) {
      for (const img of uploaded) await supabase.storage.from("listing-images").remove([img.path]);
      await supabase.from("listings").delete().eq("id", listingId);
      setError(caught instanceof Error ? caught.message : "No se pudo publicar el anuncio."); setBusy(false);
    }
  }

  return <div className="publish-shell"><div className="shell narrow"><div className="publish-head"><span className="kicker">PUBLICACIÓN RÁPIDA</span><h1>Del garaje al marketplace.</h1><p>Objetivo: menos de un minuto. Lo técnico es opcional y puede añadirse después.</p><div className="steps"><span className={step >= 1 ? "active" : ""}>1 Fotos</span><span className={step >= 2 ? "active" : ""}>2 Pieza</span><span className={step >= 3 ? "active" : ""}>3 Precio y zona</span></div></div>
  <form onSubmit={publish} className="publish-card">
    {step === 1 && <section><div className="type-toggle"><button type="button" className={type === "part" ? "selected" : ""} onClick={() => setType("part")}><strong>Pieza individual</strong><span>Faro, caja, motor, llanta…</span></button><button type="button" className={type === "vehicle" ? "selected" : ""} onClick={() => setType("vehicle")}><strong>Vehículo para desguace</strong><span>Publica el coche completo</span></button></div><label className="upload-zone"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => chooseImages(e.target.files)} /><strong>Sube de 1 a 5 fotos</strong><span>JPG, PNG o WEBP · máximo 8 MB cada una</span></label>{previews.length > 0 && <div className="preview-grid">{previews.map((src, i) => <div key={src}><Image src={src} alt={`Vista previa ${i+1}`} fill unoptimized /></div>)}</div>}</section>}
    {step === 2 && <section className="stack-form"><label>{type === "part" ? "¿Qué pieza es?" : "Título del despiece"}<input required value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder={type === "part" ? "Faro LED delantero derecho" : "SEAT Ibiza 6J para despiece"} maxLength={120} /></label><div className="two-cols"><label>Marca<input list="brands" required value={form.brand} onChange={(e) => set("brand")(e.target.value)} placeholder="Volkswagen" /><datalist id="brands">{popularBrands.map((x) => <option key={x} value={x} />)}</datalist></label><label>Modelo<input required value={form.model} onChange={(e) => set("model")(e.target.value)} placeholder="Golf" /></label></div><div className="three-cols"><label>Generación<input value={form.generation} onChange={(e) => set("generation")(e.target.value)} placeholder="VII / 6J / E46" /></label><label>Año<input inputMode="numeric" value={form.year} onChange={(e) => set("year")(e.target.value)} placeholder="2018" /></label><label>Motor<input value={form.engine} onChange={(e) => set("engine")(e.target.value)} placeholder="1.0 TSI" /></label></div>{type === "part" && <label>Categoría<select value={form.category} onChange={(e) => set("category")(e.target.value)}>{categories.map((x) => <option key={x}>{x}</option>)}</select></label>}<label>Estado<select value={form.condition} onChange={(e) => set("condition")(e.target.value)}>{conditions.map((x) => <option key={x}>{x}</option>)}</select></label>{type === "vehicle" && <><label>Kilometraje<input inputMode="numeric" value={form.mileage} onChange={(e) => set("mileage")(e.target.value)} placeholder="168000" /></label><label>Piezas que siguen disponibles<input value={form.availableParts} onChange={(e) => set("availableParts")(e.target.value)} placeholder="Motor, caja, faros, puertas…" /><span className="form-hint">Sepáralas por comas.</span></label></>}</section>}
    {step === 3 && <section className="stack-form"><div className="two-cols"><label>{type === "part" ? "Precio" : "Precio orientativo"}<div className="price-input"><input required={type === "part"} inputMode="decimal" value={form.price} onChange={(e) => set("price")(e.target.value)} placeholder="180" /><span>€</span></div></label><label>Localización<input required value={form.location} onChange={(e) => set("location")(e.target.value)} placeholder="Telde, Gran Canaria" /></label></div><label>Descripción <em>opcional</em><textarea value={form.description} onChange={(e) => set("description")(e.target.value)} rows={4} placeholder="Estado real, desperfectos, qué incluye…" maxLength={1500} /></label>{type === "part" && <div className="optional-block"><strong>Datos técnicos opcionales</strong><div className="two-cols"><label>Referencia OEM<input value={form.referenceCode} onChange={(e) => set("referenceCode")(e.target.value)} placeholder="5G1941036" /></label><label>Notas técnicas<input value={form.technicalNotes} onChange={(e) => set("technicalNotes")(e.target.value)} placeholder="Lado derecho, con módulo…" /></label></div></div>}<div className="deal-note">La compra, pago, envío o entrega se acuerda directamente entre comprador y vendedor. DESGUÁZALO no procesa pagos.</div></section>}
    {error && <div className="form-error">{error}</div>}<div className="publish-actions">{step > 1 && <button className="button button-ghost" type="button" onClick={() => setStep((x) => x - 1)}>Atrás</button>}{step < 3 ? <button className="button button-primary" type="button" onClick={nextStep}>Continuar</button> : <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Publicando…" : "Publicar anuncio"}</button>}</div>
  </form></div></div>;
}
