import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return <footer className="relative overflow-hidden border-t border-zinc-800 bg-[var(--dg-dark)] text-zinc-500">
    <div className="race-grid-bg absolute inset-0 opacity-15" />
    <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_.8fr_1fr] lg:px-8">
      <div className="space-y-4"><Logo light /><p className="max-w-sm text-sm leading-6">Piezas usadas, coches donantes y trato directo. Guarda tu coche, comprueba la referencia y encuentra antes lo que necesitas.</p></div>
      <div className="space-y-3 text-sm"><p className="font-racing text-base font-black uppercase text-zinc-100">Marketplace</p><Link className="block hover:text-[var(--dg-accent-text)]" href="/marketplace">Buscar piezas</Link><Link className="block hover:text-[var(--dg-accent-text)]" href="/se-busca">Se busca</Link><Link className="block hover:text-[var(--dg-accent-text)]" href="/marketplace?type=vehicle">Coches en despiece</Link><Link className="block hover:text-[var(--dg-accent-text)]" href="/publicar">Publicar anuncio</Link></div>
      <div className="space-y-3 text-sm"><p className="font-racing text-base font-black uppercase text-zinc-100">Mi DESGUÁZALO</p><Link className="block hover:text-[var(--dg-accent-text)]" href="/cuenta/garaje">Mi garaje</Link><Link className="block hover:text-[var(--dg-accent-text)]" href="/cuenta/busquedas">Alertas</Link><Link className="block hover:text-[var(--dg-accent-text)]" href="/cuenta/favoritos">Favoritos</Link><p className="pt-2 leading-6">Comprueba siempre referencia, estado y entrega directamente con el vendedor.</p></div>
    </div>
    <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl justify-between gap-4 px-4 py-5 text-[10px] font-bold uppercase tracking-[.08em] text-zinc-600 sm:px-6 lg:px-8"><span>© 2026 DESGUÁZALO</span><span>GC / ES · Recambios directos</span></div></div>
  </footer>;
}
