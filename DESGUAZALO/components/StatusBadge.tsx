import type { ListingStatus } from "@/lib/types";

const copy: Record<ListingStatus, string> = {
  available: "Disponible",
  reserved: "Reservada",
  sold: "Vendida",
};

const styles: Record<ListingStatus, string> = {
  available: "border-[#9aa67b] bg-[#e5e8d8] text-[#465038]",
  reserved: "border-[#aa9272] bg-[#eee5d8] text-[#604f3a]",
  sold: "border-zinc-400 bg-[#e1e2dd] text-zinc-700",
};

const dots: Record<ListingStatus, string> = {
  available: "bg-[#718052]",
  reserved: "bg-[#8c704d]",
  sold: "bg-zinc-500",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={`race-cut-sm inline-flex items-center gap-1.5 border px-2.5 py-1 font-racing text-[11px] font-black uppercase italic tracking-[.055em] ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 ${dots[status]}`} />
      {copy[status]}
    </span>
  );
}
