import Link from "next/link";
import { CategoryIcon } from "@/components/CategoryIcon";
import { HeroSearch } from "@/components/HeroSearch";
import { ListingCard } from "@/components/ListingCard";
import { categories } from "@/lib/catalog";
import { getListings } from "@/lib/data";

const quickSearches = [
  ["Faros Golf 7", "/marketplace?q=faros+golf+7"],
  ["Caja Polo 1.0 TSI", "/marketplace?q=caja+polo+1.0+tsi"],
  ["Despiece Ibiza 6J", "/marketplace?q=despiece+ibiza+6j"],
  ["Motor BMW E46", "/marketplace?q=motor+bmw+e46"],
] as const;

function SectionHeading({ eyebrow, title, href, linkLabel }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 sm:mb-8">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-black uppercase tracking-[.14em] text-lime-600">{eyebrow}</p>}
        <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className="hidden items-center gap-1 text-sm font-bold text-slate-600 transition hover:text-slate-950 sm:inline-flex">
          {linkLabel}<span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [recent, vehicles, nearby] = await Promise.all([
    getListings({ limit: 8 }),
    getListings({ type: "vehicle", limit: 4 }),
    getListings({ location: "Gran Canaria", limit: 4 }),
  ]);

  return (
    <div className="bg-slate-50">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(190,242,100,.18),transparent_31%),radial-gradient(circle_at_82%_12%,rgba(51,65,85,.6),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              Recambios usados · trato directo
            </div>
            <h1 className="text-balance text-4xl font-black leading-[1.03] tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
              Encuentra el recambio exacto para tu coche
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-7 text-slate-300 sm:text-lg">
              Busca por marca, modelo o pieza. Compara anuncios y habla directamente con quien la vende.
            </p>
          </div>

          <div className="mx-auto mt-9 max-w-5xl sm:mt-11">
            <HeroSearch />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="mr-1 font-semibold text-slate-500">Búsquedas populares</span>
              {quickSearches.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 transition hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 divide-x divide-white/10 text-center">
            <div className="px-3"><strong className="block text-sm font-bold text-white">Sin comisiones</strong><span className="mt-1 block text-xs text-slate-500">Acuerdo entre particulares</span></div>
            <div className="px-3"><strong className="block text-sm font-bold text-white">Búsqueda precisa</strong><span className="mt-1 block text-xs text-slate-500">Marca, modelo y pieza</span></div>
            <div className="px-3"><strong className="block text-sm font-bold text-white">Publicación rápida</strong><span className="mt-1 block text-xs text-slate-500">Fotos, precio y listo</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading eyebrow="Recién publicados" title="Últimos anuncios" href="/marketplace" linkLabel="Ver todos" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {recent.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
        <Link href="/marketplace" className="mt-6 inline-flex text-sm font-bold text-slate-700 sm:hidden">Ver todos los anuncios →</Link>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading eyebrow="Encuentra más rápido" title="Busca por categoría" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/marketplace?category=${encodeURIComponent(category)}`}
                className="group flex min-h-28 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-lime-300 hover:bg-white hover:shadow-lg hover:shadow-slate-200/60"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition group-hover:bg-lime-50 group-hover:text-lime-700 group-hover:ring-lime-200">
                  <CategoryIcon category={category} />
                </span>
                <span className="mt-5 flex items-end justify-between gap-2">
                  <strong className="text-sm font-bold text-slate-900">{category}</strong>
                  <span className="text-sm text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-lime-600">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading eyebrow="Vehículos completos" title="Coches en despiece" href="/marketplace?type=vehicle" linkLabel="Ver todos" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {vehicles.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="bg-slate-100/70">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <SectionHeading eyebrow="Cerca de ti" title="Recambios en Gran Canaria" href="/marketplace?location=Gran%20Canaria" linkLabel="Ver anuncios de la isla" />
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {nearby.map((listing) => <ListingCard key={`near-${listing.id}`} listing={listing} />)}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-9 text-white shadow-xl shadow-slate-200 sm:px-10 sm:py-11">
          <div className="absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-16 rounded-full bg-lime-400/15 blur-3xl" />
          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[.14em] text-lime-400">Vender una pieza</p>
              <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">¿Tienes recambios parados en el garaje?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">Sube las fotos, indica de qué coche sale, fija el precio y empieza a recibir interesados.</p>
            </div>
            <Link href="/publicar" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-lime-300">Publicar anuncio</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
