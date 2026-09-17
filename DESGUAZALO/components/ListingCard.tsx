import Image from "next/image";
import Link from "next/link";
import { formatPrice, relativeDate } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ListingCard({ listing }: { listing: Listing }) {
  const image = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0]?.public_url;
  const typeLabel = listing.type === "vehicle" ? "DESPIECE" : listing.category;
  const vehicle = [listing.brand, listing.model, listing.generation, listing.year].filter(Boolean).join(" · ");

  return (
    <article className="listing-card">
      <Link href={`/pieza/${listing.slug}`} className="listing-image-wrap" aria-label={`Ver ${listing.title}`}>
        {image ? (
          <Image src={image} alt={listing.title} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" className="listing-image" />
        ) : (
          <div className="image-placeholder">SIN FOTO</div>
        )}
        <span className="type-chip">{listing.is_demo ? `DEMO · ${typeLabel}` : typeLabel}</span>
      </Link>

      <div className="listing-card-body">
        <div className="listing-card-topline">
          <StatusBadge status={listing.status} />
          <span>{relativeDate(listing.created_at)}</span>
        </div>
        <Link href={`/pieza/${listing.slug}`}><h3>{listing.title}</h3></Link>
        {vehicle && <div className="listing-meta">{vehicle}</div>}
        <div className="listing-card-bottom">
          <strong>{formatPrice(listing.price)}</strong>
          <span className="listing-location">{listing.location}</span>
        </div>
      </div>
    </article>
  );
}
