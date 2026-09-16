"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    const supabase = getBrowserSupabase();
    if (!supabase) { setError("Supabase aún no está configurado en este entorno."); setBusy(false); return; }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setBusy(false); return; }
    const next = new URLSearchParams(window.location.search).get("next") || "/cuenta/anuncios";
    window.location.href = next;
  }

  return <div className="auth-shell"><section className="auth-card"><span className="kicker">VUELVE AL GARAJE</span><h1>Entrar</h1><p>Gestiona tus anuncios, favoritos y piezas vendidas.</p><form onSubmit={submit} className="stack-form"><label>Email<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Contraseña<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary full" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button></form><p className="auth-switch">¿Primera vez? <Link href="/registro">Crear cuenta</Link></p></section></div>;
}
