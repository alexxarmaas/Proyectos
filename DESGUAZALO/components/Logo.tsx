import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="DESGUÁZALO, inicio">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-400 text-sm font-black tracking-[-0.08em] text-slate-950 shadow-sm shadow-lime-950/10 transition-transform group-hover:-rotate-2">
        D/
      </span>
      <span className={`text-sm font-black tracking-[-0.045em] sm:text-base ${light ? "text-white" : "text-slate-950"}`}>
        DESGUÁZALO
      </span>
    </Link>
  );
}
