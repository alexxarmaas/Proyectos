import type { ListingStatus } from "@/lib/types";

const copy: Record<ListingStatus, string> = { available: "Disponible", reserved: "Reservada", sold: "Vendida" };
export function StatusBadge({ status }: { status: ListingStatus }) {
  return <span className={`status status-${status}`}>{copy[status]}</span>;
}
