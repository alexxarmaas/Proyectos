"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTabs } from "@/components/AccountTabs";
import { popularBrands } from "@/lib/catalog";
import { getBrowserSupabase } from "@/lib/supabase";
import type { UserVehicle } from "@/lib/types";

export default function GaragePage() {
  const router = useRouter();
  const supabase = getBrowserSupabase();
  const [rows, setRows] = useState<UserVehicle[]>([]);
  const [form, setForm] = useState({ nickname:"", brand:"", model:"", generation:"", year:"", engine:"", is_primary:false });
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.replace("/login?next=/cuenta/garaje"); return; }
    const { data } = await supabase.from("user_vehicles").select("*").eq("user_id", auth.user.id).order("is_primary", { ascending:false }).order("created_at", { ascending:true });
    setRows((data ?? []) as UserVehicle[]);
  }

  useEffect(() => { void load(); }, []);

  async function add(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    if (form.is_primary) await supabase.from("user_vehicles").update({ is_primary:false }).eq("user_id", auth.user.id);
    const { error: err } = await supabase.from("user_vehicles").insert({
      user_id: auth.user.id, nickname: form.nickname.trim() || null, brand: form.brand.trim(), model: form.model.trim(),
      generation: form.generation.trim() || null, year: form.year ? Number(form.year) : null, engine: form.engine.trim() || null, is_primary: form.is_primary
    });
    if (err) { setError(err.message); return; }
    setForm({ nickname:"", brand:"", model:"", generation:"", year:"", engine:"", is_primary:false });
    await load();
  }

  async function remove(id: string) {
    if (!supabase || !confirm("¿Quitar este coche de tu garaje?")) return;
    await supabase.from("user_vehicles").delete().eq("id", id);
    setRows((prev) => prev.filter((x) => x.id !== id));
  }

  return <div className="shell account-page">
    <div className="account-head"><div><span className="kicker">COMPATIBILIDAD</span><h1>Mi garaje</h1><p className="muted">Guarda tus coches una vez y filtra piezas que encajen con ellos.</p></div></div>
    <AccountTabs active="garaje" />
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section>
        <h2>Mis coches</h2>
        <div className="garage-grid">
          {rows.map((row) => <article className="garage-card" key={row.id}><div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--dg-accent-strong)]">{row.is_primary ? "Principal" : "Vehículo"}</span><h3 className="mt-1 text-xl font-black">{row.nickname || row.brand + " " + row.model}</h3><p className="mt-1 text-sm text-[var(--dg-muted)]">{[row.brand, row.model, row.generation, row.year, row.engine].filter(Boolean).join(" · ")}</p></div><button className="danger-link text-sm" type="button" onClick={() => remove(row.id)}>Quitar</button></div></article>)}
          {!rows.length && <div className="empty-state"><h2>Tu garaje está vacío</h2><p>Añade tu coche para poder comprobar compatibilidades.</p></div>}
        </div>
      </section>
      <form className="profile-form stack-form" onSubmit={add}>
        <h2>Añadir coche</h2>
        <label>Nombre corto <em>opcional</em><input value={form.nickname} onChange={(e) => setForm({...form,nickname:e.target.value})} placeholder="Mi Polo" /></label>
        <div className="two-cols"><label>Marca<input list="garage-brands" required value={form.brand} onChange={(e) => setForm({...form,brand:e.target.value})} /><datalist id="garage-brands">{popularBrands.map((x) => <option key={x} value={x} />)}</datalist></label><label>Modelo<input required value={form.model} onChange={(e) => setForm({...form,model:e.target.value})} placeholder="Polo" /></label></div>
        <div className="three-cols"><label>Generación<input value={form.generation} onChange={(e) => setForm({...form,generation:e.target.value})} placeholder="AW" /></label><label>Año<input inputMode="numeric" value={form.year} onChange={(e) => setForm({...form,year:e.target.value})} placeholder="2020" /></label><label>Motor<input value={form.engine} onChange={(e) => setForm({...form,engine:e.target.value})} placeholder="1.0 TSI" /></label></div>
        <label className="delivery-option"><input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({...form,is_primary:e.target.checked})} /> Marcar como coche principal</label>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary">Guardar coche</button>
      </form>
    </div>
  </div>;
}
