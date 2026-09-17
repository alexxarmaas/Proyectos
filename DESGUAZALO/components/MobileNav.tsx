import Link from "next/link";

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-center rounded-2xl border border-slate-200/80 bg-white/95 px-2 py-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl md:hidden" aria-label="Navegación móvil">
      <Link href="/" className="grid place-items-center gap-1 text-[10px] font-semibold text-slate-600">
        <Icon path="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9" />
        Inicio
      </Link>
      <Link href="/marketplace" className="grid place-items-center gap-1 text-[10px] font-semibold text-slate-600">
        <Icon path="m21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />
        Buscar
      </Link>
      <Link href="/publicar" className="mx-auto grid h-11 w-11 -translate-y-2 place-items-center rounded-2xl bg-lime-400 text-2xl font-light text-slate-950 shadow-lg shadow-lime-500/20" aria-label="Publicar anuncio">
        +
      </Link>
      <Link href="/cuenta/favoritos" className="grid place-items-center gap-1 text-[10px] font-semibold text-slate-600">
        <Icon path="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.8l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.4 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        Favoritos
      </Link>
      <Link href="/cuenta/anuncios" className="grid place-items-center gap-1 text-[10px] font-semibold text-slate-600">
        <Icon path="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
        Cuenta
      </Link>
    </nav>
  );
}
