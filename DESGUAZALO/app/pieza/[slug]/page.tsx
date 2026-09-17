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
      <div className="breadcrumbs"><Link href="/">Inicio</Link><span>/</span><Link href="/marketplace">Marketplace</Link><span>/</span><span>{listing.title}</span></div>
      <div className="detail-grid">
        <section>
          <div className={`gallery ${images.length <= 1 ? "single" : ""}`}>
            {images.length ? images.slice(0, 5).map((img, i) => <div className={`gallery-item gallery-${i}`} key={`${img.public_url}-${i}`}><Image src={img.public_url} alt={`${listing.title} — foto ${i + 1}`} fill sizes="(max-width: 900px) 100vw, 65vw" className="gallery-image" priority={i === 0} /></div>) : <div className="image-placeholder big">SIN FOTOS</div>}
          </div>
          <div className="detail-title-mobile"><StatusBadge status={listing.status} /><h1>{listing.title}</h1><strong>{formatPrice(listing.price)}</strong></div>
          {listing.is_demo && <div className="safe-note"><strong>Anuncio de demostración.</strong><p>Este contenido sirve para probar la interfaz mientras todavía no hay anuncios reales. No corresponde a un vendedor real y no admite contacto, favoritos ni reportes.</p></div>}
          <div className="detail-section"><h2>Sobre esta {listing.type === "vehicle" ? "unidad" : "pieza"}</h2><p>{listing.description || "El vendedor no ha añadido una descripción."}</p></div>
          <div className="spec-grid">
            <div><span>Marca</span><strong>{listing.brand}</strong></div><div><span>Modelo</span><strong>{listing.model}</strong></div><div><span>Generación</span><strong>{listing.generation || "—"}</strong></div><div><span>Año</span><strong>{listing.year || "—"}</strong></div><div><span>Motorización</span><strong>{listing.engine || "—"}</strong></div><div><span>Estado</span><strong>{listing.condition}</strong></div>
            {listing.reference_code && <div><span>Referencia</span><strong>{listing.reference_code}</strong></div>}{listing.mileage !== null && <div><span>Kilometraje</span><strong>{listing.mileage.toLocaleString("es-ES")} km</strong></div>}
          </div>
          {listing.technical_notes && <div className="detail-section"><h2>Datos técnicos</h2><p>{listing.technical_notes}</p></div>}
          {listing.available_parts?.length ? <div className="detail-section"><h2>Piezas que siguen disponibles</h2><div className="part-tags">{listing.available_parts.map((part) => <span key={part}>{part}</span>)}</div></div> : null}
          <div className="safe-note"><strong>Trato directo, con cabeza.</strong><p>DESGUÁZALO no cobra ni intermedia en el pago o la entrega. Comprueba la pieza y acuerda condiciones claras con el vendedor antes de pagar.</p></div>
        </section>
        <aside className="contact-card">
          <div className="desktop-only"><StatusBadge status={listing.status} /><h1>{listing.title}</h1><div className="detail-price">{formatPrice(listing.price)}</div><p className="muted">Publicado {relativeDate(listing.created_at).toLowerCase()} · {listing.location}</p></div>
          <Link href={`/vendedor/${listing.seller_id}`} className="seller-row"><span className="seller-avatar">{listing.seller?.display_name?.[0] ?? "?"}</span><div><strong>{listing.seller?.display_name ?? "Vendedor"}{listing.is_demo ? " · demo" : ""}</strong><span>{listing.seller?.location ?? listing.location}</span></div><b>→</b></Link>
          <div className="contact-actions">
            {listing.is_demo ? <div className="no-contact">Contenido de demostración: no hay un vendedor real detrás de este anuncio.</div> : <>
              {whatsapp && <a className="button button-whatsapp full" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">Hablar por WhatsApp</a>}
              {listing.seller?.phone && <a className="button button-dark full" href={`tel:${listing.seller.phone}`}>Llamar al vendedor</a>}
              {!whatsapp && !listing.seller?.phone && <div className="no-contact">Este vendedor aún no ha publicado un método de contacto.</div>}
            </>}
          </div>
          {!listing.is_demo && <FavoriteButton listingId={listing.id} />}
          {!listing.is_demo && <ReportButton listingId={listing.id} />}
        </aside>
      </div>
      {related.length > 0 && <section className="section related"><div className="section-heading"><div><span className="kicker">MISMA MARCA</span><h2>Puede que también te encaje</h2></div></div><div className="listing-grid">{related.map((item) => <div key={item.id}><Link className="related-link" href={`/pieza/${item.slug}`}>{item.title} · {formatPrice(item.price)}</Link></div>)}</div></section>}
    </div>
  );
}
