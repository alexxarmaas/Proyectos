import Link from "next/link";
import { Logo } from "./Logo";

const linkClass = "block hover:text-[var(--dg-accent-text)]";

export function Footer() {
  return <footer className="relative overflow-hidden border-t border-zinc-800 bg-[var(--dg-dark)] text-zinc-500">
    <div className="race-grid-bg absolute inset-0 opacity-15" />
    <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.25fr_.75fr_.8fr_1fr] lg:px-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2"><Logo light /><span className="beta-badge">BETA</span></div>
        <p className="max-w-sm text-sm leading-6">Piezas usadas, coches donantes y trato directo. Guarda tu coche, comprueba la referencia y encuentra antes lo que necesitas.</p>
        <p className="max-w-sm text-xs leading-5 text-zinc-600">DESGUÁZALO no procesa el pago ni la entrega entre comprador y vendedor.</p>
      </div>
      <div className="space-y-3 text-sm">
        <p className="font-racing text-base font-black uppercase text-zinc-100">Marketplace</p>
        <Link className={linkClass} href="/marketplace">Buscar piezas</Link>
        <Link className={linkClass} href="/se-busca">Se busca</Link>
        <Link className={linkClass} href="/marketplace?type=vehicle">Coches en despiece</Link>
        <Link className={linkClass} href="/publicar">Publicar anuncio</Link>
      </div>
      <div className="space-y-3 text-sm">
        <p className="font-racing text-base font-black uppercase text-zinc-100">Ayuda</p>
        <Link className={linkClass} href="/como-funciona">Cómo funciona</Link>
        <Link className={linkClass} href="/seguridad-compraventas">Seguridad en compraventas</Link>
        <Link className={linkClass} href="/cuenta/garaje">Mi garaje</Link>
        <Link className={linkClass} href="/cuenta/busquedas">Alertas</Link>
      </div>
      <div className="space-y-3 text-sm">
        <p className="font-racing text-base font-black uppercase text-zinc-100">Legal</p>
        <Link className={linkClass} href="/legal/terminos">Términos y aviso legal</Link>
        <Link className={linkClass} href="/legal/privacidad">Privacidad</Link>
        <Link className={linkClass} href="/legal/cookies">Cookies y almacenamiento</Link>
        <p className="pt-2 leading-6">Comprueba siempre referencia, estado y condiciones directamente con el vendedor.</p>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-5 text-[10px] font-bold uppercase tracking-[.08em] text-zinc-600 sm:px-6 lg:px-8">
        <span>© 2026 DESGUÁZALO · Beta cerrada</span>
        <span>GC / ES · Recambios directos</span>
      </div>
    </div>
  </footer>;
}
