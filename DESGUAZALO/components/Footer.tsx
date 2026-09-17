import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-zinc-800 bg-[#0b0d0e] text-zinc-500">
      <div className="race-grid-bg absolute inset-0 opacity-25" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_.8fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-sm text-sm leading-6 text-zinc-500">
            Piezas usadas, coches donantes y trato directo. Encuentra lo que falta, comprueba la referencia y vuelve a la carretera.
          </p>
          <div className="flex gap-2 pt-1">
            <span className="race-cut-sm bg-[#c8ff1a] px-2.5 py-1 font-racing text-[10px] font-black uppercase italic tracking-[.1em] text-black">Used parts</span>
            <span className="race-cut-sm border border-white/10 px-2.5 py-1 font-racing text-[10px] font-black uppercase italic tracking-[.1em] text-zinc-500">Direct deal</span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-racing text-base font-black uppercase italic tracking-[.04em] text-white">Pit lane</p>
          <Link className="block transition hover:text-[#c8ff1a]" href="/marketplace">Buscar piezas</Link>
          <Link className="block transition hover:text-[#c8ff1a]" href="/marketplace?type=vehicle">Coches en despiece</Link>
          <Link className="block transition hover:text-[#c8ff1a]" href="/publicar">Publicar anuncio</Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-racing text-base font-black uppercase italic tracking-[.04em] text-white">Reglas del box</p>
          <p className="leading-6">DESGUÁZALO no cobra ni envía por ti. Comprueba la pieza y acuerda pago y entrega directamente con el vendedor.</p>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 text-[10px] font-bold uppercase tracking-[.08em] text-zinc-600 sm:px-6 lg:px-8">
          <span>© 2026 DESGUÁZALO</span>
          <span className="font-racing italic">GC / ES · Build for petrolheads</span>
        </div>
      </div>
      <div className="h-1 bg-[linear-gradient(90deg,#c8ff1a_0_28%,#ff5a2f_28%_34%,#171a1c_34%_100%)]" />
    </footer>
  );
}
