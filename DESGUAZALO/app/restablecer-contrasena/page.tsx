"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { authErrorMessage } from "@/lib/auth";
import { getBrowserSupabase } from "@/lib/supabase";

type RecoveryState = "checking" | "ready" | "invalid" | "saving" | "saved";

export default function ResetPasswordPage() {
  const [state, setState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setState("invalid");
      return;
    }

    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) setState("ready");
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setState("ready");
      else setState((current) => current === "ready" ? current : "invalid");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== repeat) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) return;

    setState("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(authErrorMessage(updateError, "No hemos podido cambiar la contraseña."));
      setState("ready");
      return;
    }

    setState("saved");
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <span className="kicker">SEGURIDAD</span>
        <h1>Nueva contraseña</h1>

        {state === "checking" && <div className="loading-block">Comprobando el enlace…</div>}

        {state === "invalid" && (
          <>
            <div className="form-error">Este enlace no es válido o ha caducado.</div>
            <p className="auth-switch"><Link href="/recuperar-contrasena">Solicitar un enlace nuevo</Link></p>
          </>
        )}

        {state === "saved" && (
          <>
            <div className="form-success">Contraseña actualizada correctamente.</div>
            <p className="auth-switch"><Link href="/cuenta/anuncios">Ir a mi cuenta</Link></p>
          </>
        )}

        {(state === "ready" || state === "saving") && (
          <form onSubmit={submit} className="stack-form">
            <label>Nueva contraseña
              <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <label>Repite la contraseña
              <input type="password" required minLength={8} autoComplete="new-password" value={repeat} onChange={(event) => setRepeat(event.target.value)} />
            </label>
            <div className="form-hint">Usa una contraseña distinta de la anterior y evita reutilizarla en otros servicios.</div>
            {error && <div className="form-error">{error}</div>}
            <button className="button button-primary full" disabled={state === "saving"}>
              {state === "saving" ? "Guardando…" : "Guardar nueva contraseña"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
