import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { categories, conditions, popularBrands } from "@/lib/catalog";
import { getListings } from "@/lib/data";

export const metadata: Metadata = { title: "Marketplace", description: "Busca piezas de coche usadas y vehículos completos para despiece." };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

const fieldClass = "mt-1.5 w-full border border-zinc-300 bg-[#fbfbf8] px-3 py-2.5 text-sm font-semibold text-[#181b19] outline-none transition focus:border-[#68714f] focus:ring-4 focus:ring-[#b6c18a]/25";

export default async function Marketplace({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const filters = {
    q: one(p.q), brand: one(p.brand), model: one(p.model), year: one(p.year), category: one(p.category), minPrice: one(p.minPrice), maxPrice: one(p.maxPrice), location: one(p.location), condition: one(p.condition), status: one(p.status), type: one(p.type)
  };
  const listings = await getListings(filters);
  const title = filters.q ? `Resultados: ${filters.q}` : filters.type === "vehicle" ? "Coches en despiece" : "Stock de recambios";

  return (
    <div className="bg-[#f0efe9]">
      <section className="relative overflow-hidden border-b border-[#343935] bg-[#181b19] text-white">
        <div className="race-grid-bg absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="race-cut-sm bg-[#b6c18a] px-2.5 py-1 font-racing text-[10px] font-black uppercase italic tracking-[.12em] text-[#181b19]">Live inventory</span>
                <span className="race-tech text-[10px] font-bold uppercase text-zinc-600">Search / filter / contact</span>
              </div>
              <h1 className="font-racing text-5xl font-black uppercase italic leading-[.88] tracking-[-0.045em] text-zinc-100 sm:text-6xl">{title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">Piezas usadas y coches donantes. Filtra por coche, sistema, estado y zona.</p>
            </div>
            <div className="lg:pb-1"><SearchBar defaultValue={filters.q ?? ""} compact /></div>
          </div>
        </div>
        <div className="h-[2px] bg-[linear-gradient(90deg,#b6c18a_0_22%,#343935_22%_100%)]" />
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-9 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <aside className="race-cut h-max border border-zinc-300 bg-[#fbfbf8] shadow-[6px_6px_0_#dddcd5] lg:sticky lg:top-24">
          <div className="border-b border-zinc-300 bg-[#181b19] px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="race-kicker block text-[9px] text-zinc-600">Setup</span>
                <strong className="font-racing text-lg font-black uppercase italic tracking-[.02em] text-zinc-100">Filtros</strong>
              </div>
              <Link href="/marketplace" className="font-racing text-xs font-black uppercase italic text-[#d1d8b5] hover:text-zinc-100">Reset</Link>
            </div>
          </div>

          <form action="/marketplace" className="space-y-4 p-5">
            {filters.q && <input type="hidden" name="q" value={filters.q} />}

            <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Tipo
              <select name="type" defaultValue={filters.type ?? ""} className={fieldClass}>
                <option value="">Todo el stock</option><option value="part">Pieza</option><option value="vehicle">Vehículo en despiece</option>
              </select>
            </label>

            <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Marca
              <select name="brand" defaultValue={filters.brand ?? ""} className={fieldClass}>
                <option value="">Todas</option>{popularBrands.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>

            <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Modelo
              <input name="model" defaultValue={filters.model ?? ""} placeholder="Golf, Ibiza, E46…" className={fieldClass} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Año
                <input name="year" inputMode="numeric" defaultValue={filters.year ?? ""} placeholder="2018" className={fieldClass} />
              </label>
              <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Estado
                <select name="condition" defaultValue={filters.condition ?? ""} className={fieldClass}>
                  <option value="">Todos</option>{conditions.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
            </div>

            <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Sistema / categoría
              <select name="category" defaultValue={filters.category ?? ""} className={fieldClass}>
                <option value="">Todas</option>{categories.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Precio min.
                <input name="minPrice" inputMode="numeric" defaultValue={filters.minPrice ?? ""} placeholder="0 €" className={fieldClass} />
              </label>
              <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Precio max.
                <input name="maxPrice" inputMode="numeric" defaultValue={filters.maxPrice ?? ""} placeholder="1000 €" className={fieldClass} />
              </label>
            </div>

            <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Ubicación
              <input name="location" defaultValue={filters.location ?? ""} placeholder="Telde, Madrid…" className={fieldClass} />
            </label>

            <label className="block font-racing text-[11px] font-black uppercase italic tracking-[.08em] text-zinc-600">Disponibilidad
              <select name="status" defaultValue={filters.status ?? ""} className={fieldClass}>
                <option value="">Disponible / reservada</option><option value="available">Disponible</option><option value="reserved">Reservada</option><option value="sold">Vendida</option>
              </select>
            </label>

            <button className="race-cut-sm w-full bg-[#181b19] px-4 py-3 font-racing text-sm font-black uppercase italic tracking-[.06em] text-zinc-100 transition hover:bg-[#343935]" type="submit">Aplicar setup</button>
          </form>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-zinc-300 pb-3">
            <p className="font-racing text-sm font-bold uppercase italic tracking-[.04em] text-zinc-600"><strong className="mr-1 text-2xl font-black text-[#181b19]">{listings.length}</strong> anuncios en stock</p>
            <Link href="/publicar" className="font-racing text-sm font-black uppercase italic tracking-[.05em] text-[#181b19] transition hover:text-[#81594c]">+ Vender pieza</Link>
          </div>

          {listings.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          ) : (
            <div className="race-cut border border-zinc-300 bg-[#fbfbf8] p-10 text-center shadow-[7px_7px_0_#dddcd5]">
              <div className="mx-auto grid h-14 w-14 place-items-center bg-[#181b19] text-[#d1d8b5]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </div>
              <h2 className="font-racing mt-5 text-2xl font-black uppercase italic text-[#181b19]">Sin coincidencias</h2>
              <p className="mt-2 text-sm text-zinc-500">Quita algún filtro o prueba otra referencia, modelo o pieza.</p>
              <Link href="/marketplace" className="race-cut-sm mt-6 inline-flex bg-[#b6c18a] px-5 py-2.5 font-racing text-sm font-black uppercase italic text-[#181b19]">Resetear filtros</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
