import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { categories, conditions, popularBrands } from "@/lib/catalog";
import { getListings } from "@/lib/data";

export const metadata: Metadata = { title: "Marketplace", description: "Busca piezas de coche usadas y vehículos completos para despiece." };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100";

export default async function Marketplace({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const filters = {
    q: one(p.q), brand: one(p.brand), model: one(p.model), year: one(p.year), category: one(p.category), minPrice: one(p.minPrice), maxPrice: one(p.maxPrice), location: one(p.location), condition: one(p.condition), status: one(p.status), type: one(p.type)
  };
  const listings = await getListings(filters);
  const title = filters.q ? `Resultados para “${filters.q}”` : filters.type === "vehicle" ? "Coches en despiece" : "Recambios usados";

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-black uppercase tracking-[.14em] text-lime-600">Marketplace</p>
            <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">Filtra por coche, pieza, estado o ubicación.</p>
            <div className="mt-6"><SearchBar defaultValue={filters.q ?? ""} compact /></div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <aside className="h-max rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <form action="/marketplace" className="space-y-4">
            {filters.q && <input type="hidden" name="q" value={filters.q} />}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <strong className="text-sm font-black text-slate-900">Filtros</strong>
              <Link href="/marketplace" className="text-xs font-semibold text-slate-400 transition hover:text-slate-700">Limpiar</Link>
            </div>

            <label className="block text-xs font-bold text-slate-600">Tipo
              <select name="type" defaultValue={filters.type ?? ""} className={fieldClass}>
                <option value="">Todo</option><option value="part">Pieza</option><option value="vehicle">Vehículo en despiece</option>
              </select>
            </label>

            <label className="block text-xs font-bold text-slate-600">Marca
              <select name="brand" defaultValue={filters.brand ?? ""} className={fieldClass}>
                <option value="">Todas</option>{popularBrands.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>

            <label className="block text-xs font-bold text-slate-600">Modelo
              <input name="model" defaultValue={filters.model ?? ""} placeholder="Golf, Ibiza, E46…" className={fieldClass} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-slate-600">Año
                <input name="year" inputMode="numeric" defaultValue={filters.year ?? ""} placeholder="2018" className={fieldClass} />
              </label>
              <label className="block text-xs font-bold text-slate-600">Estado
                <select name="condition" defaultValue={filters.condition ?? ""} className={fieldClass}>
                  <option value="">Todos</option>{conditions.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
            </div>

            <label className="block text-xs font-bold text-slate-600">Categoría
              <select name="category" defaultValue={filters.category ?? ""} className={fieldClass}>
                <option value="">Todas</option>{categories.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-slate-600">Precio mín.
                <input name="minPrice" inputMode="numeric" defaultValue={filters.minPrice ?? ""} placeholder="0 €" className={fieldClass} />
              </label>
              <label className="block text-xs font-bold text-slate-600">Precio máx.
                <input name="maxPrice" inputMode="numeric" defaultValue={filters.maxPrice ?? ""} placeholder="1000 €" className={fieldClass} />
              </label>
            </div>

            <label className="block text-xs font-bold text-slate-600">Ubicación
              <input name="location" defaultValue={filters.location ?? ""} placeholder="Telde, Madrid…" className={fieldClass} />
            </label>

            <label className="block text-xs font-bold text-slate-600">Disponibilidad
              <select name="status" defaultValue={filters.status ?? ""} className={fieldClass}>
                <option value="">Disponible / reservada</option><option value="available">Disponible</option><option value="reserved">Reservada</option><option value="sold">Vendida</option>
              </select>
            </label>

            <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800" type="submit">Aplicar filtros</button>
          </form>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500"><strong className="font-black text-slate-900">{listings.length}</strong> anuncios</p>
            <Link href="/publicar" className="text-sm font-bold text-lime-700 transition hover:text-lime-800">+ Publicar una pieza</Link>
          </div>

          {listings.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </div>
              <h2 className="mt-4 text-lg font-black text-slate-900">No hay anuncios con esos filtros</h2>
              <p className="mt-2 text-sm text-slate-500">Prueba con menos filtros o con otro término de búsqueda.</p>
              <Link href="/marketplace" className="mt-5 inline-flex rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-slate-950">Limpiar filtros</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
