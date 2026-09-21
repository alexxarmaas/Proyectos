"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTabs } from "@/components/AccountTabs";
import { getBrowserSupabase } from "@/lib/supabase";
import type { SavedSearch } from "@/lib/types";

function toQuery(params: Record<string,string>) {
  return new URLSearchParams(params).toString();
}

export default function SavedSearchesPage() {
  const router = useRouter();
  const supabase = getBrowserSupabase();
  const [rows, setRows] = useState<SavedSearch[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace("/login?next=/cuenta/busquedas"); return; }
      const { data } = await supabase.from("saved_searches").select("*").eq("user_id", auth.user.id).order("created_at", { ascending:false });
      const searches = (data ?? []) as SavedSearch[];
      setRows(searches);
      const next: Record<string,number> = {};
      for (const search of searches) {
        const p = search.query_params || {};
        let query = supabase.from("listings").select("id", { count:"exact", head:true }).eq("hidden", false).neq("status", "sold").gt("created_at", search.last_checked_at || search.created_at);
        if (p.q) query = query.textSearch("search_vector", p.q, { config:"spanish", type:"websearch" });
        if (p.oem) query = query.ilike("reference_code", "%" + p.oem + "%");
        if (p.brand) query = query.eq("brand", p.brand);
        if (p.model) query = query.ilike("model", "%" + p.model + "%");
        if (p.type) query = query.eq("type", p.type);
        if (p.category) query = query.eq("category", p.category);
        if (p.location) query = query.ilike("location", "%" + p.location + "%");
        if (p.condition) query = query.eq("condition", p.condition);
        const { count } = await query;
        next[search.id] = count ?? 0;
      }
      setCounts(next);
      setLoading(false);
    })();
  }, [router, supabase]);

  async function toggle(row: SavedSearch) {
    if (!supabase) return;
    const value = !row.alerts_enabled;
    const { error } = await supabase.from("saved_searches").update({ alerts_enabled:value }).eq("id", row.id);
    if (!error) setRows((prev) => prev.map((x) => x.id === row.id ? {...x,alerts_enabled:value} : x));
  }

  async function checked(row: SavedSearch) {
    if (!supabase) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("saved_searches").update({ last_checked_at:now }).eq("id", row.id);
    if (!error) { setCounts((prev) => ({...prev,[row.id]:0})); setRows((prev) => prev.map((x) => x.id === row.id ? {...x,last_checked_at:now} : x)); }
  }

  async function remove(id: string) {
    if (!supabase) return;
    await supabase.from("saved_searches").delete().eq("id", id);
    setRows((prev) => prev.filter((x) => x.id !== id));
  }

  return <div className="shell account-page">
    <div className="account-head"><div><span className="kicker">BÚSQUEDAS GUARDADAS</span><h1>Alertas</h1><p className="muted">Aquí ves cuántos anuncios nuevos han aparecido desde la última vez que revisaste cada búsqueda.</p></div></div>
    <AccountTabs active="busquedas" />
    {loading ? <div className="loading-block">Comprobando novedades…</div> : rows.length ? <div className="saved-search-grid">{rows.map((row) => <article className="saved-search-card" key={row.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--dg-accent-strong)]">{counts[row.id] ? counts[row.id] + " nuevos" : "Sin novedades"}</span><h2 className="mt-1 text-xl">{row.name}</h2><p className="mt-1 text-sm text-[var(--dg-muted)]">{Object.entries(row.query_params || {}).filter(([key]) => key !== "sort").map(([key,value]) => key + ": " + value).join(" · ")}</p></div><div className="flex flex-wrap gap-2"><Link className="button button-small" href={"/marketplace?" + toQuery(row.query_params || {})} onClick={() => void checked(row)}>Ver resultados</Link><button className="button button-small" type="button" onClick={() => toggle(row)}>{row.alerts_enabled ? "Alerta activa" : "Alerta pausada"}</button><button className="danger-link text-sm" type="button" onClick={() => remove(row.id)}>Eliminar</button></div></div></article>)}</div> : <div className="empty-state"><h2>No has guardado búsquedas</h2><p>Guarda una búsqueda desde el marketplace y te mostraremos aquí las novedades.</p><Link className="button button-primary" href="/marketplace">Ir al marketplace</Link></div>}
  </div>;
}
