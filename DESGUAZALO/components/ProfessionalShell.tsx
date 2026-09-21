"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AccountTabs } from "@/components/AccountTabs";
import { getBrowserSupabase } from "@/lib/supabase";

const nav = [
  ["dashboard", "/pro", "Resumen"],
  ["inventory", "/pro/inventario", "Inventario"],
  ["batch", "/pro/lote", "Añadir lote"],
  ["csv", "/pro/importar", "Importar CSV"],
  ["photos", "/pro/fotos", "Fotos por SKU"],
] as const;

export function ProfessionalShell({ active, children }: { active: string; children: ReactNode }) {
  const router = useRouter();
  const supabase = getBrowserSupabase();
  const [state, setState] = useState<"loading" | "private" | "professional" | "error">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) { setState("error"); return; }
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        const next = typeof window === "undefined" ? "/pro" : window.location.pathname + window.location.search;
        router.replace("/login?next=" + encodeURIComponent(next));
        return;
      }
      const { data, error } = await supabase.from("profiles").select("seller_kind").eq("id", auth.user.id).single();
      if (error) { setState("error"); return; }
      setState(data?.seller_kind === "professional" ? "professional" : "private");
    })();
  }, [router, supabase]);

  async function activate() {
    if (!supabase) return;
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("profiles").update({ seller_kind:"professional", updated_at:new Date().toISOString() }).eq("id", auth.user.id);
    if (!error) setState("professional");
    else setState("error");
    setBusy(false);
  }

  if (state === "loading") return <div className="shell account-page loading-block">Abriendo espacio profesional…</div>;

  if (state === "private") return (
    <div className="shell account-page">
      <div className="account-head"><div><span className="kicker">DESGUÁZALO PRO</span><h1>Inventario para vendedores frecuentes</h1><p className="muted">Carga lotes, importa CSV, usa SKU internos y publica muchas piezas sin repetir el mismo formulario.</p></div></div>
      <AccountTabs active="pro" />
      <section className="pro-activation">
        <span className="kicker">ACTIVACIÓN BETA</span>
        <h2>Activa el espacio profesional</h2>
        <p>Esto no te identifica como negocio verificado. Solo habilita herramientas de inventario para vendedores con mucho stock.</p>
        <div className="pro-feature-grid">
          <div><strong>Inventario</strong><span>SKU, ubicación interna, coste y stock.</span></div>
          <div><strong>Lotes</strong><span>Añade decenas de piezas de un vehículo a la vez.</span></div>
          <div><strong>CSV</strong><span>Mapea columnas, valida y carga inventario existente.</span></div>
          <div><strong>Publicación masiva</strong><span>Convierte el inventario listo en anuncios públicos.</span></div>
        </div>
        <button className="button button-primary" type="button" onClick={() => void activate()} disabled={busy}>{busy ? "Activando…" : "Activar DESGUÁZALO Pro"}</button>
      </section>
    </div>
  );

  if (state === "error") return <div className="shell account-page"><div className="empty-state"><h1>No se pudo abrir Pro</h1><p>Revisa tu sesión y vuelve a intentarlo.</p><Link href="/cuenta/perfil">Ir al perfil</Link></div></div>;

  return (
    <div className="shell pro-page">
      <div className="pro-topbar"><div><span className="kicker">DESGUÁZALO PRO</span><strong>Inventario profesional</strong></div><Link href="/marketplace">Ver marketplace →</Link></div>
      <AccountTabs active="pro" />
      <nav className="pro-nav" aria-label="DESGUÁZALO Pro">{nav.map(([key,href,label]) => <Link key={key} href={href} className={active===key?"active":""}>{label}</Link>)}</nav>
      {children}
    </div>
  );
}
