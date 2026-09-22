import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell account-page grid place-items-center py-16">
      <section className="dg-panel max-w-2xl p-8 text-center sm:p-12">
        <span className="kicker">404 · NO DISPONIBLE</span>
        <h1 className="mt-2 font-racing text-4xl font-black uppercase sm:text-5xl">Aquí ya no hay ninguna pieza</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[var(--dg-muted)]">
          El anuncio puede haberse eliminado, vendido o la dirección puede ser incorrecta.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/marketplace" className="button button-primary">Buscar piezas</Link>
          <Link href="/" className="button button-ghost">Volver al inicio</Link>
        </div>
      </section>
    </div>
  );
}
