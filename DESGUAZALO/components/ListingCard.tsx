import Image from "next/image";
import Link from "next/link";
import { formatPrice, relativeDate } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ListingCard({ listing }: { listing: Listing }) {
  const image = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0]?.public_url;
  const typeLabel = listing.type === "vehicle" ? "Coche en despiece" : listing.category;
  const vehicle = [listing.brand, listing.model, listing.generation, listing.year].filter(Boolean).join(" · ");

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70">
      <Link href={`/pieza/${listing.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100" aria-label={`Ver ${listing.title}`}>
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-slate-100 text-xs font-bold uppercase tracking-[.12em] text-slate-400">Sin foto</div>
        )}

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="max-w-[65%] truncate rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.04em] text-white backdrop-blur">
            {listing.is_demo ? `Demo · ${typeLabel}` : typeLabel}
          </span>
          <StatusBadge status={listing.status} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>{relativeDate(listing.created_at)}</span>
          {listing.condition && <span className="truncate">{listing.condition}</span>}
        </div>

        <Link href={`/pieza/${listing.slug}`} className="block">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-5 tracking-[-0.015em] text-slate-900 transition group-hover:text-slate-700">
            {listing.title}
          </h3>
        </Link>

        {vehicle && <p className="mt-1.5 truncate text-xs text-slate-500">{vehicle}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <strong className="text-xl font-black tracking-[-0.035em] text-slate-950">{formatPrice(listing.price)}</strong>
          <span className="flex min-w-0 items-center gap-1 text-right text-[11px] text-slate-500">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="truncate">{listing.location}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
