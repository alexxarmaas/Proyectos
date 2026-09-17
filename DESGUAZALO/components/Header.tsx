"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { Logo } from "./Logo";

export function Header() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setLogged(Boolean(data.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setLogged(Boolean(session?.user)));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#141715]/96 text-white backdrop-blur-md">
      <div className="mx-auto grid h-[66px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo light />

        <nav className="hidden items-center justify-center gap-6 md:flex" aria-label="Navegación principal">
          <Link href="/#como-funciona" className="text-sm font-bold text-zinc-400 transition hover:text-zinc-100">
            Cómo funciona
          </Link>
          <Link href="/marketplace" className="text-sm font-bold text-zinc-400 transition hover:text-zinc-100">
            Marketplace
          </Link>
          <Link href="/marketplace?type=vehicle" className="text-sm font-bold text-zinc-400 transition hover:text-zinc-100">
            Coches en despiece
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            href={logged ? "/cuenta/anuncios" : "/login"}
            className="hidden border border-white/15 bg-white/[.025] px-3.5 py-2 text-sm font-bold text-zinc-100 transition hover:border-white/30 hover:bg-white/[.055] sm:inline-flex"
          >
            {logged ? "Mi cuenta" : "Entrar"}
          </Link>
          <Link
            href="/publicar"
            className="race-cut-sm inline-flex items-center gap-2 bg-[#b6c18a] px-4 py-2 text-sm font-black uppercase tracking-[.045em] text-[#181b19] transition hover:bg-[#c5cda6]"
          >
            <span className="text-base leading-none" aria-hidden="true">+</span>
            <span>Publicar</span>
          </Link>
        </div>
      </div>
      <div className="h-[2px] bg-[linear-gradient(90deg,#b6c18a_0_28%,#3a403b_28%_100%)]" />
    </header>
  );
}
