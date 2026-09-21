import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="DESGUÁZALO, inicio">
      <span className="race-cut-sm grid h-9 w-10 place-items-center bg-[var(--dg-accent)] font-racing text-lg font-black italic tracking-[-0.09em] text-[var(--dg-ink)] transition-transform group-hover:-skew-x-3">
        D/
      </span>
      <span className={`font-racing text-[1.28rem] font-black italic uppercase leading-none tracking-[-0.035em] sm:text-[1.45rem] ${light ? "text-zinc-100" : "text-[var(--dg-ink)]"}`}>
        DESGUÁZALO
      </span>
    </Link>
  );
}
