export const categories = [
  { icon: "wrench", title: "Mecánica y mantenimiento", desc: "Filtros, distribución, frenado, embrague y mantenimiento general." },
  { icon: "bolt", title: "Iluminación y electricidad", desc: "Faros, pilotos, baterías, sensores, alternadores y material eléctrico." },
  { icon: "car", title: "Carrocería", desc: "Retrovisores, rejillas, paragolpes, accesorios exteriores y componentes." },
  { icon: "spark", title: "Accesorios", desc: "Confort, estética, interior, organización y accesorios universales." },
  { icon: "mountain", title: "Camper y 4x4", desc: "Soluciones específicas para camperización, aventura y vehículos 4x4." },
  { icon: "bike", title: "Moto", desc: "Consumibles, accesorios y referencias para motocicleta." }
] as const;

export const catalogs = [
  { tag: "NOVEDAD", title: "Accesorios 2026", meta: "Selección general · PDF", pages: "84 págs." },
  { tag: "4X4", title: "Aventura & Off-road", meta: "4x4 · SUV · Pick-up", pages: "52 págs." },
  { tag: "CAMPER", title: "Camper & Van", meta: "Equipamiento y accesorios", pages: "61 págs." }
];

export const requests = [
  { id: "SA-1048", plate: "4821 LMR", item: "Kit distribución", channel: "WhatsApp", status: "Pendiente", time: "10:42" },
  { id: "SA-1047", plate: "7390 MDP", item: "Piloto trasero derecho", channel: "Web", status: "Respondida", time: "09:58" },
  { id: "SA-1046", plate: "1224 KCV", item: "Pastillas delanteras", channel: "WhatsApp", status: "Presupuesto", time: "09:31" },
  { id: "SA-1045", plate: "5633 JRX", item: "Retrovisor completo", channel: "Web", status: "Respondida", time: "Ayer" }
];
