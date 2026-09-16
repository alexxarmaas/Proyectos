import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const demoUsers = [
  {
    email: "demo@desguazalo.local",
    password: "DesguazaloDemo2026!",
    display_name: "Dani Garage",
    location: "Telde, Gran Canaria",
    phone: "+34600111222",
    whatsapp: "34600111222",
    is_admin: false
  },
  {
    email: "marta@desguazalo.local",
    password: "DesguazaloDemo2026!",
    display_name: "Marta R.",
    location: "Las Palmas de Gran Canaria",
    phone: null,
    whatsapp: "34610333444",
    is_admin: false
  },
  {
    email: "admin@desguazalo.local",
    password: "DesguazaloAdmin2026!",
    display_name: "Javi Parts",
    location: "Vecindario, Gran Canaria",
    phone: "+34620555666",
    whatsapp: "34620555666",
    is_admin: true
  }
];

async function ensureUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  const ids = new Map();

  for (const candidate of demoUsers) {
    let user = data.users.find((item) => item.email?.toLowerCase() === candidate.email.toLowerCase());
    if (!user) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: candidate.email,
        password: candidate.password,
        email_confirm: true,
        user_metadata: {
          display_name: candidate.display_name,
          location: candidate.location,
          phone: candidate.phone,
          whatsapp: candidate.whatsapp
        }
      });
      if (createError) throw createError;
      user = created.user;
    }

    if (!user) throw new Error(`No se pudo crear ${candidate.email}`);
    ids.set(candidate.email, user.id);

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: candidate.display_name,
      location: candidate.location,
      phone: candidate.phone,
      whatsapp: candidate.whatsapp,
      is_admin: candidate.is_admin,
      updated_at: new Date().toISOString()
    });
    if (profileError) throw profileError;
  }

  return ids;
}

function dateDaysAgo(days) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

async function seedMarketplace(ids) {
  const dani = ids.get("demo@desguazalo.local");
  const marta = ids.get("marta@desguazalo.local");
  const javi = ids.get("admin@desguazalo.local");
  const car = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";
  const engine = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80";
  const lights = "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80";

  const listings = [
    {
      id: "a0000000-0000-0000-0000-000000000001", seller_id: dani, type: "part", title: "Faro LED Volkswagen Golf 7",
      slug: "faro-led-volkswagen-golf-7-a00001", description: "Faro delantero derecho OEM, patillas completas y sin humedad.",
      brand: "Volkswagen", model: "Golf", generation: "VII", year: 2018, engine: "1.6 TDI", category: "Iluminación",
      condition: "Buen estado", price: 180, location: "Telde, Gran Canaria", reference_code: "5G1941036",
      technical_notes: "LED completo, lado acompañante.", status: "available", created_at: dateDaysAgo(0), updated_at: dateDaysAgo(0)
    },
    {
      id: "a0000000-0000-0000-0000-000000000002", seller_id: javi, type: "part", title: "Caja de cambios Polo AW 1.0 TSI",
      slug: "caja-cambios-polo-aw-10-tsi-a00002", description: "Caja manual comprobada antes del desmontaje.",
      brand: "Volkswagen", model: "Polo", generation: "AW", year: 2020, engine: "1.0 TSI", category: "Transmisión",
      condition: "Usada", price: 620, location: "Vecindario, Gran Canaria", mileage: 78000,
      technical_notes: "Se entrega sin embrague.", status: "available", created_at: dateDaysAgo(1), updated_at: dateDaysAgo(1)
    },
    {
      id: "a0000000-0000-0000-0000-000000000003", seller_id: marta, type: "part", title: "Motor BMW E46 320d M47",
      slug: "motor-bmw-e46-320d-m47-a00003", description: "Motor completo. Arrancaba y circulaba antes de desmontar.",
      brand: "BMW", model: "Serie 3", generation: "E46", year: 2003, engine: "320d M47", category: "Motor",
      condition: "Usada", price: 950, location: "Las Palmas de Gran Canaria", mileage: 210000, reference_code: "M47D20",
      technical_notes: "Incluye turbo e inyección.", status: "reserved", created_at: dateDaysAgo(2), updated_at: dateDaysAgo(0)
    },
    {
      id: "a0000000-0000-0000-0000-000000000004", seller_id: dani, type: "vehicle", title: "SEAT Ibiza 6J para despiece",
      slug: "seat-ibiza-6j-despiece-a00004", description: "Golpe trasero. Motor, frontal e interior aprovechables. Documentación de baja.",
      brand: "SEAT", model: "Ibiza", generation: "6J", year: 2011, engine: "1.6 TDI 90 CV", category: null,
      condition: "Golpe trasero", price: 1500, location: "Telde, Gran Canaria", mileage: 168000,
      available_parts: ["Motor", "Caja de cambios", "Faros", "Puertas delanteras", "Interior", "Centralita"],
      status: "available", created_at: dateDaysAgo(3), updated_at: dateDaysAgo(3)
    },
    {
      id: "a0000000-0000-0000-0000-000000000005", seller_id: javi, type: "part", title: "Piloto trasero Audi A3 8V",
      slug: "piloto-trasero-audi-a3-8v-a00005", description: "Exterior izquierdo, conector intacto.", brand: "Audi", model: "A3",
      generation: "8V", year: 2016, engine: "2.0 TDI", category: "Iluminación", condition: "Buen estado", price: 95,
      location: "Vecindario, Gran Canaria", status: "sold", created_at: dateDaysAgo(7), updated_at: dateDaysAgo(1)
    },
    {
      id: "a0000000-0000-0000-0000-000000000006", seller_id: marta, type: "vehicle", title: "Honda Civic VIII 1.8 para piezas",
      slug: "honda-civic-viii-18-piezas-a00006", description: "Motor averiado por calentón. Carrocería, cambio, interior y electrónica disponibles.",
      brand: "Honda", model: "Civic", generation: "VIII", year: 2008, engine: "1.8 i-VTEC", category: null,
      condition: "Para reparar", price: 900, location: "Las Palmas de Gran Canaria", mileage: 196000,
      available_parts: ["Caja de cambios", "Asientos", "Puertas", "Cuadro", "Alternador"], status: "available",
      created_at: dateDaysAgo(4), updated_at: dateDaysAgo(4)
    },
    {
      id: "a0000000-0000-0000-0000-000000000007", seller_id: javi, type: "part", title: "Alternador VAG 1.0 TSI",
      slug: "alternador-vag-10-tsi-a00007", description: "Alternador comprobado, procedente de Polo AW con 54.000 km.",
      brand: "Volkswagen", model: "Polo", generation: "AW", year: 2021, engine: "1.0 TSI", category: "Electrónica",
      condition: "Buen estado", price: 140, location: "Vecindario, Gran Canaria", status: "available",
      created_at: dateDaysAgo(5), updated_at: dateDaysAgo(5)
    },
    {
      id: "a0000000-0000-0000-0000-000000000008", seller_id: dani, type: "part", title: "Paragolpes delantero Renault Clio IV",
      slug: "paragolpes-delantero-renault-clio-iv-a00008", description: "Original, con marcas de uso pero sin grietas ni reparaciones.",
      brand: "Renault", model: "Clio", generation: "IV", year: 2017, engine: "0.9 TCe", category: "Carrocería",
      condition: "Usada", price: 120, location: "Telde, Gran Canaria", status: "available",
      created_at: dateDaysAgo(6), updated_at: dateDaysAgo(6)
    }
  ];

  const { error: listingError } = await supabase.from("listings").upsert(listings, { onConflict: "id" });
  if (listingError) throw listingError;

  const images = listings.map((listing, index) => ({
    listing_id: listing.id,
    storage_path: `demo/external/${listing.id}/0.jpg`,
    public_url: listing.type === "vehicle" ? car : index % 3 === 0 ? lights : engine,
    position: 0
  }));
  const { error: imageError } = await supabase.from("listing_images").upsert(images, { onConflict: "listing_id,position" });
  if (imageError) throw imageError;

  const compatibilities = [
    { id: "c0000000-0000-0000-0000-000000000001", listing_id: "a0000000-0000-0000-0000-000000000007", brand: "Volkswagen", model: "Polo", generation: "AW", year_from: 2018, year_to: 2024, engine: "1.0 TSI" },
    { id: "c0000000-0000-0000-0000-000000000002", listing_id: "a0000000-0000-0000-0000-000000000007", brand: "SEAT", model: "Ibiza", generation: "KJ", year_from: 2018, year_to: 2024, engine: "1.0 TSI" },
    { id: "c0000000-0000-0000-0000-000000000003", listing_id: "a0000000-0000-0000-0000-000000000007", brand: "Skoda", model: "Fabia", generation: null, year_from: 2021, year_to: 2024, engine: "1.0 TSI" }
  ];
  const { error: compatibilityError } = await supabase.from("listing_compatibilities").upsert(compatibilities, { onConflict: "id" });
  if (compatibilityError) throw compatibilityError;
}

try {
  const ids = await ensureUsers();
  await seedMarketplace(ids);
  console.log("Seed completado.");
  console.log("Usuario demo: demo@desguazalo.local / DesguazaloDemo2026!");
  console.log("Admin demo: admin@desguazalo.local / DesguazaloAdmin2026!");
} catch (error) {
  console.error(error);
  process.exit(1);
}
