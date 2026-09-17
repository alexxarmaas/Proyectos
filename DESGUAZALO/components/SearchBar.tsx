export function SearchBar({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  return (
    <form action="/marketplace" className={`flex w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${compact ? "max-w-3xl" : "max-w-4xl"}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Faros Golf 7, caja Polo 1.0 TSI, motor E46…"
          aria-label="Buscar piezas"
          className={`min-w-0 flex-1 border-0 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 ${compact ? "py-3 text-sm" : "py-4 text-sm sm:text-base"}`}
        />
      </div>
      <button className="m-1.5 rounded-xl bg-lime-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-lime-300 sm:px-6" type="submit">Buscar</button>
    </form>
  );
}
