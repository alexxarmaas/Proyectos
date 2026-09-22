import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceResults } from "@/components/MarketplaceResults";
import { NearbyControls } from "@/components/NearbyControls";
import { SaveSearchButton } from "@/components/SaveSearchButton";
import { SearchBar } from "@/components/SearchBar";
import { categories, conditions, popularBrands } from "@/lib/catalog";
import { getListings } from "@/lib/data";
import { parseAutomotiveQuery } from "@/lib/search";
import type { MarketplaceFilters } from "@/lib/types";

export const metadata: Metadata = { title: "Marketplace", description: "Busca recambios por pieza, coche o referencia OEM." };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

const fieldClass = "mt-1.5 w-full border border-[var(--dg-line)] bg-[var(--dg-surface)] px-3 py-2.5 text-sm font-semibold text-[var(--dg-ink)] outline-none transition focus:border-[var(--dg-accent-strong)] focus:ring-4 focus:ring-[var(--dg-accent)]/20";

function urlFor(filters: MarketplaceFilters, remove?: keyof MarketplaceFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (key === remove || key === "limit" || !value) return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? "/marketplace?" + query : "/marketplace";
}

export default async function Marketplace({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const rawQuery=one(p.q) ?? "";
  const parsed=parseAutomotiveQuery(rawQuery);
  const filters: MarketplaceFilters = {
    q: parsed.residual || undefined,
    oem: one(p.oem) || parsed.filters.oem,
    brand: one(p.brand) || parsed.filters.brand,
    model: one(p.model) || parsed.filters.model,
    generation: one(p.generation) || parsed.filters.generation,
    year: one(p.year) || parsed.filters.year,
    engine: one(p.engine) || parsed.filters.engine,
    category: one(p.category) || parsed.filters.category,
    minPrice: one(p.minPrice), maxPrice: one(p.maxPrice), location: one(p.location), condition: one(p.condition),
    status: one(p.status), type: one(p.type), sort: one(p.sort) || "recent",
    latitude:one(p.latitude),longitude:one(p.longitude),radius:one(p.radius)
  };
  const listings = await getListings(filters);
  const title = rawQuery ? "Resultados para “" + rawQuery + "”" : filters.oem ? "Referencia " + filters.oem : filters.type === "vehicle" ? "Coches en despiece" : "Stock de recambios";
  const serializable = Object.fromEntries(Object.entries(filters).filter(([, value]) => typeof value === "string")) as Record<string, string>;
  const active = [
    ["q", "Búsqueda", filters.q], ["oem", "OEM", filters.oem], ["brand", "Marca", filters.brand], ["model", "Modelo", filters.model],
    ["generation","Generación",filters.generation],["engine","Motor",filters.engine],["year", "Año", filters.year], ["category", "Categoría", filters.category], ["condition", "Estado", filters.condition],
    ["location", "Zona", filters.location], ["minPrice", "Desde", filters.minPrice], ["maxPrice", "Hasta", filters.maxPrice], ["status", "Disponibilidad", filters.status]
  ].filter((row) => row[2]) as [keyof MarketplaceFilters, string, string][];
  const requestParams = new URLSearchParams();
  if (filters.q) requestParams.set("title", filters.q);
  if (filters.oem) requestParams.set("oem", filters.oem);
  if (filters.brand) requestParams.set("brand", filters.brand);
  if (filters.model) requestParams.set("model", filters.model);
  if (filters.generation) requestParams.set("generation", filters.generation);
  if (filters.year) requestParams.set("year", filters.year);
  if (filters.engine) requestParams.set("engine", filters.engine);
  if (filters.location) requestParams.set("location", filters.location);
  const requestHref = "/solicitar" + (requestParams.toString() ? "?" + requestParams.toString() : "");
  const geoActive=Boolean(filters.latitude&&filters.longitude);

  return (
    <div className="bg-[var(--dg-bg)]">
      <section className="relative overflow-hidden border-b border-[var(--dg-dark-soft)] bg-[var(--dg-dark)] text-white">
        <div className="race-grid-bg absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-11 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_.9fr] lg:items-end">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--dg-accent-text)]">Inventario real · trato directo</span>
              <h1 className="mt-2 font-racing text-5xl font-black uppercase leading-[.9] tracking-[-0.04em] text-zinc-100 sm:text-6xl">{title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Escribe como hablarías: “faro derecho Golf 7 2018”, “turbo Ibiza 1.6 TDI” o una referencia OEM.</p>
            </div>
            <SearchBar defaultValue={rawQuery} compact />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-9 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <aside className="dg-panel h-max lg:sticky lg:top-24">
          <div className="border-b border-[var(--dg-line)] bg-[var(--dg-dark)] px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <strong className="font-racing text-lg font-black uppercase tracking-[.02em]">Filtros</strong>
              <Link href="/marketplace" className="text-xs font-bold text-[var(--dg-accent-text)]">Limpiar</Link>
            </div>
          </div>

          <form id="filters-form" action="/marketplace" className="space-y-4 p-5">
            {filters.q && <input type="hidden" name="q" value={filters.q} />}
            {filters.latitude&&<input type="hidden" name="latitude" value={filters.latitude}/>}
            {filters.longitude&&<input type="hidden" name="longitude" value={filters.longitude}/>}
            {filters.radius&&<input type="hidden" name="radius" value={filters.radius}/>}
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Referencia OEM
              <input name="oem" defaultValue={filters.oem ?? ""} placeholder="5G1941036" className={fieldClass} />
            </label>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Tipo
              <select name="type" defaultValue={filters.type ?? ""} className={fieldClass}><option value="">Todo</option><option value="part">Pieza</option><option value="vehicle">Vehículo en despiece</option></select>
            </label>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Marca
              <select name="brand" defaultValue={filters.brand ?? ""} className={fieldClass}><option value="">Todas</option>{popularBrands.map((x) => <option key={x}>{x}</option>)}</select>
            </label>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Modelo
              <input name="model" defaultValue={filters.model ?? ""} placeholder="Golf, Ibiza, Serie 3…" className={fieldClass} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Generación<input name="generation" defaultValue={filters.generation ?? ""} placeholder="VII / 6J" className={fieldClass}/></label>
              <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Año<input name="year" inputMode="numeric" defaultValue={filters.year ?? ""} placeholder="2018" className={fieldClass} /></label>
            </div>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Motor<input name="engine" defaultValue={filters.engine ?? ""} placeholder="1.6 TDI" className={fieldClass}/></label>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Estado<select name="condition" defaultValue={filters.condition ?? ""} className={fieldClass}><option value="">Todos</option>{conditions.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Categoría<select name="category" defaultValue={filters.category ?? ""} className={fieldClass}><option value="">Todas</option>{categories.map((x) => <option key={x}>{x}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Precio mín.<input name="minPrice" inputMode="numeric" defaultValue={filters.minPrice ?? ""} placeholder="0" className={fieldClass} /></label>
              <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Precio máx.<input name="maxPrice" inputMode="numeric" defaultValue={filters.maxPrice ?? ""} placeholder="1000" className={fieldClass} /></label>
            </div>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Ubicación<input name="location" defaultValue={filters.location ?? ""} placeholder="Telde, Madrid…" className={fieldClass} /></label>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Disponibilidad<select name="status" defaultValue={filters.status ?? ""} className={fieldClass}><option value="">Disponible / reservada</option><option value="available">Disponible</option><option value="reserved">Reservada</option><option value="sold">Vendida</option></select></label>
            <label className="block text-[11px] font-black uppercase tracking-[.06em] text-[var(--dg-muted)]">Orden<select name="sort" defaultValue={filters.sort ?? "recent"} className={fieldClass}><option value="recent">Más recientes</option>{geoActive&&<option value="distance">Más cercanos</option>}<option value="price_asc">Precio: menor primero</option><option value="price_desc">Precio: mayor primero</option><option value="oldest">Más antiguos</option></select></label>
            <button className="w-full bg-[var(--dg-dark)] px-4 py-3 text-sm font-black uppercase tracking-[.04em] text-white" type="submit">Aplicar filtros</button>
          </form>
        </aside>

        <section className="min-w-0">
          {parsed.recognized.length>0&&<div className="automotive-understanding"><strong>DESGUÁZALO ha entendido</strong><div>{parsed.recognized.map((item)=><span key={item.label+item.value}>{item.label}: {item.value}</span>)}</div></div>}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2"><SaveSearchButton params={serializable} nameHint={rawQuery||undefined}/><NearbyControls active={geoActive}/></div>
            <div className="flex gap-3 text-sm font-bold">
              <Link href="/se-busca">Ver solicitudes</Link>
              <Link href="/publicar">+ Vender pieza</Link>
            </div>
          </div>
          {active.length > 0 && <div className="active-filters">{active.map(([key, label, value]) => <Link key={String(key)} href={urlFor(filters, key)}>{label}: {value} <span aria-hidden>×</span></Link>)}</div>}
          <MarketplaceResults listings={listings} requestHref={requestHref} />
        </section>
      </div>
    </div>
  );
}
