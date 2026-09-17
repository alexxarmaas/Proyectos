"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", location: "", whatsapp: "", phone: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (form.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (!form.whatsapp.trim() && !form.phone.trim()) return setError("Añade WhatsApp o teléfono para que puedan contactarte.");
    setBusy(true);
    const supabase = getBrowserSupabase();
    if (!supabase) { setError("Supabase aún no está configurado en este entorno."); setBusy(false); return; }
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
        data: { display_name: form.name.trim(), location: form.location.trim(), whatsapp: form.whatsapp.trim(), phone: form.phone.trim() }
      }
    });
    if (authError) { setError(authError.message); setBusy(false); return; }
    if (data.session) router.push("/publicar");
    else { setMessage("Cuenta creada. Revisa tu correo para confirmar el acceso."); setBusy(false); }
  }

  return <div className="auth-shell"><section className="auth-card wide"><h1>Crear cuenta</h1><p>Los datos de contacto que añadas se mostrarán en tus anuncios.</p><form onSubmit={submit} className="stack-form"><label>Nombre visible<input required maxLength={60} value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="Alex Garage" /></label><label>Email<input type="email" required autoComplete="email" value={form.email} onChange={(e) => set("email")(e.target.value)} /></label><label>Contraseña<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => set("password")(e.target.value)} /></label><label>Localización<input required maxLength={100} value={form.location} onChange={(e) => set("location")(e.target.value)} placeholder="Vecindario, Gran Canaria" /></label><div className="two-cols"><label>WhatsApp<input inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp")(e.target.value)} placeholder="34600111222" /></label><label>Teléfono<input inputMode="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="600 111 222" /></label></div><div className="form-hint">El email no se publica.</div>{error && <div className="form-error">{error}</div>}{message && <div className="form-success">{message}</div>}<button className="button button-primary full" disabled={busy}>{busy ? "Creando…" : "Crear cuenta"}</button></form><p className="auth-switch">¿Ya tienes cuenta? <Link href="/login">Entrar</Link></p></section></div>;
}
