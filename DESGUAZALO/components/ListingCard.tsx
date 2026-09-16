import Image from "next/image";
import Link from "next/link";
import { formatPrice, relativeDate } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ListingCard({ listing }: { listing: Listing }) {
  const image = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0]?.public_url;
  return (
    <article className="listing-card">
      <Link href={`/pieza/${listing.slug}`} className="listing-image-wrap" aria-label={`Ver ${listing.title}`}>
        {image ? <Image src={image} alt={listing.title} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" className="listing-image" /> : <div className="image-placeholder">SIN FOTO</div>}
        <div className="listing-card-badges"><span className="type-chip">{listing.type === "vehicle" ? "DESPIECE" : listing.category}</span><StatusBadge status={listing.status} /></div>
      </Link>
      <div className="listing-card-body">
        <Link href={`/pieza/${listing.slug}`}><h3>{listing.title}</h3></Link>
        <div className="listing-meta">{[listing.brand, listing.model, listing.generation, listing.year].filter(Boolean).join(" · ")}</div>
        <div className="listing-card-bottom"><strong>{formatPrice(listing.price)}</strong><span>{relativeDate(listing.created_at)}</span></div>
        <div className="listing-location">{listing.location}</div>
      </div>
    </article>
  );
}
