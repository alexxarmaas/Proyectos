import type { ListingStatus } from "@/lib/types";

const copy: Record<ListingStatus, string> = {
  available: "Disponible",
  reserved: "Reservada",
  sold: "Vendida",
};

const styles: Record<ListingStatus, string> = {
  available: "border-[#7ca100] bg-[#dfff75] text-[#243000]",
  reserved: "border-[#c57d16] bg-[#ffd89a] text-[#5a3300]",
  sold: "border-zinc-400 bg-zinc-200 text-zinc-700",
};

const dots: Record<ListingStatus, string> = {
  available: "bg-[#537000]",
  reserved: "bg-[#a45c00]",
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
