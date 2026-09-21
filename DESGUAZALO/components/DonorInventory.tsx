import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { DonorPart } from "@/lib/types";

const statusLabel = { available: "Disponible", reserved: "Reservada", sold: "Vendida" } as const;

export function DonorInventory({ parts, fallback = [] }: { parts: DonorPart[]; fallback?: string[] }) {
  if (!parts.length && !fallback.length) return null;

  return (
    <section className="detail-section">
      <div className="donor-inventory-head">
        <div>
          <span className="kicker">VEHÍCULO DONANTE</span>
          <h2>Inventario del despiece</h2>
        </div>
        <span className="donor-count">{parts.length || fallback.length} piezas</span>
      </div>

      {parts.length ? (
        <div className="donor-inventory">
          {parts.map((part) => (
            <article className="donor-part-row" key={part.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{part.name}</strong>
                  <span className={"status status-" + part.status}>{statusLabel[part.status]}</span>
                </div>
                <p>{[part.category, part.reference_code ? "OEM " + part.reference_code : null, part.notes].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="donor-part-price">
                {part.price !== null && <strong>{formatPrice(part.price)}</strong>}
                {part.published_listing?.slug && <Link href={"/pieza/" + part.published_listing.slug}>Ver anuncio →</Link>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="part-tags">{fallback.map((name) => <span key={name}>{name}</span>)}</div>
      )}
      <p className="mt-3 text-xs leading-5 text-[var(--dg-muted)]">El vendedor actualiza el estado de cada pieza. Confirma disponibilidad y referencia antes de desplazarte.</p>
    </section>
  );
}
