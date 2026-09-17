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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 text-white shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/75">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo light />

        <nav className="hidden items-center justify-center gap-7 md:flex" aria-label="Navegación principal">
          <Link href="/marketplace" className="text-sm font-medium text-slate-300 transition hover:text-white">Piezas</Link>
          <Link href="/marketplace?type=vehicle" className="text-sm font-medium text-slate-300 transition hover:text-white">Coches en despiece</Link>
          <Link href="/marketplace?location=Gran%20Canaria" className="text-sm font-medium text-slate-300 transition hover:text-white">Cerca de ti</Link>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            href={logged ? "/cuenta/anuncios" : "/login"}
            className="hidden rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
          >
            {logged ? "Mi cuenta" : "Entrar"}
          </Link>
          <Link
            href="/publicar"
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-2 text-sm font-bold text-slate-950 shadow-sm shadow-lime-950/10 transition hover:bg-lime-300"
          >
            <span aria-hidden="true">+</span>
            <span>Publicar</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
