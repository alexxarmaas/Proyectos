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

        <nav className="hidden items-center justify-center gap-1 md:flex" aria-label="Navegación principal">
          <Link href="/marketplace" className="group px-4 py-2 font-racing text-sm font-bold uppercase italic tracking-[.06em] text-zinc-400 transition hover:text-white">
            <span className="mr-2 text-[10px] not-italic text-[#c8ff1a]/70">01</span>Piezas
          </Link>
          <span className="h-4 w-px -skew-x-12 bg-white/15" />
          <Link href="/marketplace?type=vehicle" className="group px-4 py-2 font-racing text-sm font-bold uppercase italic tracking-[.06em] text-zinc-400 transition hover:text-white">
            <span className="mr-2 text-[10px] not-italic text-[#c8ff1a]/70">02</span>Despiece
          </Link>
          <span className="h-4 w-px -skew-x-12 bg-white/15" />
          <Link href="/marketplace?location=Gran%20Canaria" className="group px-4 py-2 font-racing text-sm font-bold uppercase italic tracking-[.06em] text-zinc-400 transition hover:text-white">
            <span className="mr-2 text-[10px] not-italic text-[#c8ff1a]/70">03</span>Cerca de ti
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            href={logged ? "/cuenta/anuncios" : "/login"}
            className="hidden border border-white/20 bg-white/[.03] px-3.5 py-2 font-racing text-sm font-bold uppercase italic tracking-[.04em] text-white transition hover:border-white/40 hover:bg-white/[.07] sm:inline-flex"
          >
            {logged ? "Mi cuenta" : "Entrar"}
          </Link>
          <Link
            href="/publicar"
            className="race-cut-sm inline-flex items-center gap-2 bg-[#c8ff1a] px-4 py-2 font-racing text-sm font-black uppercase italic tracking-[.045em] text-[#101214] transition hover:bg-[#dcff6f]"
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
