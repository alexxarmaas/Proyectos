import { popularBrands } from "@/lib/catalog";

const popularModels = ["Golf 7", "Polo AW", "Ibiza 6J", "León 5F", "E46", "A3 8V", "Clase A W176"];

export function HeroSearch() {
  return (
    <form action="/marketplace" className="rounded-3xl border border-white/70 bg-white p-3 shadow-[0_30px_80px_-35px_rgba(15,23,42,.65)] sm:p-4">
      <div className="grid gap-2.5 lg:grid-cols-[1fr_1fr_1.4fr_auto]">
        <label className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-lime-400 focus-within:bg-white">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-400">Marca</span>
          <select name="brand" defaultValue="" className="w-full appearance-none border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none">
            <option value="">Cualquier marca</option>
            {popularBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </label>

        <label className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-lime-400 focus-within:bg-white">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-400">Modelo</span>
          <input name="model" list="hero-models" placeholder="Golf 7, Ibiza 6J…" className="w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" />
          <datalist id="hero-models">
            {popularModels.map((model) => <option key={model} value={model} />)}
          </datalist>
        </label>

        <label className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-lime-400 focus-within:bg-white">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-400">Pieza</span>
          <input name="q" placeholder="¿Qué recambio buscas?" className="w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" />
        </label>

        <button type="submit" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-6 text-sm font-black text-slate-950 transition hover:bg-lime-300 lg:min-h-0">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Buscar
        </button>
      </div>
    </form>
  );
}
