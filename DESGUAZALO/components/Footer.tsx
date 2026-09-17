import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_.8fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-sm text-sm leading-6 text-slate-400">
            Recambios usados y coches en despiece. Encuentra la pieza, contacta con el vendedor y acuerda el trato directamente.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Marketplace</p>
          <Link className="block transition hover:text-white" href="/marketplace">Buscar piezas</Link>
          <Link className="block transition hover:text-white" href="/marketplace?type=vehicle">Coches en despiece</Link>
          <Link className="block transition hover:text-white" href="/publicar">Publicar anuncio</Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Trato directo</p>
          <p className="leading-6">El pago, la entrega y cualquier comprobación se acuerdan entre comprador y vendedor.</p>
        </div>
      </div>
      <div className="border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">© 2026 DESGUÁZALO</div>
      </div>
    </footer>
  );
}
