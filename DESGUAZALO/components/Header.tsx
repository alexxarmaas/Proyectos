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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d0e]/95 text-white backdrop-blur-md">
      <div className="mx-auto grid h-[66px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo light />

        <nav className="hidden items-center justify-center gap-6 md:flex" aria-label="Navegación principal">
          <Link href="/#como-funciona" className="text-sm font-bold text-zinc-400 transition hover:text-white">
            Cómo funciona
          </Link>
          <Link href="/marketplace" className="text-sm font-bold text-zinc-400 transition hover:text-white">
            Marketplace
          </Link>
          <Link href="/marketplace?type=vehicle" className="text-sm font-bold text-zinc-400 transition hover:text-white">
            Coches en despiece
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            href={logged ? "/cuenta/anuncios" : "/login"}
            className="hidden border border-white/20 bg-white/[.03] px-3.5 py-2 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/[.07] sm:inline-flex"
          >
            {logged ? "Mi cuenta" : "Entrar"}
          </Link>
          <Link
            href="/publicar"
            className="race-cut-sm inline-flex items-center gap-2 bg-[#c8ff1a] px-4 py-2 text-sm font-black uppercase tracking-[.045em] text-[#101214] transition hover:bg-[#dcff6f]"
          >
            <span className="text-base leading-none" aria-hidden="true">+</span>
            <span>Publicar</span>
          </Link>
        </div>
      </div>
      <div className="h-[3px] bg-[linear-gradient(90deg,#c8ff1a_0_34%,#ff5a2f_34%_41%,transparent_41%_100%)]" />
    </header>
  );
}
