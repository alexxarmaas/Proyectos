"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTabs } from "@/components/AccountTabs";
import { formatPrice } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabase";
import type { PartRequest, RequestMatch } from "@/lib/types";

export default function MyRequestsPage() {
  const router = useRouter();
  const supabase = getBrowserSupabase();
  const [rows, setRows] = useState<PartRequest[]>([]);
  const [matches, setMatches] = useState<RequestMatch[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) { setLoading(false); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.replace("/login?next=/cuenta/solicitudes"); return; }

    const { data: requests } = await supabase.from("part_requests").select("*").eq("requester_id", auth.user.id).order("created_at", { ascending: false });
    const requestRows = (requests ?? []) as PartRequest[];
    setRows(requestRows);

    if (requestRows.length) {
      const ids = requestRows.map((row) => row.id);
      const { data: matchRows } = await supabase
        .from("request_matches")
        .select("request_id, listing_id, score, reasons, seen_at, created_at, listing:listings!request_matches_listing_id_fkey(id,title,slug,price,status,reference_code,brand,model,generation,year,listing_images(public_url,position))")
        .in("request_id", ids)
        .order("score", { ascending: false })
        .order("created_at", { ascending: false });
      setMatches((matchRows ?? []).filter((row) => row.listing) as unknown as RequestMatch[]);
    } else {
      setMatches([]);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const grouped = useMemo(() => {
    const map: Record<string, RequestMatch[]> = {};
    for (const match of matches) (map[match.request_id] ??= []).push(match);
    return map;
  }, [matches]);

  async function status(id: string, value: "open" | "closed") {
    if (!supabase) return;
    const { error } = await supabase.from("part_requests").update({ status: value }).eq("id", id);
    if (!error) await load();
  }

  async function remove(id: string) {
    if (!supabase || !confirm("¿Eliminar esta solicitud?")) return;
    const { error } = await supabase.from("part_requests").delete().eq("id", id);
    if (!error) await load();
  }

  async function markSeen(requestId: string) {
    if (!supabase) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("request_matches").update({ seen_at: now }).eq("request_id", requestId);
    if (!error) setMatches((prev) => prev.map((x) => x.request_id === requestId ? { ...x, seen_at: now } : x));
  }

  return (
    <div className="shell account-page">
      <div className="account-head"><div><span className="kicker">LO QUE BUSCAS</span><h1>Mis solicitudes</h1><p className="muted">DESGUÁZALO compara automáticamente tus solicitudes con los anuncios que van entrando.</p></div><Link className="button button-primary" href="/solicitar">+ Pedir pieza</Link></div>
      <AccountTabs active="solicitudes" />

      {loading ? <div className="loading-block">Buscando coincidencias…</div> : rows.length ? <div className="request-grid">
        {rows.map((row) => {
          const requestMatches = grouped[row.id] ?? [];
          const newCount = requestMatches.filter((match) => !match.seen_at).length;
          return <article className="request-card request-match-card" key={row.id}>
            <div className="request-match-head">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={"status status-" + (row.status === "open" ? "available" : "sold")}>{row.status === "open" ? "Buscando" : "Cerrada"}</span>
                  {newCount > 0 && <span className="match-new">{newCount} nueva{newCount === 1 ? "" : "s"}</span>}
                </div>
                <h2 className="mt-2 text-xl">{row.title}</h2>
                <p className="mt-1 text-sm text-[var(--dg-muted)]">{[row.brand, row.model, row.generation, row.year, row.engine].filter(Boolean).join(" · ")}</p>
                {row.reference_code && <p className="mt-1 text-sm"><strong>OEM:</strong> {row.reference_code}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {row.status === "open" ? <button className="button button-small" onClick={() => void status(row.id, "closed")}>Ya la encontré</button> : <button className="button button-small" onClick={() => void status(row.id, "open")}>Reabrir</button>}
                <button className="danger-link text-sm" onClick={() => void remove(row.id)}>Eliminar</button>
              </div>
            </div>

            {row.status === "open" && <div className="match-results">
              <div className="match-results-title"><strong>{requestMatches.length ? requestMatches.length + " posibles coincidencias" : "Aún sin coincidencias"}</strong>{newCount > 0 && <button type="button" onClick={() => void markSeen(row.id)}>Marcar revisadas</button>}</div>
              {requestMatches.length ? <div className="match-list">{requestMatches.slice(0, 4).map((match) => {
                const listing = match.listing!;
                return <Link href={"/pieza/" + listing.slug} className="match-row" key={match.listing_id}>
                  <div>
                    <strong>{listing.title}</strong>
                    <span>{[listing.brand, listing.model, listing.generation, listing.year].filter(Boolean).join(" · ")}{listing.reference_code ? " · OEM " + listing.reference_code : ""}</span>
                    <small>{match.reasons.join(" · ")}</small>
                  </div>
                  <div><b>{formatPrice(listing.price)}</b><span>Ver pieza →</span></div>
                </Link>;
              })}</div> : <p className="match-empty">Cuando entre una pieza que encaje por OEM o vehículo + descripción, aparecerá aquí automáticamente.</p>}
            </div>}
          </article>;
        })}
      </div> : <div className="empty-state"><h2>No tienes solicitudes</h2><p>Si una pieza no aparece en el marketplace, publícala en “Se busca”.</p><Link className="button button-primary" href="/solicitar">Pedir una pieza</Link></div>}
    </div>
  );
}
