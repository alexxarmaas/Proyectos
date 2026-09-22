"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export function SaveSearchButton({ params, nameHint }: { params: Record<string, string | undefined>; nameHint?:string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setState("saving");
    const { data: auth } = await supabase.auth.getSession();
    const user=auth.session?.user;
    const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
    if (!user) {
      router.push("/login?next=" + encodeURIComponent("/marketplace?" + query.toString()));
      return;
    }
    const clean = Object.fromEntries(Array.from(query.entries()));
    const name = nameHint || clean.q || clean.oem || [clean.brand, clean.model, clean.category].filter(Boolean).join(" · ") || "Búsqueda de recambios";
    const { error } = await supabase.from("saved_searches").insert({ user_id: user.id, name, query_params: clean, alerts_enabled: true });
    setState(error ? "error" : "saved");
  }

  return (
    <button type="button" onClick={save} disabled={state === "saving" || state === "saved"} className={"save-search-button " + (state === "saved" ? "saved" : "")}>
      {state === "saving" ? "Guardando…" : state === "saved" ? "✓ Alerta guardada" : state === "error" ? "Reintentar" : "☆ Guardar búsqueda"}
    </button>
  );
}
