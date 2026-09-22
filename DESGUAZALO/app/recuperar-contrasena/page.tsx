"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "@/lib/auth";
import { getBrowserSupabase } from "@/lib/supabase";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setState("sending");

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("El servicio de acceso no está disponible en este entorno.");
      setState("idle");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });

    if (resetError) {
      setError(authErrorMessage(resetError, "No hemos podido enviar el correo de recuperación."));
      setState("idle");
      return;
    }

    setState("sent");
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <span className="kicker">RECUPERAR ACCESO</span>
        <h1>Restablecer contraseña</h1>
        {state === "sent" ? (
          <>
            <div className="form-success">
              Si existe una cuenta con ese email, te hemos enviado un enlace para crear una contraseña nueva.
            </div>
            <p className="auth-switch">¿Ya puedes entrar? <Link href="/login">Volver al acceso</Link></p>
          </>
        ) : (
          <>
            <p>Introduce el email de tu cuenta. El enlace de recuperación te llevará de vuelta a DESGUÁZALO.</p>
            <form onSubmit={submit} className="stack-form">
              <label>Email
                <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              {error && <div className="form-error">{error}</div>}
              <button className="button button-primary full" disabled={state === "sending"}>
                {state === "sending" ? "Enviando…" : "Enviar enlace de recuperación"}
              </button>
            </form>
            <p className="auth-switch"><Link href="/login">← Volver a entrar</Link></p>
          </>
        )}
      </section>
    </div>
  );
}
