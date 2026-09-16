export const categories = [
  { icon: "wrench", title: "Mecánica y mantenimiento", desc: "Filtros, distribución, frenado, embrague, aceites y mantenimiento general para que salgas con la pieza correcta." },
  { icon: "bolt", title: "Iluminación y electricidad", desc: "Faros, pilotos, baterías, sensores, alternadores, lámparas y material eléctrico para turismo y vehículo comercial." },
  { icon: "car", title: "Carrocería", desc: "Retrovisores, rejillas, paragolpes, molduras y componentes exteriores para devolverle al coche su mejor cara." },
  { icon: "spark", title: "Accesorios", desc: "Interior, confort, limpieza, organización, audio y accesorios universales con asesoramiento rápido." },
  { icon: "mountain", title: "Camper y 4x4", desc: "Equipamiento, aventura, almacenaje, protección y accesorios específicos para camper, SUV, pick-up y 4x4." },
  { icon: "bike", title: "Moto", desc: "Consumibles, recambio rápido y accesorios para motocicleta con atención directa por WhatsApp." }
] as const;

export const catalogs = [
  { tag: "NOVEDAD", title: "Accesorios 2026", meta: "Selección general · PDF", pages: "84 págs." },
  { tag: "4X4", title: "Aventura & Off-road", meta: "4x4 · SUV · Pick-up", pages: "52 págs." },
  { tag: "CAMPER", title: "Camper & Van", meta: "Equipamiento y accesorios", pages: "61 págs." }
];

export const featuredBrands = ["BOSCH", "VALEO", "MANN FILTER", "BREMBO", "NGK", "PHILIPS"];

export const reviews = [
  {
    name: "Valoración en Google",
    role: "5,0 / 5 · 27 reseñas",
    quote: "Una valoración local excelente que ayuda a convertir búsquedas en confianza antes de contactar.",
  },
  {
    name: "Atención directa",
    role: "Mostrador + teléfono + WhatsApp",
    quote: "El cliente puede pasar de la búsqueda a una conversación real sin registros, carritos ni procesos innecesarios.",
  },
  {
    name: "Canal profesional",
    role: "Talleres · empresas · flotas",
    quote: "Un espacio específico para quienes necesitan referencias, presupuestos y pedidos recurrentes con más agilidad.",
  },
] as const;

export const requests = [
  { id: "SA-1048", plate: "4821 LMR", item: "Kit distribución", channel: "WhatsApp", status: "Pendiente", time: "10:42" },
  { id: "SA-1047", plate: "7390 MDP", item: "Piloto trasero derecho", channel: "Web", status: "Respondida", time: "09:58" },
  { id: "SA-1046", plate: "1224 KCV", item: "Pastillas delanteras", channel: "WhatsApp", status: "Presupuesto", time: "09:31" },
  { id: "SA-1045", plate: "5633 JRX", item: "Retrovisor completo", channel: "Web", status: "Respondida", time: "Ayer" }
];
