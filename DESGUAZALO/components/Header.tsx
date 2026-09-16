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
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Navegación principal">
          <Link href="/marketplace">Piezas</Link>
          <Link href="/marketplace?type=vehicle">Coches en despiece</Link>
          <Link href="/publicar" className="button button-primary button-small">+ Publicar</Link>
          <Link href={logged ? "/cuenta/anuncios" : "/login"} className="button button-ghost button-small">{logged ? "Mi cuenta" : "Entrar"}</Link>
        </nav>
      </div>
    </header>
  );
}
