"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "@/lib/auth";
import { getBrowserSupabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", location: "", whatsapp: "", phone: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (!form.whatsapp.trim() && !form.phone.trim()) return setError("Añade WhatsApp o teléfono para que puedan contactarte.");

    setBusy(true);
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("El servicio de acceso no está disponible en este entorno.");
      setBusy(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
        data: {
          display_name: form.name.trim(),
          location: form.location.trim(),
          whatsapp: form.whatsapp.trim(),
          phone: form.phone.trim(),
        },
      },
    });

    if (authError) {
      setError(authErrorMessage(authError, "No hemos podido crear la cuenta."));
      setBusy(false);
      return;
    }

    if (data.session) router.push("/publicar");
    else {
      setMessage("Cuenta creada. Revisa tu correo y confirma tu email para poder entrar.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card wide">
        <h1>Crear cuenta</h1>
        <p>Los datos de contacto que añadas se mostrarán en tus anuncios.</p>
        <form onSubmit={submit} className="stack-form">
          <label>Nombre visible<input required maxLength={60} value={form.name} onChange={(event) => set("name")(event.target.value)} placeholder="Alex Garage" /></label>
          <label>Email<input type="email" required autoComplete="email" value={form.email} onChange={(event) => set("email")(event.target.value)} /></label>
          <label>Contraseña<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(event) => set("password")(event.target.value)} /></label>
          <label>Localización<input required maxLength={100} value={form.location} onChange={(event) => set("location")(event.target.value)} placeholder="Vecindario, Gran Canaria" /></label>
          <div className="two-cols">
            <label>WhatsApp<input inputMode="tel" value={form.whatsapp} onChange={(event) => set("whatsapp")(event.target.value)} placeholder="34600111222" /></label>
            <label>Teléfono<input inputMode="tel" value={form.phone} onChange={(event) => set("phone")(event.target.value)} placeholder="600 111 222" /></label>
          </div>
          <div className="form-hint">El email no se publica.</div>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <button className="button button-primary full" disabled={busy}>{busy ? "Creando…" : "Crear cuenta"}</button>
        </form>
        <p className="auth-switch">¿Ya tienes cuenta? <Link href="/login">Entrar</Link></p>
      </section>
    </div>
  );
}
