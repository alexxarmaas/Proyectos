"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export function ReportButton({ listingId }: { listingId: string }) {
  const [done, setDone] = useState(false);
  async function report() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.href = "/login"; return; }
    const reason = window.prompt("¿Qué ocurre con este anuncio? Describe el motivo brevemente.");
    if (!reason?.trim()) return;
    const { error } = await supabase.from("reports").insert({ reporter_id: auth.user.id, listing_id: listingId, reason: reason.trim() });
    if (!error) setDone(true);
  }
  return <button className="link-button" onClick={report} disabled={done}>{done ? "Reporte enviado" : "Reportar anuncio"}</button>;
}
