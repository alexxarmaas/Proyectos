"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const logged = Boolean(userId);

  useEffect(() => {
    const client = getBrowserSupabase();
    if (!client) { setUserId(null); return; }

    void client.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data } = client.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  return <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--dg-dark)]/96 text-white backdrop-blur-md">
    <div className="mx-auto grid h-[66px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Logo light />
        <span className="beta-badge" title="DESGUÁZALO está en beta cerrada">BETA</span>
      </div>
      <nav className="hidden items-center justify-center gap-6 md:flex" aria-label="Navegación principal">
        <Link href="/marketplace" className="text-sm font-bold text-zinc-400 transition hover:text-zinc-100">Marketplace</Link>
        <Link href="/se-busca" className="text-sm font-bold text-zinc-400 transition hover:text-zinc-100">Se busca</Link>
        <Link href="/marketplace?type=vehicle" className="text-sm font-bold text-zinc-400 transition hover:text-zinc-100">Coches en despiece</Link>
        {logged && <Link href="/pro" className="text-sm font-black text-[var(--dg-accent-text)] transition hover:text-white">Pro</Link>}
      </nav>
      <div className="flex items-center justify-end gap-2">
        <NotificationBell userId={userId} />
        <Link href={logged?"/cuenta/anuncios":"/login"} className="hidden min-w-[88px] justify-center border border-white/15 bg-white/[.025] px-3.5 py-2 text-sm font-bold text-zinc-100 transition hover:border-white/30 hover:bg-white/[.055] sm:inline-flex">{logged?"Mi cuenta":"Entrar"}</Link>
        <Link href="/publicar" className="dg-cta-safe inline-flex items-center gap-2 bg-[var(--dg-accent)] px-4 py-2 text-sm font-black uppercase tracking-[.04em] text-[var(--dg-ink)] transition hover:bg-[var(--dg-accent-hover)]"><span aria-hidden>+</span><span>Publicar</span></Link>
      </div>
    </div>
    <div className="h-[2px] bg-[linear-gradient(90deg,var(--dg-accent)_0_26%,var(--dg-dark-soft)_26%_100%)]" />
  </header>;
}
