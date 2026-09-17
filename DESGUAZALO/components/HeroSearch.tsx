import { popularBrands } from "@/lib/catalog";

const popularModels = ["Golf 7", "Polo AW", "Ibiza 6J", "León 5F", "E46", "A3 8V", "Clase A W176"];

export function HeroSearch() {
  const fieldClass = "relative border border-white/12 bg-[#171a1c] px-4 py-3.5 transition focus-within:border-[#c8ff1a]/80 focus-within:bg-[#1b1f21]";
  const labelClass = "mb-1 block font-racing text-[10px] font-black uppercase italic tracking-[.16em] text-zinc-500";
  const inputClass = "w-full appearance-none border-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:font-medium placeholder:text-zinc-600";

  return (
    <form action="/marketplace" className="race-cut border border-white/15 bg-[#0f1112] p-2 shadow-[14px_14px_0_rgba(0,0,0,.24)]">
      <div className="mb-2 flex items-center justify-between gap-3 px-2 py-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[#c8ff1a] shadow-[0_0_14px_rgba(200,255,26,.55)]" />
          <span className="font-racing text-xs font-black uppercase italic tracking-[.16em] text-zinc-300">Parts Finder</span>
        </div>
        <span className="hidden text-[10px] font-bold uppercase tracking-[.12em] text-zinc-600 sm:block">Marca · Modelo · Pieza</span>
      </div>

      <div className="grid gap-2 lg:grid-cols-[1fr_1fr_1.4fr_auto]">
        <label className={fieldClass}>
          <span className={labelClass}>01 / Marca</span>
          <select name="brand" defaultValue="" className={inputClass}>
            <option value="" className="bg-[#171a1c]">Cualquier marca</option>
            {popularBrands.map((brand) => <option key={brand} value={brand} className="bg-[#171a1c]">{brand}</option>)}
          </select>
        </label>

        <label className={fieldClass}>
          <span className={labelClass}>02 / Modelo</span>
          <input name="model" list="hero-models" placeholder="Golf 7, Ibiza 6J…" className={inputClass} />
          <datalist id="hero-models">
            {popularModels.map((model) => <option key={model} value={model} />)}
          </datalist>
        </label>

        <label className={fieldClass}>
          <span className={labelClass}>03 / Pieza</span>
          <input name="q" placeholder="Faro, turbo, caja, llanta…" className={inputClass} />
        </label>

        <button type="submit" className="race-cut-sm flex min-h-16 items-center justify-center gap-2 bg-[#c8ff1a] px-7 font-racing text-base font-black uppercase italic tracking-[.055em] text-[#101214] transition hover:bg-[#dcff6f] lg:min-h-0">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Buscar
        </button>
      </div>
    </form>
  );
}
