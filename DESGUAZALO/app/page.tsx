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
      <section className="home-intro">
        <div className="shell home-intro-grid">
          <div className="home-intro-copy">
            <div className="home-tag">COMPRA · VENDE · DESPIEZA</div>
            <h1>Encuentra la pieza.<br />Habla con quien la tiene.</h1>
            <p>Piezas usadas y coches en despiece. Sin carrito, sin comisión y sin intermediarios.</p>
          </div>

          <div className="home-search-panel">
            <div className="home-search-label">¿Qué estás buscando?</div>
            <SearchBar />
            <div className="home-search-examples">
              {quickSearches.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
            </div>
          </div>
        </div>
      </section>

      <section className="shell home-block">
        <div className="home-block-head">
          <div>
            <span>01</span>
            <h2>Últimos anuncios</h2>
          </div>
          <Link href="/marketplace">Ver todos los anuncios</Link>
        </div>
        <div className="listing-grid">{recent.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
      </section>

      <section className="home-categories">
        <div className="shell">
          <div className="home-block-head home-block-head-dark">
            <div>
              <span>02</span>
              <h2>Buscar por categoría</h2>
            </div>
            <p>Ve directamente a lo que necesitas.</p>
          </div>
          <div className="home-category-list">
            {categories.map((category) => (
              <Link key={category} href={`/marketplace?category=${encodeURIComponent(category)}`}>
                <strong>{category}</strong><span>↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="shell home-block">
        <div className="home-block-head">
          <div>
            <span>03</span>
            <h2>Coches en despiece</h2>
          </div>
          <Link href="/marketplace?type=vehicle">Ver todos</Link>
        </div>
        <div className="listing-grid">{vehicles.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
      </section>

      {nearby.length > 0 && (
        <section className="shell home-block home-nearby">
          <div className="home-block-head">
            <div>
              <span>04</span>
              <h2>Gran Canaria</h2>
            </div>
            <Link href="/marketplace?location=Gran%20Canaria">Ver por ubicación</Link>
          </div>
          <div className="listing-grid">{nearby.map((listing) => <ListingCard key={`near-${listing.id}`} listing={listing} />)}</div>
        </section>
      )}

      <section className="shell home-sell-strip">
        <div>
          <span>¿Tienes una pieza ocupando sitio?</span>
          <h2>Súbela. Pon precio. Que te escriban.</h2>
        </div>
        <Link href="/publicar">Publicar anuncio →</Link>
      </section>
    </>
  );
}
