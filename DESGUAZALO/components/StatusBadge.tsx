import type { ListingStatus } from "@/lib/types";

const copy: Record<ListingStatus, string> = {
  available: "Disponible",
  reserved: "Reservada",
  sold: "Vendida",
};

const styles: Record<ListingStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  reserved: "border-amber-200 bg-amber-50 text-amber-700",
  sold: "border-slate-200 bg-slate-100 text-slate-600",
};

const dots: Record<ListingStatus, string> = {
  available: "bg-emerald-500",
  reserved: "bg-amber-500",
  sold: "bg-slate-400",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {copy[status]}
    </span>
  );
}
