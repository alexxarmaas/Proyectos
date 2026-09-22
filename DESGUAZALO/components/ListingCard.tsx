import Image from "next/image";
import Link from "next/link";
import { formatPrice, relativeDate } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ListingCard({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  const image = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0]?.public_url;
  const typeLabel = listing.type === "vehicle" ? "Coche en despiece" : listing.category;
  const vehicle = [listing.brand, listing.model, listing.generation, listing.year].filter(Boolean).join(" · ");
  const ref = listing.reference_code || listing.id.slice(0, 6).toUpperCase();

  if (compact) {
    return (
      <article className="listing-compact border border-[var(--dg-line)] bg-[var(--dg-surface)]">
        <Link href={"/pieza/" + listing.slug} className="relative block overflow-hidden bg-[var(--dg-surface-alt)]" aria-label={"Ver " + listing.title}>
          {image ? <Image src={image} alt={listing.title} fill sizes="160px" className="object-cover" /> : <div className="grid h-full min-h-24 place-items-center text-xs font-black uppercase text-[var(--dg-muted)]">Sin foto</div>}
        </Link>
        <div className="min-w-0 p-4">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={listing.status} /><span className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--dg-muted)]">{typeLabel}</span></div>
          <Link href={"/pieza/" + listing.slug}><h3 className="mt-2 truncate text-base font-black text-[var(--dg-ink)]">{listing.title}</h3></Link>
          <p className="mt-1 truncate text-xs text-[var(--dg-muted)]">{vehicle}{listing.reference_code ? " · OEM " + listing.reference_code : ""}</p>
          <p className="mt-2 text-xs text-[var(--dg-muted)]">{listing.distance_km!==undefined&&listing.distance_km!==null?listing.distance_km.toFixed(1)+" km · ":""}{listing.location} · {relativeDate(listing.created_at)}</p>
        </div>
        <div className="listing-compact-price flex items-center justify-end p-4 text-right"><strong className="font-racing text-3xl font-black text-[var(--dg-ink)]">{formatPrice(listing.price)}</strong></div>
      </article>
    );
  }

  return (
    <article className="group race-cut relative flex h-full min-w-0 flex-col overflow-hidden border border-[var(--dg-line)] bg-[var(--dg-surface)] shadow-[6px_6px_0_var(--dg-shadow)] transition duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--dg-line)]">
      <div className="absolute left-0 top-0 z-20 h-16 w-1 bg-[var(--dg-accent)] transition-all duration-300 group-hover:h-full" />
      <Link href={"/pieza/" + listing.slug} className="relative block aspect-[4/3] overflow-hidden bg-[var(--dg-surface-alt)]" aria-label={"Ver " + listing.title}>
        {image ? <Image src={image} alt={listing.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover saturate-[.85] transition duration-500 group-hover:scale-[1.025] group-hover:saturate-100" /> : <div className="race-grid-bg grid h-full place-items-center bg-[var(--dg-dark-soft)] text-xs font-black uppercase tracking-[.12em] text-zinc-500">Sin foto</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="race-cut-sm max-w-[65%] truncate bg-[var(--dg-dark)]/92 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-zinc-100">{listing.is_demo ? "Demo / " + typeLabel : typeLabel}</span>
          <StatusBadge status={listing.status} />
        </div>
        <div className="absolute bottom-2.5 right-3 text-[10px] font-bold uppercase tracking-[.11em] text-white/75">REF {ref}</div>
      </Link>
      <div className="flex flex-1 flex-col p-4 pl-5">
        <div className="mb-2 flex items-center justify-between gap-3 border-b border-[var(--dg-line)] pb-2 text-[10px] font-bold uppercase tracking-[.07em] text-[var(--dg-muted)]"><span>{relativeDate(listing.created_at)}</span>{listing.condition && <span className="truncate">{listing.condition}</span>}</div>
        <Link href={"/pieza/" + listing.slug}><h3 className="line-clamp-2 text-[1.08rem] font-black leading-[1.08] tracking-[-0.02em] text-[var(--dg-ink)] sm:text-[1.18rem]">{listing.title}</h3></Link>
        {vehicle && <p className="mt-2 truncate text-[11px] font-semibold uppercase text-[var(--dg-muted)]">{vehicle}</p>}
        {listing.reference_code && <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[.06em] text-[var(--dg-accent-strong)]">OEM {listing.reference_code}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div><span className="block text-[9px] font-black uppercase tracking-[.14em] text-zinc-400">Precio</span><strong className="font-racing text-3xl font-black leading-none tracking-[-0.03em] text-[var(--dg-ink)]">{formatPrice(listing.price)}</strong></div>
          <span className="max-w-[125px] truncate text-right text-[10px] font-semibold uppercase text-[var(--dg-muted)]">{listing.distance_km!==undefined&&listing.distance_km!==null?listing.distance_km.toFixed(1)+" km · ":""}{listing.location}</span>
        </div>
      </div>
    </article>
  );
}
