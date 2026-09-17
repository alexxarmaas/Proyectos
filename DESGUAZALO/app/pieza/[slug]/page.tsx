import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportButton } from "@/components/ReportButton";
import { StatusBadge } from "@/components/StatusBadge";
import { getListingBySlug, getListings } from "@/lib/data";
import { formatPrice, relativeDate } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Anuncio no encontrado" };
  const description = listing.is_demo
    ? `${listing.title} · ${listing.location} · ${formatPrice(listing.price)}. Anuncio de demostración de DESGUÁZALO.`
    : `${listing.title} · ${listing.location} · ${formatPrice(listing.price)}. Contacta directamente con el vendedor en DESGUÁZALO.`;
  return { title: listing.title, description, openGraph: { title: listing.title, description, images: listing.listing_images?.[0]?.public_url ? [listing.listing_images[0].public_url] : [] } };
}

export default async function ListingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();
  const related = (await getListings({ brand: listing.brand, limit: 4 })).filter((x) => x.id !== listing.id).slice(0, 3);
  const images = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position);
  const whatsapp = listing.is_demo ? undefined : listing.seller?.whatsapp?.replace(/\D/g, "");
  const message = encodeURIComponent(`Hola, te escribo por tu anuncio “${listing.title}” en DESGUÁZALO. ¿Sigue disponible?`);

  return (
    <div className="shell detail-page">
      <div className="breadcrumbs"><Link href="/">Inicio</Link><span>/</span><Link href="/marketplace">Piezas</Link><span>/</span><span>{listing.title}</span></div>
      <div className="detail-grid">
        <section>
          <div className={`gallery ${images.length <= 1 ? "single" : ""}`}>
            {images.length ? images.slice(0, 5).map((img, i) => <div className={`gallery-item gallery-${i}`} key={`${img.public_url}-${i}`}><Image src={img.public_url} alt={`${listing.title} — foto ${i + 1}`} fill sizes="(max-width: 900px) 100vw, 65vw" className="gallery-image" priority={i === 0} /></div>) : <div className="image-placeholder big">SIN FOTOS</div>}
          </div>
          <div className="detail-title-mobile"><StatusBadge status={listing.status} /><h1>{listing.title}</h1><strong>{formatPrice(listing.price)}</strong></div>
          {listing.is_demo && <div className="safe-note"><strong>ANUNCIO DEMO</strong><p>No corresponde a un vendedor real. El contacto, favoritos y reportes están desactivados.</p></div>}
          <div className="detail-section"><h2>Descripción</h2><p>{listing.description || "Sin descripción."}</p></div>
          <div className="spec-grid">
            <div><span>Marca</span><strong>{listing.brand}</strong></div><div><span>Modelo</span><strong>{listing.model}</strong></div><div><span>Generación</span><strong>{listing.generation || "—"}</strong></div><div><span>Año</span><strong>{listing.year || "—"}</strong></div><div><span>Motorización</span><strong>{listing.engine || "—"}</strong></div><div><span>Estado</span><strong>{listing.condition}</strong></div>
            {listing.reference_code && <div><span>Referencia</span><strong>{listing.reference_code}</strong></div>}{listing.mileage !== null && <div><span>Kilometraje</span><strong>{listing.mileage.toLocaleString("es-ES")} km</strong></div>}
          </div>
          {listing.technical_notes && <div className="detail-section"><h2>Datos técnicos</h2><p>{listing.technical_notes}</p></div>}
          {listing.available_parts?.length ? <div className="detail-section"><h2>Piezas disponibles</h2><div className="part-tags">{listing.available_parts.map((part) => <span key={part}>{part}</span>)}</div></div> : null}
          <div className="safe-note"><strong>Compra entre particulares</strong><p>DESGUÁZALO no procesa pagos ni envíos. Verifica la pieza y acuerda el pago y la entrega con el vendedor.</p></div>
        </section>
        <aside className="contact-card">
          <div className="desktop-only"><StatusBadge status={listing.status} /><h1>{listing.title}</h1><div className="detail-price">{formatPrice(listing.price)}</div><p className="muted">{relativeDate(listing.created_at)} · {listing.location}</p></div>
          <Link href={`/vendedor/${listing.seller_id}`} className="seller-row"><span className="seller-avatar">{listing.seller?.display_name?.[0] ?? "?"}</span><div><strong>{listing.seller?.display_name ?? "Vendedor"}{listing.is_demo ? " · demo" : ""}</strong><span>{listing.seller?.location ?? listing.location}</span></div><b>→</b></Link>
          <div className="contact-actions">
            {listing.is_demo ? <div className="no-contact">Sin contacto: anuncio de demostración.</div> : <>
              {whatsapp && <a className="button button-whatsapp full" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">WhatsApp</a>}
              {listing.seller?.phone && <a className="button button-dark full" href={`tel:${listing.seller.phone}`}>Llamar</a>}
              {!whatsapp && !listing.seller?.phone && <div className="no-contact">El vendedor no ha añadido teléfono ni WhatsApp.</div>}
            </>}
          </div>
          {!listing.is_demo && <FavoriteButton listingId={listing.id} />}
          {!listing.is_demo && <ReportButton listingId={listing.id} />}
        </aside>
      </div>
      {related.length > 0 && <section className="section related"><div className="section-heading"><div><h2>Otros anuncios de {listing.brand}</h2></div></div><div className="listing-grid">{related.map((item) => <div key={item.id}><Link className="related-link" href={`/pieza/${item.slug}`}>{item.title} · {formatPrice(item.price)}</Link></div>)}</div></section>}
    </div>
  );
}
