import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { categories } from "@/lib/catalog";
import { getListings } from "@/lib/data";

const quickSearches = [
  ["faros golf 7", "/marketplace?q=faros+golf+7"],
  ["caja polo 1.0 tsi", "/marketplace?q=caja+polo+1.0+tsi"],
  ["despiece ibiza 6j", "/marketplace?q=despiece+ibiza+6j"],
  ["motor bmw e46", "/marketplace?q=motor+bmw+e46"]
] as const;

export default async function Home() {
  const [recent, vehicles, nearby] = await Promise.all([
    getListings({ limit: 8 }),
    getListings({ type: "vehicle", limit: 4 }),
    getListings({ location: "Gran Canaria", limit: 4 })
  ]);

  return (
    <>
      <section className="home-search">
        <div className="shell">
          <div className="home-search-head">
            <h1>Busca una pieza</h1>
            <div className="home-search-links">
              <Link href="/marketplace">Todas las piezas</Link>
              <Link href="/marketplace?type=vehicle">Coches en despiece</Link>
            </div>
          </div>
          <SearchBar />
          <div className="home-search-examples" aria-label="Búsquedas de ejemplo">
            <span>Ejemplos</span>
            {quickSearches.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          </div>
        </div>
      </section>

      <section className="shell home-block">
        <div className="home-block-head">
          <h2>Últimos anuncios</h2>
          <Link href="/marketplace">Ver todos</Link>
        </div>
        <div className="listing-grid">{recent.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
      </section>

      <section className="home-categories">
        <div className="shell">
          <div className="home-block-head home-block-head-dark">
            <h2>Categorías</h2>
          </div>
          <div className="home-category-list">
            {categories.map((category) => (
              <Link key={category} href={`/marketplace?category=${encodeURIComponent(category)}`}>
                <strong>{category}</strong><span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="shell home-block">
        <div className="home-block-head">
          <h2>Coches en despiece</h2>
          <Link href="/marketplace?type=vehicle">Ver todos</Link>
        </div>
        <div className="listing-grid">{vehicles.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
      </section>

      {nearby.length > 0 && (
        <section className="shell home-block home-nearby">
          <div className="home-block-head">
            <h2>Gran Canaria</h2>
            <Link href="/marketplace?location=Gran%20Canaria">Ver anuncios de la isla</Link>
          </div>
          <div className="listing-grid">{nearby.map((listing) => <ListingCard key={`near-${listing.id}`} listing={listing} />)}</div>
        </section>
      )}

      <section className="shell home-sell-strip">
        <div>
          <strong>¿Tienes una pieza para vender?</strong>
          <span>Publicar un anuncio lleva menos de un minuto.</span>
        </div>
        <Link href="/publicar">Publicar anuncio</Link>
      </section>
    </>
  );
}
