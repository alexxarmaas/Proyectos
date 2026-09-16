import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { getSellerListings } from "@/lib/data";

export const metadata: Metadata = { title: "Perfil del vendedor" };

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listings = await getSellerListings(id);
  const seller = listings[0]?.seller;
  return (
    <div className="shell profile-page">
      <section className="seller-hero"><span className="seller-avatar big">{seller?.display_name?.[0] ?? "?"}</span><div><span className="kicker">VENDEDOR</span><h1>{seller?.display_name ?? "Usuario de DESGUÁZALO"}</h1><p>{seller?.location ?? "Ubicación no indicada"} · {listings.length} anuncios visibles</p></div></section>
      <section className="section"><div className="section-heading"><div><h2>Sus anuncios</h2></div></div>{listings.length ? <div className="listing-grid">{listings.map((x) => <ListingCard key={x.id} listing={x} />)}</div> : <div className="empty-state"><h2>Sin anuncios activos</h2><p>Este vendedor no tiene anuncios visibles ahora mismo.</p></div>}</section>
    </div>
  );
}
