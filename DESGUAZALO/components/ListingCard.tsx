import Image from "next/image";
import Link from "next/link";
import { formatPrice, relativeDate } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ListingCard({ listing }: { listing: Listing }) {
  const image = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0]?.public_url;
  const typeLabel = listing.type === "vehicle" ? "Coche en despiece" : listing.category;
  const vehicle = [listing.brand, listing.model, listing.generation, listing.year].filter(Boolean).join(" · ");
  const ref = listing.reference_code || listing.id.slice(0, 6).toUpperCase();

  return (
    <article className="group race-cut relative flex h-full min-w-0 flex-col overflow-hidden border border-zinc-300 bg-white shadow-[6px_6px_0_#d9dbd5] transition duration-300 hover:-translate-y-1 hover:border-zinc-500 hover:shadow-[9px_9px_0_#c8ff1a]">
      <div className="absolute left-0 top-0 z-20 h-16 w-1 bg-[#c8ff1a] transition-all duration-300 group-hover:h-full" />

      <Link href={`/pieza/${listing.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-zinc-200" aria-label={`Ver ${listing.title}`}>
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover saturate-[.88] transition duration-500 group-hover:scale-[1.04] group-hover:saturate-100"
          />
        ) : (
          <div className="race-grid-bg grid h-full place-items-center bg-[#171a1c] font-racing text-xs font-black uppercase italic tracking-[.12em] text-zinc-500">Sin foto</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="race-cut-sm max-w-[65%] truncate bg-[#101214]/92 px-2.5 py-1 font-racing text-[10px] font-black uppercase italic tracking-[.07em] text-white backdrop-blur-sm">
            {listing.is_demo ? `Demo / ${typeLabel}` : typeLabel}
          </span>
          <StatusBadge status={listing.status} />
        </div>

        <div className="absolute bottom-2.5 right-3 font-racing text-[10px] font-bold uppercase tracking-[.13em] text-white/70">
          REF {ref}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 pl-5">
        <div className="mb-2 flex items-center justify-between gap-3 border-b border-zinc-200 pb-2 font-racing text-[10px] font-bold uppercase italic tracking-[.08em] text-zinc-500">
          <span>{relativeDate(listing.created_at)}</span>
          {listing.condition && <span className="truncate">{listing.condition}</span>}
        </div>

        <Link href={`/pieza/${listing.slug}`} className="block">
          <h3 className="font-racing line-clamp-2 text-[1.18rem] font-black uppercase italic leading-[1.02] tracking-[-0.025em] text-[#111315] transition group-hover:text-black sm:text-[1.3rem]">
            {listing.title}
          </h3>
        </Link>

        {vehicle && <p className="race-tech mt-2 truncate text-[11px] font-semibold uppercase text-zinc-500">{vehicle}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <span className="block font-racing text-[9px] font-black uppercase tracking-[.16em] text-zinc-400">Precio</span>
            <strong className="font-racing text-3xl font-black italic leading-none tracking-[-0.035em] text-[#101214]">{formatPrice(listing.price)}</strong>
          </div>
          <span className="flex min-w-0 items-center gap-1.5 text-right text-[10px] font-semibold uppercase tracking-[.035em] text-zinc-500">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-[#ff5a2f]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="max-w-[110px] truncate">{listing.location}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
