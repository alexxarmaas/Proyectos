export function SearchBar({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  return (
    <form action="/marketplace" className={`race-cut flex w-full items-stretch overflow-hidden border border-white/12 bg-[#222723] shadow-[6px_6px_0_rgba(0,0,0,.2)] ${compact ? "max-w-3xl" : "max-w-4xl"}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[var(--dg-accent-text)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Referencia, pieza o coche…"
          aria-label="Buscar piezas"
          className={`min-w-0 flex-1 border-0 bg-transparent font-semibold text-zinc-100 outline-none placeholder:text-zinc-600 ${compact ? "py-3.5 text-sm" : "py-4 text-sm sm:text-base"}`}
        />
      </div>
      <button className="m-1.5 dg-cta-safe bg-[var(--dg-accent)] px-5 font-racing text-sm font-black uppercase italic tracking-[.05em] text-[var(--dg-ink)] transition hover:bg-[var(--dg-accent-hover)] sm:px-6" type="submit">Buscar</button>
    </form>
  );
}
