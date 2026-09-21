"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase";
import type { DonorPart, ListingStatus } from "@/lib/types";

type VehicleInfo = {
  listingId: string;
  brand: string;
  model: string;
  generation: string | null;
  year: number | null;
  engine: string | null;
  location: string;
};

type ManagedDonorPart = DonorPart & {
  published_listing?: { slug: string; title: string } | null;
};


export function DonorInventoryManager({ vehicle }: { vehicle: VehicleInfo }) {
  const supabase = getBrowserSupabase();
  const [rows, setRows] = useState<ManagedDonorPart[]>([]);
  const [form, setForm] = useState({ name: "", category: "Motor", reference_code: "", price: "", notes: "" });
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("donor_parts")
      .select("*, published_listing:listings!donor_parts_published_listing_id_fkey(slug,title)")
      .eq("vehicle_listing_id", vehicle.listingId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (queryError) setError(queryError.message);
    else setRows((data ?? []) as unknown as ManagedDonorPart[]);
  }

  useEffect(() => { void load(); }, [vehicle.listingId]);

  const counts = useMemo(() => ({
    available: rows.filter((x) => x.status === "available").length,
    reserved: rows.filter((x) => x.status === "reserved").length,
    sold: rows.filter((x) => x.status === "sold").length,
  }), [rows]);

  async function add(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!supabase || !form.name.trim()) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error: insertError } = await supabase.from("donor_parts").insert({
      vehicle_listing_id: vehicle.listingId,
      seller_id: auth.user.id,
      name: form.name.trim(),
      category: form.category || null,
      reference_code: form.reference_code.trim() || null,
      price: form.price ? Number(form.price) : null,
      notes: form.notes.trim() || null,
      position: rows.length,
      status: "available"
    });
    if (insertError) { setError(insertError.message); return; }
    setForm({ name: "", category: "Motor", reference_code: "", price: "", notes: "" });
    await load();
  }

  async function changeStatus(row: ManagedDonorPart, status: ListingStatus) {
    if (!supabase) return;
    setError("");
    const { error: updateError } = await supabase.from("donor_parts").update({ status }).eq("id", row.id);
    if (updateError) { setError(updateError.message); return; }
    if (row.published_listing_id) await supabase.from("listings").update({ status }).eq("id", row.published_listing_id);
    setRows((prev) => prev.map((x) => x.id === row.id ? { ...x, status } : x));
  }

  async function remove(id: string) {
    if (!supabase || !confirm("¿Eliminar esta pieza del inventario?")) return;
    const { error: deleteError } = await supabase.from("donor_parts").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else setRows((prev) => prev.filter((x) => x.id !== id));
  }

  function publishHref(row: ManagedDonorPart) {
    const params = new URLSearchParams({
      title: row.name,
      brand: vehicle.brand,
      model: vehicle.model,
      location: vehicle.location,
      donorPartId: row.id,
      sourceVehicle: vehicle.listingId
    });
    if (vehicle.generation) params.set("generation", vehicle.generation);
    if (vehicle.year) params.set("year", String(vehicle.year));
    if (vehicle.engine) params.set("engine", vehicle.engine);
    if (row.reference_code) params.set("referenceCode", row.reference_code);
    if (row.category) params.set("category", row.category);
    return "/publicar?" + params.toString();
  }

  return (
    <section className="donor-manager">
      <div className="donor-inventory-head">
        <div><span className="kicker">INVENTARIO</span><h2>Piezas de este vehículo</h2></div>
        <div className="donor-summary"><span>{counts.available} disponibles</span><span>{counts.reserved} reservadas</span><span>{counts.sold} vendidas</span></div>
      </div>

      <div className="donor-manager-list">
        {rows.map((row) => (
          <article key={row.id} className="donor-manager-row">
            <div className="min-w-0">
              <strong>{row.name}</strong>
              <p>{[row.category, row.reference_code ? "OEM " + row.reference_code : null, row.price !== null ? formatPrice(row.price) : null].filter(Boolean).join(" · ")}</p>
            </div>
            <select value={row.status} onChange={(e) => void changeStatus(row, e.target.value as ListingStatus)} aria-label={"Estado de " + row.name}>
              <option value="available">Disponible</option>
              <option value="reserved">Reservada</option>
              <option value="sold">Vendida</option>
            </select>
            <div className="donor-manager-actions">
              {row.published_listing?.slug ? <Link href={"/pieza/" + row.published_listing.slug}>Ver anuncio</Link> : <Link href={publishHref(row)}>Publicar pieza</Link>}
              <button type="button" className="danger-link" onClick={() => void remove(row.id)}>Eliminar</button>
            </div>
          </article>
        ))}
        {!rows.length && <div className="request-cta"><strong>Aún no has creado el inventario.</strong><p className="mt-1 text-sm text-[var(--dg-muted)]">Añade piezas para que el comprador sepa qué sigue disponible sin preguntarte una por una.</p></div>}
      </div>

      <form className="donor-add-form stack-form" onSubmit={add}>
        <h3>Añadir pieza al vehículo</h3>
        <div className="two-cols">
          <label>Pieza<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Turbo, puerta derecha, alternador…" /></label>
          <label>Categoría<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((x) => <option key={x}>{x}</option>)}</select></label>
        </div>
        <div className="two-cols">
          <label>Referencia OEM <em>opcional</em><input value={form.reference_code} onChange={(e) => setForm({ ...form, reference_code: e.target.value })} /></label>
          <label>Precio <em>opcional</em><input inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="180" /></label>
        </div>
        <label>Nota rápida <em>opcional</em><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Con módulo / pequeño roce / lado derecho…" /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary" type="submit">Añadir al inventario</button>
      </form>
    </section>
  );
}
