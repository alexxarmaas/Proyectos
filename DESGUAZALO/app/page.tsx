import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { categories } from "@/lib/catalog";
import { getListings } from "@/lib/data";

export default async function Home() {
  const [recent, vehicles] = await Promise.all([
    getListings({ limit: 8 }),
    getListings({ type: "vehicle", limit: 4 })
  ]);

  return (
    <>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="shell hero-content">
          <div className="eyebrow">PIEZAS REALES · TRATO DIRECTO</div>
          <h1>Encuentra esa pieza<br /><span>que necesitas.</span></h1>
          <p>Busca entre piezas usadas y coches en despiece. Sin carrito, sin comisiones, sin rodeos.</p>
          <SearchBar />
          <div className="quick-searches"><span>Prueba:</span><Link href="/marketplace?q=faros+golf+7">faros golf 7</Link><Link href="/marketplace?q=despiece+ibiza+6j">despiece ibiza 6j</Link><Link href="/marketplace?q=motor+bmw+e46">motor bmw e46</Link></div>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading"><div><span className="kicker">RECIÉN LLEGADO</span><h2>Piezas que acaban de entrar</h2></div><Link href="/marketplace" className="text-link">Ver todo →</Link></div>
        <div className="listing-grid">{recent.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
      </section>

      <section className="category-band">
        <div className="shell section">
          <div className="section-heading light"><div><span className="kicker">VE AL GRANO</span><h2>Busca por sistema</h2></div></div>
          <div className="category-grid">
            {categories.map((category, index) => <Link key={category} href={`/marketplace?category=${encodeURIComponent(category)}`} className="category-tile"><span>{String(index + 1).padStart(2, "0")}</span><strong>{category}</strong><b>→</b></Link>)}
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading"><div><span className="kicker">DONANTES COMPLETOS</span><h2>Coches en despiece</h2></div><Link href="/marketplace?type=vehicle" className="text-link">Ver coches →</Link></div>
        <div className="listing-grid">{vehicles.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
      </section>

      <section className="sell-cta shell">
        <div><span className="kicker">¿TIENES PIEZAS PARADAS?</span><h2>Hazles sitio en el garaje.</h2><p>Fotos, pieza, coche, precio y ubicación. Publica antes de que se enfríe el motor.</p></div>
        <Link href="/publicar" className="button button-dark">Publicar una pieza</Link>
      </section>
    </>
  );
}
