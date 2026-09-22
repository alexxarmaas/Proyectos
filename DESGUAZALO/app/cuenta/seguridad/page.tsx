"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTabs } from "@/components/AccountTabs";
import { authErrorMessage } from "@/lib/auth";
import { getBrowserSupabase } from "@/lib/supabase";

export default function SecurityPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login?next=/cuenta/seguridad");
        return;
      }
      setLoading(false);
    });
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== repeat) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (currentPassword === password) {
      setError("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) return;

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      currentPassword,
    });

    if (updateError) {
      setError(authErrorMessage(updateError, "No hemos podido cambiar la contraseña. Comprueba la contraseña actual."));
      setBusy(false);
      return;
    }

    setCurrentPassword("");
    setPassword("");
    setRepeat("");
    setMessage("Contraseña actualizada.");
    setBusy(false);
  }

  return (
    <div className="shell account-page">
      <div className="account-head">
        <div>
          <span className="kicker">ACCESO Y SEGURIDAD</span>
          <h1>Seguridad</h1>
          <p className="muted">Cambia la contraseña de acceso a tu cuenta.</p>
        </div>
      </div>
      <AccountTabs active="seguridad" />
      {loading ? <div className="loading-block">Comprobando sesión…</div> : (
        <form className="profile-form stack-form" onSubmit={submit}>
          <label>Contraseña actual
            <input type="password" required autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </label>
          <label>Nueva contraseña
            <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label>Repite la nueva contraseña
            <input type="password" required minLength={8} autoComplete="new-password" value={repeat} onChange={(event) => setRepeat(event.target.value)} />
          </label>
          <div className="form-hint">La nueva contraseña debe tener al menos 8 caracteres y ser distinta de la actual.</div>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <button className="button button-primary" disabled={busy}>{busy ? "Actualizando…" : "Cambiar contraseña"}</button>
        </form>
      )}
    </div>
  );
}
