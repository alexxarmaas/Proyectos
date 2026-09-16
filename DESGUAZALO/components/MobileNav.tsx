import Link from "next/link";

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Navegación móvil">
      <Link href="/">Inicio</Link>
      <Link href="/marketplace">Buscar</Link>
      <Link href="/publicar" className="mobile-publish">+</Link>
      <Link href="/cuenta/favoritos">Favoritos</Link>
      <Link href="/cuenta/anuncios">Cuenta</Link>
    </nav>
  );
}
