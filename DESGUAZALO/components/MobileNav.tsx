import Link from "next/link";

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function MobileNav() {
  const itemClass = "grid place-items-center gap-1 font-racing text-[10px] font-black uppercase italic tracking-[.05em] text-zinc-400 transition active:text-[#d1d8b5]";

  return (
    <nav className="race-cut-sm fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-center border border-white/12 bg-[#181b19]/96 px-2 py-2 shadow-[7px_7px_0_rgba(0,0,0,.2)] backdrop-blur-md md:hidden" aria-label="Navegación móvil">
      <Link href="/" className={itemClass}>
        <Icon path="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9" />
        Inicio
      </Link>
      <Link href="/marketplace" className={itemClass}>
        <Icon path="m21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />
        Buscar
      </Link>
      <Link href="/publicar" className="race-cut-sm mx-auto grid h-12 w-12 -translate-y-2 place-items-center bg-[#b6c18a] font-racing text-3xl font-black italic leading-none text-[#181b19] shadow-[4px_4px_0_#596157]" aria-label="Publicar anuncio">
        +
      </Link>
      <Link href="/cuenta/favoritos" className={itemClass}>
        <Icon path="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.8l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.4 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        Favoritos
      </Link>
      <Link href="/cuenta/anuncios" className={itemClass}>
        <Icon path="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
        Cuenta
      </Link>
    </nav>
  );
}
