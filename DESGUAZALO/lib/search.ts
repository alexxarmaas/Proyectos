import type { MarketplaceFilters } from "./types";

export type QueryToken = { label: string; value: string };
export type ParsedAutomotiveQuery = {
  residual: string;
  filters: Pick<MarketplaceFilters, "oem" | "brand" | "model" | "generation" | "year" | "engine" | "category">;
  recognized: QueryToken[];
};

function fold(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const brandAliases: Array<[RegExp, string]> = [
  [/\b(volkswagen|vw)\b/i, "Volkswagen"],
  [/\bseat\b/i, "SEAT"],
  [/\bbmw\b/i, "BMW"],
  [/\b(mercedes(?:-benz)?)\b/i, "Mercedes-Benz"],
  [/\baudi\b/i, "Audi"],
  [/\bpeugeot\b/i, "Peugeot"],
  [/\brenault\b/i, "Renault"],
  [/\bford\b/i, "Ford"],
  [/\btoyota\b/i, "Toyota"],
  [/\bopel\b/i, "Opel"],
  [/\bcitroen\b/i, "Citroën"],
  [/\bhonda\b/i, "Honda"],
  [/\bnissan\b/i, "Nissan"],
  [/\b(skoda|škoda)\b/i, "Skoda"],
];

const vehicleRules: Array<{ pattern: RegExp; brand: string; model: string; generation?: string }> = [
  { pattern:/\bgolf\s*(7|vii)\b/i, brand:"Volkswagen", model:"Golf", generation:"VII" },
  { pattern:/\bgolf\s*(8|viii)\b/i, brand:"Volkswagen", model:"Golf", generation:"VIII" },
  { pattern:/\bgolf\s*(6|vi)\b/i, brand:"Volkswagen", model:"Golf", generation:"VI" },
  { pattern:/\bgolf\b/i, brand:"Volkswagen", model:"Golf" },
  { pattern:/\bpolo\s*(aw)\b/i, brand:"Volkswagen", model:"Polo", generation:"AW" },
  { pattern:/\bpolo\s*6r\b/i, brand:"Volkswagen", model:"Polo", generation:"6R" },
  { pattern:/\bpolo\s*6c\b/i, brand:"Volkswagen", model:"Polo", generation:"6C" },
  { pattern:/\bpolo\s*9n\b/i, brand:"Volkswagen", model:"Polo", generation:"9N" },
  { pattern:/\bpolo\b/i, brand:"Volkswagen", model:"Polo" },
  { pattern:/\bibiza\s*6j\b/i, brand:"SEAT", model:"Ibiza", generation:"6J" },
  { pattern:/\bibiza\s*6l\b/i, brand:"SEAT", model:"Ibiza", generation:"6L" },
  { pattern:/\bibiza\s*kj\b/i, brand:"SEAT", model:"Ibiza", generation:"KJ" },
  { pattern:/\bibiza\b/i, brand:"SEAT", model:"Ibiza" },
  { pattern:/\bleon\s*5f\b/i, brand:"SEAT", model:"León", generation:"5F" },
  { pattern:/\bleon\s*1p\b/i, brand:"SEAT", model:"León", generation:"1P" },
  { pattern:/\bleon\s*kl\b/i, brand:"SEAT", model:"León", generation:"KL" },
  { pattern:/\bleon\b/i, brand:"SEAT", model:"León" },
  { pattern:/\ba3\s*8v\b/i, brand:"Audi", model:"A3", generation:"8V" },
  { pattern:/\ba3\s*8p\b/i, brand:"Audi", model:"A3", generation:"8P" },
  { pattern:/\ba3\s*8y\b/i, brand:"Audi", model:"A3", generation:"8Y" },
  { pattern:/\ba3\b/i, brand:"Audi", model:"A3" },
  { pattern:/\be46\b/i, brand:"BMW", model:"Serie 3", generation:"E46" },
  { pattern:/\be90\b/i, brand:"BMW", model:"Serie 3", generation:"E90" },
  { pattern:/\bf30\b/i, brand:"BMW", model:"Serie 3", generation:"F30" },
  { pattern:/\bcivic\s*(8|viii)\b/i, brand:"Honda", model:"Civic", generation:"VIII" },
  { pattern:/\bcivic\b/i, brand:"Honda", model:"Civic" },
  { pattern:/\bclase\s*a\s*(w176)\b/i, brand:"Mercedes-Benz", model:"Clase A", generation:"W176" },
];

const categoryRules: Array<[RegExp, string]> = [
  [/\b(faro|piloto|xenon|led|antiniebla)\b/i, "Iluminación"],
  [/\b(motor|turbo|inyector|inyeccion|culata|bloque|carter)\b/i, "Motor"],
  [/\b(caja|cambio|embrague|volante\s+motor|transmision)\b/i, "Transmisión"],
  [/\b(freno|pinza|disco|pastilla)\b/i, "Frenos"],
  [/\b(amortiguador|muelle|suspension)\b/i, "Suspensión"],
  [/\b(cremallera|direccion|mangueta)\b/i, "Dirección"],
  [/\b(puerta|paragolpes|aleta|capo|porton|retrovisor)\b/i, "Carrocería"],
  [/\b(asiento|salpicadero|tapizado|interior)\b/i, "Interior"],
  [/\b(centralita|alternador|motor\s+arranque|sensor|modulo|electronica)\b/i, "Electrónica"],
  [/\b(llanta|neumatico|rueda)\b/i, "Llantas y neumáticos"],
  [/\b(escape|catalizador|dpf|fap|silencioso)\b/i, "Escape"],
  [/\b(radiador|intercooler|termostato|refrigeracion)\b/i, "Refrigeración"],
];

function detectOem(raw: string) {
  const tokens = raw.split(/\s+/).filter(Boolean);
  for (let size = 3; size >= 1; size--) {
    for (let i = 0; i + size <= tokens.length; i++) {
      const group = tokens.slice(i, i + size);
      const first = group[0].replace(/[^a-zA-Z0-9]/g, "");
      const normalized = group.join("").replace(/[^a-zA-Z0-9]/g, "");
      if (/^(img|dsc|photo|foto|image)\d/i.test(normalized)) continue;
      const digits = (normalized.match(/\d/g) || []).length;
      const letters = (normalized.match(/[a-zA-Z]/g) || []).length;
      const spacedOem = size > 1
        && /^[a-zA-Z0-9]{2,4}$/.test(first)
        && /[a-zA-Z]/.test(first)
        && /\d/.test(first)
        && group.slice(1).every((token) => /^\d{2,4}$/.test(token));
      const compactOem = size === 1 && normalized.length >= 7 && digits >= 5 && letters >= 1;
      if ((compactOem || spacedOem) && normalized.length <= 18) {
        return { raw:group.join(" "), normalized };
      }
    }
  }
  return null;
}

export function parseAutomotiveQuery(input: string): ParsedAutomotiveQuery {
  const normalizedInput = fold(input).replace(/[,_/]+/g, " ").replace(/\s+/g, " ").trim();
  let working = normalizedInput;
  const filters: ParsedAutomotiveQuery["filters"] = {};
  const recognized: QueryToken[] = [];

  const oem = detectOem(input);
  if (oem) {
    filters.oem = oem.normalized;
    recognized.push({ label:"OEM", value:oem.normalized.toUpperCase() });
    working = working.replace(fold(oem.raw), " ");
  }

  const vehicle = vehicleRules.find((rule) => rule.pattern.test(working));
  if (vehicle) {
    const match = working.match(vehicle.pattern);
    filters.brand = vehicle.brand;
    filters.model = vehicle.model;
    if (vehicle.generation) filters.generation = vehicle.generation;
    recognized.push({ label:"Vehículo", value:[vehicle.brand,vehicle.model,vehicle.generation].filter(Boolean).join(" ") });
    if (match?.[0]) working = working.replace(match[0], " ");
  }

  if (!filters.brand) {
    for (const [pattern, brand] of brandAliases) {
      const match = working.match(pattern);
      if (!match) continue;
      filters.brand = brand;
      recognized.push({ label:"Marca", value:brand });
      working = working.replace(match[0], " ");
      break;
    }
  }

  const yearMatch = working.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    filters.year = yearMatch[1];
    recognized.push({ label:"Año", value:yearMatch[1] });
    working = working.replace(yearMatch[0], " ");
  }

  const engineMatch = working.match(/\b\d(?:[.,]\d)\s*(?:tdi|tsi|tfsi|hdi|dci|cdti|crdi|i-?vtec|mpi|gdi)\b/i)
    ?? working.match(/\b\d{3}[di]\s+[a-z]\d{2}\b/i);
  if (engineMatch) {
    const engine=engineMatch[0].replace(",", ".").toUpperCase();
    filters.engine = engine;
    recognized.push({ label:"Motor", value:engine });
    working = working.replace(engineMatch[0], " ");
  }

  const category = categoryRules.find(([pattern]) => pattern.test(working));
  if (category) {
    filters.category = category[1];
    recognized.push({ label:"Categoría", value:category[1] });
  }

  const residual = working.replace(/\s+/g, " ").trim();
  return { residual, filters, recognized };
}
