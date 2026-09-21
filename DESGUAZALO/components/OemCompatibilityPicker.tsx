"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import type { ListingCompatibility, OemCompatibilitySuggestion } from "@/lib/types";

function keyOf(row: ListingCompatibility) {
  return [row.brand, row.model, row.generation ?? "", row.engine ?? "", row.year_from ?? "", row.year_to ?? ""].join("|").toLowerCase();
}

export function OemCompatibilityPicker({ reference, onChange }: { reference: string; onChange: (rows: ListingCompatibility[]) => void }) {
  const [suggestions, setSuggestions] = useState<OemCompatibilitySuggestion[]>([]);
  const [selected, setSelected] = useState<ListingCompatibility[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function lookup() {
    const value = reference.trim();
    if (value.length < 4) { setState("error"); return; }
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setState("loading");
    const { data, error } = await supabase.rpc("oem_compatibility_suggestions", { p_reference: value });
    if (error) { setState("error"); return; }
    setSuggestions((data ?? []) as OemCompatibilitySuggestion[]);
    setSelected([]);
    onChange([]);
    setState("done");
  }

  function toggle(row: OemCompatibilitySuggestion) {
    const key = keyOf(row);
    const exists = selected.some((item) => keyOf(item) === key);
    const next = exists
      ? selected.filter((item) => keyOf(item) !== key)
      : [...selected, { brand: row.brand, model: row.model, generation: row.generation, year_from: row.year_from, year_to: row.year_to, engine: row.engine }];
    setSelected(next);
    onChange(next);
  }

  return (
    <div className="oem-suggest-box">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><strong>Compatibilidad aprendida</strong><p className="form-hint">Busca vehículos vistos antes con esta misma referencia OEM. Tú decides cuáles declarar.</p></div>
        <button type="button" className="button button-small" onClick={() => void lookup()} disabled={state === "loading"}>{state === "loading" ? "Buscando…" : "Buscar por OEM"}</button>
      </div>
      {state === "done" && suggestions.length === 0 && <p className="oem-suggest-empty">Todavía no hay histórico para esta referencia.</p>}
      {suggestions.length > 0 && <div className="oem-suggestions">{suggestions.map((row) => {
        const active = selected.some((item) => keyOf(item) === keyOf(row));
        return <button type="button" key={keyOf(row)} className={"oem-suggestion " + (active ? "active" : "")} onClick={() => toggle(row)}>
          <span>{active ? "✓" : "+"}</span>
          <strong>{row.brand} {row.model}{row.generation ? " " + row.generation : ""}</strong>
          <small>{[row.engine, row.year_from || row.year_to ? (row.year_from || "…") + "–" + (row.year_to || "…") : null, Number(row.occurrences) + " anuncio" + (Number(row.occurrences) === 1 ? "" : "s")].filter(Boolean).join(" · ")}</small>
        </button>;
      })}</div>}
      {state === "error" && <p className="oem-suggest-empty">Escribe una referencia válida para consultar el histórico.</p>}
    </div>
  );
}
