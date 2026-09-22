import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DonorInventory } from "@/components/DonorInventory";
import { FavoriteButton } from "@/components/FavoriteButton";
import { GarageCompatibility } from "@/components/GarageCompatibility";
import { ReportButton } from "@/components/ReportButton";
import { ProductEventOnMount } from "@/components/ProductEventOnMount";
import { TrackedContactLink } from "@/components/TrackedContactLink";
import { CopyReferenceButton, SellerRepeatButton, ShareActions } from "@/components/ShareActions";
import { StatusBadge } from "@/components/StatusBadge";
import { getListingBySlug, getListings, getOemCompatibilityKnowledge } from "@/lib/data";
import { formatPrice, relativeDate } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Anuncio no encontrado" };
  const description = listing.title + " · " + listing.location + " · " + formatPrice(listing.price) + ". Recambio en DESGUÁZALO.";
  return { title: listing.title, description, openGraph: { title: listing.title + " — " + formatPrice(listing.price), description, images: listing.listing_images?.[0]?.public_url ? [listing.listing_images[0].public_url] : [] } };
}

export default async function ListingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const [relatedRows, oemKnowledge] = await Promise.all([
    getListings({ brand: listing.brand, limit: 4 }),
    listing.type === "part" ? getOemCompatibilityKnowledge(listing.reference_code) : Promise.resolve([])
  ]);
  const related = relatedRows.filter((x) => x.id !== listing.id).slice(0, 3);
  const images = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position);
  const compatibilities = listing.listing_compatibilities ?? [];
  const donorParts = [...(listing.donor_parts ?? [])].sort((a, b) => a.position - b.position);
  const learnedOemKnowledge = oemKnowledge.filter((item) => {
    const alreadyDeclared = compatibilities.some((declared) =>
      declared.brand.toLowerCase() === item.brand.toLowerCase() &&
      declared.model.toLowerCase() === item.model.toLowerCase() &&
      (declared.generation || "").toLowerCase() === (item.generation || "").toLowerCase() &&
      (declared.engine || "").toLowerCase() === (item.engine || "").toLowerCase()
    );
    return Number(item.occurrences) > 1 || !alreadyDeclared;
  });
  const whatsapp = listing.is_demo ? undefined : listing.seller?.whatsapp?.replace(/\D/g, "");
  const message = encodeURIComponent("Hola, te escribo por tu anuncio “" + listing.title + "” en DESGUÁZALO. ¿Sigue disponible?");

  return (
    <div className="shell detail-page">
      <ProductEventOnMount name="listing_open" targetId={listing.id} metadata={{ type: listing.type, demo: Boolean(listing.is_demo) }} />
      <div className="breadcrumbs"><Link href="/">Inicio</Link><span>/</span><Link href="/marketplace">Marketplace</Link><span>/</span><span>{listing.title}</span></div>
      <div className="detail-grid">
        <section>
          <div className={"gallery " + (images.length <= 1 ? "single" : "")}>
            {images.length ? images.slice(0, 5).map((img, i) => <div className={"gallery-item gallery-" + i} key={img.public_url + "-" + i}><Image src={img.public_url} alt={listing.title + " — foto " + (i + 1)} fill sizes="(max-width: 900px) 100vw, 65vw" className="gallery-image" priority={i === 0} /></div>) : <div className="image-placeholder big">SIN FOTOS</div>}
          </div>

          <div className="detail-title-mobile"><StatusBadge status={listing.status} /><h1>{listing.title}</h1><strong>{formatPrice(listing.price)}</strong></div>
          {listing.is_demo && <div className="safe-note"><strong>ANUNCIO DEMO</strong><p>No corresponde a un vendedor real.</p></div>}

          {listing.reference_code && <div className="oem-box"><div><span className="block text-[10px] font-black uppercase tracking-[.1em] text-[var(--dg-muted)]">Referencia OEM</span><code>{listing.reference_code}</code></div><CopyReferenceButton value={listing.reference_code} /></div>}

          {listing.type === "part" && <GarageCompatibility brand={listing.brand} model={listing.model} generation={listing.generation} compatibilities={compatibilities} />}

          <div className="detail-section"><h2>Descripción</h2><p>{listing.description || "Sin descripción."}</p></div>

          <div className="spec-grid">
            <div><span>Marca</span><strong>{listing.brand}</strong></div><div><span>Modelo</span><strong>{listing.model}</strong></div><div><span>Generación</span><strong>{listing.generation || "—"}</strong></div>
            <div><span>Año</span><strong>{listing.year || "—"}</strong></div><div><span>Motorización</span><strong>{listing.engine || "—"}</strong></div><div><span>Estado</span><strong>{listing.condition}</strong></div>
            {listing.mileage !== null && <div><span>Kilometraje</span><strong>{listing.mileage.toLocaleString("es-ES")} km</strong></div>}
          </div>

          <div className="detail-section">
            <h2>Entrega</h2>
            <div className="part-tags">
              {listing.pickup_available !== false && <span>Recogida en mano</span>}
              {listing.shipping_available && <span>Envío disponible</span>}
              <span>{listing.location}</span>
            </div>
          </div>

          {listing.type === "vehicle" && <DonorInventory parts={donorParts} fallback={listing.available_parts ?? []} />}

          {compatibilities.length > 0 && <div className="detail-section"><h2>Compatibilidad declarada</h2><p className="muted">Úsala como orientación y confirma la referencia OEM antes de cerrar la compra.</p><div className="part-tags">{compatibilities.map((c, i) => <span key={i}>{c.brand} {c.model}{c.generation ? " " + c.generation : ""}{c.engine ? " · " + c.engine : ""}{c.year_from || c.year_to ? " · " + (c.year_from || "…") + "–" + (c.year_to || "…") : ""}</span>)}</div></div>}

          {learnedOemKnowledge.length > 0 && <div className="detail-section oem-knowledge">
            <span className="kicker">HISTÓRICO OEM</span>
            <h2>También se ha visto esta referencia en</h2>
            <p className="muted">Compatibilidades observadas en el histórico de DESGUÁZALO con la misma referencia. No sustituye el catálogo del fabricante.</p>
            <div className="oem-knowledge-grid">{learnedOemKnowledge.map((item, index) => <div key={index}><strong>{item.brand} {item.model}{item.generation ? " " + item.generation : ""}</strong><span>{[item.engine, item.year_from || item.year_to ? (item.year_from || "…") + "–" + (item.year_to || "…") : null, item.occurrences + " coincidencia" + (item.occurrences === 1 ? "" : "s")].filter(Boolean).join(" · ")}</span></div>)}</div>
          </div>}

          {listing.technical_notes && <div className="detail-section"><h2>Datos técnicos</h2><p>{listing.technical_notes}</p></div>}

          <div className="safe-note"><strong>Antes de comprar</strong><p>Comprueba referencia OEM, conectores, lado y versión. DESGUÁZALO no procesa pagos ni envíos.</p></div>
        </section>

        <aside className="contact-card">
          <div className="desktop-only"><StatusBadge status={listing.status} /><h1>{listing.title}</h1><div className="detail-price">{formatPrice(listing.price)}</div><p className="muted">{relativeDate(listing.created_at)} · {listing.location}</p></div>
          <Link href={"/vendedor/" + listing.seller_id} className="seller-row"><span className="seller-avatar">{listing.seller?.display_name?.[0] ?? "?"}</span><div><strong>{listing.seller?.display_name ?? "Vendedor"}{listing.seller?.seller_kind === "professional" ? " · profesional" : ""}{listing.is_demo ? " · demo" : ""}</strong><span>{listing.seller?.location ?? listing.location}</span></div><b>→</b></Link>
          <div className="contact-actions">
            {listing.is_demo ? <div className="no-contact">Sin contacto: anuncio de demostración.</div> : <>
              {whatsapp && <TrackedContactLink className="button button-whatsapp full" href={"https://wa.me/" + whatsapp + "?text=" + message} eventName="contact_whatsapp" targetId={listing.id} target="_blank" rel="noreferrer">WhatsApp</TrackedContactLink>}
              {listing.seller?.phone && <TrackedContactLink className="button button-dark full" href={"tel:" + listing.seller.phone} eventName="contact_phone" targetId={listing.id}>Llamar</TrackedContactLink>}
              {!whatsapp && !listing.seller?.phone && <div className="no-contact">El vendedor no ha añadido teléfono ni WhatsApp.</div>}
            </>}
          </div>
          <ShareActions title={listing.title + " — " + formatPrice(listing.price)} />
          {!listing.is_demo && <FavoriteButton listingId={listing.id} />}
          {!listing.is_demo && <ReportButton listingId={listing.id} />}
          <SellerRepeatButton sellerId={listing.seller_id} brand={listing.brand} model={listing.model} generation={listing.generation} year={listing.year} engine={listing.engine} location={listing.location} />
        </aside>
      </div>

      {related.length > 0 && <section className="section related"><div className="section-heading"><div><h2>Otros anuncios de {listing.brand}</h2></div></div><div className="listing-grid">{related.map((item) => <Link className="related-link" key={item.id} href={"/pieza/" + item.slug}>{item.title} · {formatPrice(item.price)}</Link>)}</div></section>}
    </div>
  );
}
