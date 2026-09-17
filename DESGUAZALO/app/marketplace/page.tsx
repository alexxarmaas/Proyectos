import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { categories, conditions, popularBrands } from "@/lib/catalog";
import { getListings } from "@/lib/data";

export const metadata: Metadata = { title: "Marketplace", description: "Busca piezas de coche usadas y vehículos completos para despiece." };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function Marketplace({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const filters = {
    q: one(p.q), brand: one(p.brand), model: one(p.model), year: one(p.year), category: one(p.category), minPrice: one(p.minPrice), maxPrice: one(p.maxPrice), location: one(p.location), condition: one(p.condition), status: one(p.status), type: one(p.type)
  };
  const listings = await getListings(filters);
  const title = filters.q ? `“${filters.q}”` : filters.type === "vehicle" ? "Coches en despiece" : "Piezas usadas";

  return (
    <div className="shell market-page">
      <div className="market-top"><h1>{title}</h1><SearchBar defaultValue={filters.q ?? ""} compact /></div>
      <div className="market-layout">
        <aside className="filters">
          <form action="/marketplace">
            {filters.q && <input type="hidden" name="q" value={filters.q} />}
            <div className="filter-head"><strong>Filtros</strong><Link href="/marketplace">Limpiar</Link></div>
            <label>Tipo<select name="type" defaultValue={filters.type ?? ""}><option value="">Todo</option><option value="part">Pieza</option><option value="vehicle">Vehículo en despiece</option></select></label>
            <label>Marca<select name="brand" defaultValue={filters.brand ?? ""}><option value="">Todas</option>{popularBrands.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label>Modelo<input name="model" defaultValue={filters.model ?? ""} placeholder="Golf, Ibiza, E46…" /></label>
            <label>Año<input name="year" inputMode="numeric" defaultValue={filters.year ?? ""} placeholder="2018" /></label>
            <label>Categoría<select name="category" defaultValue={filters.category ?? ""}><option value="">Todas</option>{categories.map((x) => <option key={x}>{x}</option>)}</select></label>
            <div className="price-pair"><label>Precio mín.<input name="minPrice" inputMode="numeric" defaultValue={filters.minPrice ?? ""} placeholder="0 €" /></label><label>Precio máx.<input name="maxPrice" inputMode="numeric" defaultValue={filters.maxPrice ?? ""} placeholder="1000 €" /></label></div>
            <label>Ubicación<input name="location" defaultValue={filters.location ?? ""} placeholder="Telde, Madrid…" /></label>
            <label>Estado<select name="condition" defaultValue={filters.condition ?? ""}><option value="">Cualquiera</option>{conditions.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label>Disponibilidad<select name="status" defaultValue={filters.status ?? ""}><option value="">Disponible / reservada</option><option value="available">Disponible</option><option value="reserved">Reservada</option><option value="sold">Vendida</option></select></label>
            <button className="button button-primary full" type="submit">Aplicar</button>
          </form>
        </aside>
        <section className="market-results">
          <div className="results-count"><strong>{listings.length}</strong> anuncios</div>
          {listings.length ? <div className="listing-grid market-grid">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <div className="empty-state"><h2>No hay anuncios con esos filtros.</h2><p>Prueba con menos filtros o con otro término de búsqueda.</p></div>}
        </section>
      </div>
    </div>
  );
}
