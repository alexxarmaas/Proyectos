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

function SectionHeading({ index, eyebrow, title, href, linkLabel, inverse = false }: { index: string; eyebrow: string; title: string; href?: string; linkLabel?: string; inverse?: boolean }) {
  return (
    <div className={`mb-7 flex items-end justify-between gap-4 border-b pb-4 sm:mb-8 ${inverse ? "border-white/15" : "border-zinc-300"}`}>
      <div className="flex items-end gap-4">
        <span className={`font-racing text-4xl font-black italic leading-none ${inverse ? "text-[#c8ff1a]" : "text-zinc-300"}`}>{index}</span>
        <div>
          <p className={`race-kicker mb-1 text-[10px] ${inverse ? "text-zinc-500" : "text-zinc-500"}`}>{eyebrow}</p>
          <h2 className={`font-racing text-3xl font-black uppercase italic leading-none tracking-[-0.03em] sm:text-4xl ${inverse ? "text-white" : "text-[#101214]"}`}>{title}</h2>
        </div>
      </div>
      {href && linkLabel && (
        <Link href={href} className={`hidden items-center gap-2 font-racing text-sm font-black uppercase italic tracking-[.05em] sm:inline-flex ${inverse ? "text-zinc-400 hover:text-[#c8ff1a]" : "text-zinc-600 hover:text-black"}`}>
          {linkLabel}<span className="text-[#ff5a2f]">→</span>
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
    <div className="bg-[#f3f4ef]">
      <section className="relative isolate overflow-hidden bg-[#0b0d0e] text-white">
        <div className="race-grid-bg absolute inset-0 -z-30 opacity-70" />
        <div className="race-noise absolute inset-0 -z-20 opacity-[.08]" />
        <div className="absolute -right-32 top-8 -z-20 h-[520px] w-[520px] rotate-12 border-[90px] border-[#c8ff1a]/[.055]" />
        <div className="absolute -left-24 bottom-[-120px] -z-20 h-64 w-[520px] -skew-x-12 bg-[#ff5a2f]/[.055]" />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1.25fr_.75fr] lg:gap-16">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="race-cut-sm bg-[#c8ff1a] px-3 py-1 font-racing text-xs font-black uppercase italic tracking-[.1em] text-black">Used parts / Live stock</span>
                <span className="race-tech text-[10px] font-bold uppercase text-zinc-600">GC · Marketplace · Direct deal</span>
              </div>
              <h1 className="font-racing max-w-5xl text-[clamp(4.2rem,10vw,8.5rem)] font-black uppercase italic leading-[.78] tracking-[-0.055em] text-white">
                Encuentra.<br />Monta.<br /><span className="text-[#c8ff1a]">Arranca.</span>
              </h1>
              <p className="mt-7 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                Recambios usados y coches en despiece. Busca la referencia, localiza la pieza y habla directamente con quien la tiene.
              </p>
            </div>

            <div className="hidden border-l border-white/10 pl-8 lg:block">
              <div className="race-kicker mb-5 text-[10px] text-zinc-600">Marketplace status</div>
              <div className="space-y-0 border-y border-white/10">
                <div className="grid grid-cols-[72px_1fr] items-center border-b border-white/10 py-4">
                  <strong className="font-racing text-3xl font-black italic text-[#c8ff1a]">01</strong>
                  <div><b className="block font-racing text-base uppercase italic">Sin comisiones</b><span className="text-xs text-zinc-600">Trato directo entre particulares</span></div>
                </div>
                <div className="grid grid-cols-[72px_1fr] items-center border-b border-white/10 py-4">
                  <strong className="font-racing text-3xl font-black italic text-white">02</strong>
                  <div><b className="block font-racing text-base uppercase italic">Stock local</b><span className="text-xs text-zinc-600">Piezas y despieces cerca de ti</span></div>
                </div>
                <div className="grid grid-cols-[72px_1fr] items-center py-4">
                  <strong className="font-racing text-3xl font-black italic text-[#ff5a2f]">03</strong>
                  <div><b className="block font-racing text-base uppercase italic">Datos útiles</b><span className="text-xs text-zinc-600">Motor, generación, OEM y estado</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 lg:mt-14"><HeroSearch /></div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="race-kicker mr-2 text-[9px] text-zinc-600">Atajos</span>
            {quickSearches.map(([label, href]) => (
              <Link key={href} href={href} className="border-b border-zinc-700 py-1 font-racing font-bold uppercase italic tracking-[.04em] text-zinc-400 transition hover:border-[#c8ff1a] hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="race-divider" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <SectionHeading index="01" eyebrow="Últimas entradas al stock" title="Recién publicados" href="/marketplace" linkLabel="Ver todo el stock" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {recent.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
        <Link href="/marketplace" className="mt-7 inline-flex font-racing text-sm font-black uppercase italic text-black sm:hidden">Ver todo el stock <span className="ml-2 text-[#ff5a2f]">→</span></Link>
      </section>

      <section className="border-y border-zinc-300 bg-[#e6e8e1]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <SectionHeading index="02" eyebrow="Navega por sistema" title="Zonas del coche" />
          <div className="grid grid-cols-2 gap-px overflow-hidden border border-zinc-400 bg-zinc-400 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category, index) => (
              <Link
                key={category}
                href={`/marketplace?category=${encodeURIComponent(category)}`}
                className="group relative flex min-h-28 flex-col justify-between bg-[#f3f4ef] p-4 transition hover:bg-[#101214] sm:min-h-32"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-zinc-500 transition group-hover:text-[#c8ff1a]"><CategoryIcon category={category} /></span>
                  <span className="font-racing text-[10px] font-black italic text-zinc-400 group-hover:text-zinc-700">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <strong className="font-racing block text-lg font-black uppercase italic leading-none text-[#101214] transition group-hover:text-white">{category}</strong>
                  <span className="mt-2 block h-[2px] w-8 bg-[#ff5a2f] transition-all group-hover:w-16 group-hover:bg-[#c8ff1a]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#101214] text-white">
        <div className="race-grid-bg mx-auto max-w-[1600px]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <SectionHeading index="03" eyebrow="Donor cars / Complete units" title="Coches en despiece" href="/marketplace?type=vehicle" linkLabel="Ver todos" inverse />
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {vehicles.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          </div>
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <SectionHeading index="04" eyebrow="Stock de la isla" title="Gran Canaria" href="/marketplace?location=Gran%20Canaria" linkLabel="Ver stock local" />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {nearby.map((listing) => <ListingCard key={`near-${listing.id}`} listing={listing} />)}
          </div>
        </section>
      )}

      <section className="border-t border-zinc-300 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="race-cut relative overflow-hidden bg-[#c8ff1a] p-7 text-[#101214] shadow-[10px_10px_0_#101214] sm:p-10">
            <div className="absolute right-[-20px] top-[-45px] font-racing text-[11rem] font-black italic leading-none text-black/[.055]">D/</div>
            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="race-kicker mb-2 text-[10px] text-black/55">Seller lane / 05</p>
                <h2 className="font-racing max-w-3xl text-4xl font-black uppercase italic leading-[.9] tracking-[-0.04em] sm:text-6xl">¿Tienes piezas cogiendo polvo?</h2>
                <p className="mt-4 max-w-2xl text-sm font-medium text-black/65 sm:text-base">Fotos, coche de procedencia, precio y zona. Nada de formularios eternos.</p>
              </div>
              <Link href="/publicar" className="race-cut-sm inline-flex min-h-12 items-center justify-center bg-[#101214] px-6 font-racing text-base font-black uppercase italic tracking-[.055em] text-white transition hover:bg-[#ff5a2f]">Publicar anuncio →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
