export function SearchBar({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  return (
    <form action="/marketplace" className={compact ? "search-bar compact" : "search-bar"}>
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input name="q" defaultValue={defaultValue} placeholder="faros golf 7, caja polo 1.0 tsi, motor e46…" aria-label="Buscar piezas" />
      <button className="button button-primary" type="submit">Buscar</button>
    </form>
  );
}
