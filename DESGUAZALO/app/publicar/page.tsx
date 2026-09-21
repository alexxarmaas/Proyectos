"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { categories, conditions, popularBrands } from "@/lib/catalog";
import { slugify } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase";
import { OemCompatibilityPicker } from "@/components/OemCompatibilityPicker";
import type { ListingCompatibility, ListingType } from "@/lib/types";

const maxImageBytes = 8 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function compressImage(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 2.5 * 1024 * 1024) { bitmap.close(); return file; }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) { bitmap.close(); return file; }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .84));
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], base + ".webp", { type:"image/webp", lastModified:Date.now() });
  } catch {
    return file;
  }
}

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [type, setType] = useState<ListingType>("part");
  const [form, setForm] = useState({ title:"", brand:"", model:"", generation:"", year:"", engine:"", category:"Motor", condition:"Buen estado", price:"", location:"", description:"", mileage:"", availableParts:"", referenceCode:"", technicalNotes:"", shipping:false, pickup:true });
  const [compat, setCompat] = useState({ brand:"", model:"", generation:"", engine:"", yearFrom:"", yearTo:"" });
  const [learnedCompat, setLearnedCompat] = useState<ListingCompatibility[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function set<K extends keyof typeof form>(key: K) { return (value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value })); }

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace("/login?next=/publicar"); return; }
      let defaults: Partial<typeof form> = {};
      try { defaults = JSON.parse(localStorage.getItem("desguazalo:publish-defaults") || "{}"); } catch {}
      const query = new URLSearchParams(window.location.search);
      const { data: profile } = await supabase.from("profiles").select("location").eq("id", auth.user.id).single();
      setForm((prev) => ({
        ...prev, ...defaults,
        location: query.get("location") || String(defaults.location || profile?.location || ""),
        title: query.get("title") || String(defaults.title || ""),
        category: query.get("category") || String(defaults.category || "Motor"),
        referenceCode: query.get("referenceCode") || String(defaults.referenceCode || ""),
        brand: query.get("brand") || String(defaults.brand || ""),
        model: query.get("model") || String(defaults.model || ""),
        generation: query.get("generation") || String(defaults.generation || ""),
        year: query.get("year") || String(defaults.year || ""),
        engine: query.get("engine") || String(defaults.engine || "")
      }));
    })();
  }, [router]);

  function chooseImages(list: FileList | null) {
    setError(""); if (!list) return;
    const next = Array.from(list).slice(0, 10);
    const invalid = next.find((file) => !allowedTypes.has(file.type) || file.size > maxImageBytes);
    if (invalid) return setError("Usa JPG, PNG o WEBP de hasta 8 MB por imagen.");
    setFiles(next);
  }

  function movePhoto(from: number, to: number) {
    if (from === to) return;
    setFiles((prev) => {
      const next = [...prev];
      const item = next.splice(from, 1)[0];
      next.splice(to, 0, item);
      return next;
    });
  }

  function nextStep() {
    setError("");
    if (step === 1 && files.length < 1) return setError("Sube al menos una foto.");
    if (step === 2 && (!form.title.trim() || !form.brand.trim() || !form.model.trim())) return setError("Indica qué es y de qué coche procede.");
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
      const prepared = await Promise.all(files.map(compressImage));
      for (let index = 0; index < prepared.length; index++) {
        const file = prepared[index];
        const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
        const path = auth.user.id + "/" + listingId + "/" + index + "-" + crypto.randomUUID() + "." + ext;
        const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file, { cacheControl:"3600", upsert:false, contentType:file.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploaded.push({ path, url:data.publicUrl, position:index });
      }

      const slug = slugify(form.title) + "-" + listingId.slice(0, 6);
      const payload = {
        id: listingId, seller_id: auth.user.id, type, title: form.title.trim(), slug, description: form.description.trim() || null,
        brand: form.brand.trim(), model: form.model.trim(), generation: form.generation.trim() || null, year: form.year ? Number(form.year) : null,
        engine: form.engine.trim() || null, category: type === "part" ? form.category : null, condition: form.condition,
        price: form.price ? Number(form.price) : null, location: form.location.trim(), mileage: form.mileage ? Number(form.mileage) : null,
        available_parts: type === "vehicle" ? form.availableParts.split(",").map((x) => x.trim()).filter(Boolean) : null,
        reference_code: form.referenceCode.trim() || null, technical_notes: form.technicalNotes.trim() || null,
        shipping_available: form.shipping, pickup_available: form.pickup, status:"available"
      };
      const { error: insertError } = await supabase.from("listings").insert(payload);
      if (insertError) throw insertError;

      const { error: imageError } = await supabase.from("listing_images").insert(uploaded.map((img) => ({ listing_id:listingId, storage_path:img.path, public_url:img.url, position:img.position })));
      if (imageError) throw imageError;

      if (type === "vehicle") {
        const donorNames = form.availableParts.split(",").map((x) => x.trim()).filter(Boolean);
        if (donorNames.length) {
          const { error: donorError } = await supabase.from("donor_parts").insert(donorNames.map((name, index) => ({
            vehicle_listing_id: listingId,
            seller_id: auth.user!.id,
            name,
            status: "available",
            position: index
          })));
          if (donorError) throw donorError;
        }
      }

      if (type === "part") {
        const compatibility: { listing_id:string; brand:string; model:string; generation:string|null; year_from:number|null; year_to:number|null; engine:string|null }[] = [{
          listing_id:listingId, brand:form.brand.trim(), model:form.model.trim(), generation:form.generation.trim() || null,
          year_from:null, year_to:null, engine:form.engine.trim() || null
        }];
        if (compat.brand.trim() && compat.model.trim()) compatibility.push({
          listing_id:listingId, brand:compat.brand.trim(), model:compat.model.trim(), generation:compat.generation.trim() || null,
          year_from:compat.yearFrom ? Number(compat.yearFrom) : null, year_to:compat.yearTo ? Number(compat.yearTo) : null, engine:compat.engine.trim() || null
        });
        for (const learned of learnedCompat) {
          const candidate = {
            listing_id: listingId,
            brand: learned.brand,
            model: learned.model,
            generation: learned.generation,
            year_from: learned.year_from,
            year_to: learned.year_to,
            engine: learned.engine
          };
          const duplicate = compatibility.some((item) =>
            item.brand.toLowerCase() === candidate.brand.toLowerCase() &&
            item.model.toLowerCase() === candidate.model.toLowerCase() &&
            (item.generation || "").toLowerCase() === (candidate.generation || "").toLowerCase() &&
            (item.engine || "").toLowerCase() === (candidate.engine || "").toLowerCase() &&
            item.year_from === candidate.year_from &&
            item.year_to === candidate.year_to
          );
          if (!duplicate) compatibility.push(candidate);
        }
        const { error: compatError } = await supabase.from("listing_compatibilities").insert(compatibility);
        if (compatError) throw compatError;
      }

      const donorPartId = new URLSearchParams(window.location.search).get("donorPartId");
      if (donorPartId && type === "part") {
        await supabase.from("donor_parts").update({ published_listing_id: listingId, status: "available" }).eq("id", donorPartId);
      }

      localStorage.setItem("desguazalo:publish-defaults", JSON.stringify({ brand:form.brand, model:form.model, generation:form.generation, year:form.year, engine:form.engine, location:form.location }));
      router.push("/pieza/" + slug);
    } catch (caught) {
      for (const img of uploaded) await supabase.storage.from("listing-images").remove([img.path]);
      await supabase.from("listings").delete().eq("id", listingId);
      setError(caught instanceof Error ? caught.message : "No se pudo publicar el anuncio."); setBusy(false);
    }
  }

  return <div className="publish-shell"><div className="shell narrow">
    <div className="publish-head"><h1>Publicar anuncio</h1><p>Fotos claras, referencia OEM y coche de procedencia: cuanto mejor esté el anuncio, menos preguntas tendrás después.</p><div className="steps"><span className={step >= 1 ? "active" : ""}>1 Fotos</span><span className={step >= 2 ? "active" : ""}>2 Vehículo y pieza</span><span className={step >= 3 ? "active" : ""}>3 Precio y entrega</span></div></div>
    <form onSubmit={publish} className="publish-card">
      {step === 1 && <section>
        <div className="type-toggle"><button type="button" className={type === "part" ? "selected" : ""} onClick={() => setType("part")}><strong>Pieza individual</strong><span>Faro, caja, motor, llanta…</span></button><button type="button" className={type === "vehicle" ? "selected" : ""} onClick={() => setType("vehicle")}><strong>Vehículo para despiece</strong><span>Publica el coche completo</span></button></div>
        <label className="upload-zone"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => chooseImages(e.target.files)} /><strong>Sube de 1 a 10 fotos</strong><span>Las comprimimos antes de enviarlas. Arrastra para ordenar; la primera será la portada.</span></label>
        {previews.length > 0 && <><div className="preview-grid">{previews.map((src, i) => <div className="photo-card" key={src} draggable onDragStart={() => setDragIndex(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragIndex !== null) movePhoto(dragIndex, i); setDragIndex(null); }}>{i === 0 && <span className="photo-main">Portada</span>}<Image src={src} alt={"Vista previa " + (i + 1)} fill unoptimized /></div>)}</div><div className="photo-toolbar"><span>Consejo: incluye etiqueta OEM, conectores y cualquier desperfecto.</span><span>{files.length}/10</span></div></>}
      </section>}

      {step === 2 && <section className="stack-form">
        <label>{type === "part" ? "¿Qué pieza es?" : "Título del despiece"}<input required value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder={type === "part" ? "Faro LED delantero derecho" : "SEAT Ibiza 6J para despiece"} maxLength={120} /></label>
        <div className="two-cols"><label>Marca<input list="publish-brands" required value={form.brand} onChange={(e) => set("brand")(e.target.value)} placeholder="Volkswagen" /><datalist id="publish-brands">{popularBrands.map((x) => <option key={x} value={x} />)}</datalist></label><label>Modelo<input required value={form.model} onChange={(e) => set("model")(e.target.value)} placeholder="Golf" /></label></div>
        <div className="three-cols"><label>Generación<input value={form.generation} onChange={(e) => set("generation")(e.target.value)} placeholder="VII / 6J / E46" /></label><label>Año<input inputMode="numeric" value={form.year} onChange={(e) => set("year")(e.target.value)} placeholder="2018" /></label><label>Motor<input value={form.engine} onChange={(e) => set("engine")(e.target.value)} placeholder="1.0 TSI" /></label></div>
        {type === "part" && <><label>Categoría<select value={form.category} onChange={(e) => set("category")(e.target.value)}>{categories.map((x) => <option key={x}>{x}</option>)}</select></label><label>Referencia OEM <em>muy recomendada</em><input value={form.referenceCode} onChange={(e) => set("referenceCode")(e.target.value)} placeholder="5G1941036" /></label><OemCompatibilityPicker reference={form.referenceCode} onChange={setLearnedCompat} /></>}
        <label>Estado<select value={form.condition} onChange={(e) => set("condition")(e.target.value)}>{conditions.map((x) => <option key={x}>{x}</option>)}</select></label>
        {type === "vehicle" && <><label>Kilometraje<input inputMode="numeric" value={form.mileage} onChange={(e) => set("mileage")(e.target.value)} placeholder="168000" /></label><label>Inventario inicial<input value={form.availableParts} onChange={(e) => set("availableParts")(e.target.value)} placeholder="Motor, caja, faros, puertas…" /><span className="form-hint">Sepáralas por comas. Después podrás gestionar cada pieza, su precio y su estado desde el vehículo donante.</span></label></>}
        {type === "part" && <div className="optional-block stack-form"><strong>Compatibilidad adicional <span className="form-hint">opcional</span></strong><p className="form-hint">El coche de procedencia se añade automáticamente. Si sabes que sirve para otro modelo, indícalo aquí.</p><div className="two-cols"><label>Marca<input value={compat.brand} onChange={(e) => setCompat({...compat,brand:e.target.value})} /></label><label>Modelo<input value={compat.model} onChange={(e) => setCompat({...compat,model:e.target.value})} /></label></div><div className="three-cols"><label>Generación<input value={compat.generation} onChange={(e) => setCompat({...compat,generation:e.target.value})} /></label><label>Motor<input value={compat.engine} onChange={(e) => setCompat({...compat,engine:e.target.value})} /></label><label>Años<input value={[compat.yearFrom,compat.yearTo].filter(Boolean).join("–")} readOnly placeholder="Usa los campos de abajo" /></label></div><div className="two-cols"><label>Desde<input inputMode="numeric" value={compat.yearFrom} onChange={(e) => setCompat({...compat,yearFrom:e.target.value})} placeholder="2013" /></label><label>Hasta<input inputMode="numeric" value={compat.yearTo} onChange={(e) => setCompat({...compat,yearTo:e.target.value})} placeholder="2019" /></label></div></div>}
      </section>}

      {step === 3 && <section className="stack-form">
        <div className="two-cols"><label>{type === "part" ? "Precio" : "Precio orientativo"}<div className="price-input"><input required={type === "part"} inputMode="decimal" value={form.price} onChange={(e) => set("price")(e.target.value)} placeholder="180" /><span>€</span></div></label><label>Localización<input required value={form.location} onChange={(e) => set("location")(e.target.value)} placeholder="Telde, Gran Canaria" /></label></div>
        <div className="delivery-options"><label className="delivery-option"><input type="checkbox" checked={form.pickup} onChange={(e) => set("pickup")(e.target.checked)} /> Recogida en mano</label><label className="delivery-option"><input type="checkbox" checked={form.shipping} onChange={(e) => set("shipping")(e.target.checked)} /> Envío disponible</label></div>
        <label>Descripción <em>opcional</em><textarea value={form.description} onChange={(e) => set("description")(e.target.value)} rows={4} placeholder="Estado real, desperfectos, qué incluye…" maxLength={1500} /></label>
        {type === "part" && <label>Notas técnicas <em>opcional</em><input value={form.technicalNotes} onChange={(e) => set("technicalNotes")(e.target.value)} placeholder="Lado derecho, con módulo, conector de 14 pines…" /></label>}
        <div className="deal-note">El pago y la entrega se acuerdan directamente entre comprador y vendedor. DESGUÁZALO no procesa pagos.</div>
      </section>}

      {error && <div className="form-error">{error}</div>}
      <div className="publish-actions">{step > 1 && <button className="button button-ghost" type="button" onClick={() => setStep((x) => x - 1)}>Atrás</button>}{step < 3 ? <button className="button button-primary" type="button" onClick={nextStep}>Continuar</button> : <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Optimizando y publicando…" : "Publicar anuncio"}</button>}</div>
    </form>
  </div></div>;
}
