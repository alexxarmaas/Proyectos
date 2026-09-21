import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { getSellerListings } from "@/lib/data";

export const metadata: Metadata = { title: "Perfil del vendedor" };

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listings = await getSellerListings(id);
  const seller = listings[0]?.seller;
  const active = listings.filter((x) => x.status !== "sold").length;
  const sold = listings.filter((x) => x.status === "sold").length;
  const since = seller?.created_at ? new Date(seller.created_at).toLocaleDateString("es-ES", { month:"short", year:"numeric" }) : "—";
  const contact = seller?.whatsapp ? "WhatsApp" : seller?.phone ? "Teléfono" : "No indicado";

  return (
    <div className="shell profile-page">
      <section className="seller-hero"><span className="seller-avatar big">{seller?.display_name?.[0] ?? "?"}</span><div><span className="kicker">{seller?.seller_kind === "professional" ? "PROFESIONAL / DESGUACE" : "VENDEDOR PARTICULAR"}</span><h1>{seller?.display_name ?? "Usuario de DESGUÁZALO"}</h1><p>{seller?.location ?? "Ubicación no indicada"}</p></div></section>
      <div className="trust-grid">
        <div><span>Miembro desde</span><strong>{since}</strong></div>
        <div><span>Anuncios activos</span><strong>{active}</strong></div>
        <div><span>Piezas vendidas</span><strong>{sold}</strong></div>
        <div><span>Contacto</span><strong>{contact}</strong></div>
      </div>
      <div className="safe-note"><strong>Señales de confianza, no puntuaciones inventadas</strong><p>DESGUÁZALO muestra actividad y datos objetivos. Confirma siempre referencias, estado y condiciones de entrega directamente con el vendedor.</p></div>
      <section className="section"><div className="section-heading"><div><h2>Sus anuncios</h2></div></div>{listings.length ? <div className="listing-grid">{listings.map((x) => <ListingCard key={x.id} listing={x} />)}</div> : <div className="empty-state"><h2>Sin anuncios activos</h2><p>Este vendedor no tiene anuncios visibles ahora mismo.</p></div>}</section>
    </div>
  );
}
