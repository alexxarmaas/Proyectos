"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authErrorMessage, safeInternalPath } from "@/lib/auth";
import { getBrowserSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("El servicio de acceso no está disponible en este entorno.");
      setBusy(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authErrorMessage(authError));
      setBusy(false);
      return;
    }

    const next = safeInternalPath(new URLSearchParams(window.location.search).get("next"));
    router.replace(next);
  }

  const confirmed = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("confirmed") === "1";

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <h1>Entrar</h1>
        {confirmed && <div className="form-success">Email confirmado. Ya puedes entrar en tu cuenta.</div>}
        <form onSubmit={submit} className="stack-form">
          <label>Email
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>Contraseña
            <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <div className="form-hint"><Link href="/recuperar-contrasena">¿Has olvidado la contraseña?</Link></div>
          {error && <div className="form-error">{error}</div>}
          <button className="button button-primary full" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
        </form>
        <p className="auth-switch">¿No tienes cuenta? <Link href="/registro">Crear cuenta</Link></p>
      </section>
    </div>
  );
}
