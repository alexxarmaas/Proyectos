import { createClient } from "@supabase/supabase-js";
import { demoListings } from "../lib/demo.ts";

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
    seller_kind: "professional",
    is_admin: false
  },
  {
    email: "marta@desguazalo.local",
    password: "DesguazaloDemo2026!",
    display_name: "Marta R.",
    location: "Las Palmas de Gran Canaria",
    seller_kind: "private",
    is_admin: false
  },
  {
    email: "admin@desguazalo.local",
    password: "DesguazaloAdmin2026!",
    display_name: "Javi Parts",
    location: "Vecindario, Gran Canaria",
    seller_kind: "professional",
    is_admin: true
  },
  {
    email: "motorsur@desguazalo.local",
    password: "DesguazaloDemo2026!",
    display_name: "Motor Sur GC",
    location: "Arinaga, Gran Canaria",
    seller_kind: "professional",
    is_admin: false
  }
];

async function ensureUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  const idsByName = new Map();

  for (const candidate of demoUsers) {
    let user = data.users.find((item) => item.email?.toLowerCase() === candidate.email.toLowerCase());
    if (!user) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: candidate.email,
        password: candidate.password,
        email_confirm: true,
        user_metadata: {
          display_name: candidate.display_name,
          location: candidate.location
        }
      });
      if (createError) throw createError;
      user = created.user;
    }

    if (!user) throw new Error(`No se pudo crear ${candidate.email}`);
    idsByName.set(candidate.display_name, user.id);

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: candidate.display_name,
      location: candidate.location,
      phone: null,
      whatsapp: null,
      seller_kind: candidate.seller_kind,
      is_admin: candidate.is_admin,
      updated_at: new Date().toISOString()
    });
    if (profileError) throw profileError;
  }

  return idsByName;
}

function databaseListing(listing, sellerId) {
  return {
    id: listing.id,
    seller_id: sellerId,
    type: listing.type,
    title: listing.title,
    slug: listing.slug,
    description: listing.description,
    brand: listing.brand,
    model: listing.model,
    generation: listing.generation,
    year: listing.year,
    engine: listing.engine,
    category: listing.category,
    condition: listing.condition,
    price: listing.price,
    location: listing.location,
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
    mileage: listing.mileage,
    available_parts: listing.available_parts,
    reference_code: listing.reference_code,
    technical_notes: listing.technical_notes,
    shipping_available: listing.shipping_available ?? false,
    pickup_available: listing.pickup_available ?? true,
    status: listing.status,
    hidden: listing.hidden,
    created_at: listing.created_at,
    updated_at: listing.updated_at
  };
}

async function seedMarketplace(idsByName) {
  const listings = demoListings.map((listing) => {
    const displayName = listing.seller?.display_name;
    const sellerId = displayName ? idsByName.get(displayName) : null;
    if (!sellerId) throw new Error(`No hay usuario demo para ${displayName ?? listing.seller_id}`);
    return databaseListing(listing, sellerId);
  });

  const { error: listingError } = await supabase.from("listings").upsert(listings, { onConflict: "id" });
  if (listingError) throw listingError;

  const images = demoListings.flatMap((listing) =>
    (listing.listing_images ?? []).map((image) => ({
      listing_id: listing.id,
      storage_path: `demo/external/${listing.id}/${image.position}.jpg`,
      public_url: image.public_url,
      position: image.position
    }))
  );
  const { error: imageError } = await supabase.from("listing_images").upsert(images, { onConflict: "listing_id,position" });
  if (imageError) throw imageError;

  const listingIds = demoListings.map((listing) => listing.id);
  const { error: deleteCompatibilityError } = await supabase.from("listing_compatibilities").delete().in("listing_id", listingIds);
  if (deleteCompatibilityError) throw deleteCompatibilityError;

  const compatibilities = demoListings.flatMap((listing) =>
    (listing.listing_compatibilities ?? []).map((compatibility) => ({
      listing_id: listing.id,
      brand: compatibility.brand,
      model: compatibility.model,
      generation: compatibility.generation,
      year_from: compatibility.year_from,
      year_to: compatibility.year_to,
      engine: compatibility.engine
    }))
  );
  if (compatibilities.length) {
    const { error: compatibilityError } = await supabase.from("listing_compatibilities").insert(compatibilities);
    if (compatibilityError) throw compatibilityError;
  }

  console.log(`Marketplace demo sincronizado: ${listings.length} anuncios.`);
}

try {
  const idsByName = await ensureUsers();
  await seedMarketplace(idsByName);
  console.log("Seed completado.");
  console.log("Usuario demo: demo@desguazalo.local / DesguazaloDemo2026!");
  console.log("Admin demo: admin@desguazalo.local / DesguazaloAdmin2026!");
} catch (error) {
  console.error(error);
  process.exit(1);
}
