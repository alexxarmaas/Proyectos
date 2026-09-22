import { demoListings } from "./demo";
import { distanceKm, toFiniteNumber } from "./geo";
import { getServerSupabase } from "./supabase";
import type { Listing, MarketplaceFilters, OemCompatibilitySuggestion, PartRequest } from "./types";

const listingSelect = "*, listing_images(public_url, position), listing_compatibilities(id, brand, model, generation, year_from, year_to, engine), donor_parts!donor_parts_vehicle_listing_id_fkey(id, vehicle_listing_id, seller_id, name, category, reference_code, price, status, notes, published_listing_id, position, created_at, updated_at, published_listing:listings!donor_parts_published_listing_id_fkey(slug, title)), seller:profiles!listings_seller_id_fkey(id, display_name, location, phone, whatsapp, avatar_url, seller_kind, created_at, last_active_at)";
const DEMO_FILL_UNTIL = 20;
const demoListingIds = new Set(demoListings.map((listing) => listing.id));

function markDemoListing(row: Listing) {
  return demoListingIds.has(row.id) ? { ...row, is_demo: true } : row;
}

function numericFilter(value?: string) {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeReference(value?: string) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function applyDistance(rows:Listing[],filters:MarketplaceFilters){
  const latitude=toFiniteNumber(filters.latitude);
  const longitude=toFiniteNumber(filters.longitude);
  const radius=toFiniteNumber(filters.radius);
  if(latitude===undefined||longitude===undefined)return rows;
  const withDistance=rows.map((row)=>({
    ...row,
    distance_km:typeof row.latitude==="number"&&typeof row.longitude==="number"
      ?distanceKm(latitude,longitude,row.latitude,row.longitude)
      :null
  }));
  const filtered=radius===undefined?withDistance:withDistance.filter((row)=>row.distance_km!==null&&row.distance_km<=radius);
  if(filters.sort==="distance")filtered.sort((a,b)=>(a.distance_km??Number.MAX_SAFE_INTEGER)-(b.distance_km??Number.MAX_SAFE_INTEGER));
  return filtered;
}

function filterDemoListings(filters: MarketplaceFilters = {}) {
  const year = numericFilter(filters.year);
  const minPrice = numericFilter(filters.minPrice);
  const maxPrice = numericFilter(filters.maxPrice);
  let rows = demoListings.filter((x) => !x.hidden);

  if (filters.q) {
    const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9.]+/g, " ").trim();
    const tokens = normalize(filters.q).split(/\s+/).filter(Boolean);
    rows = rows.filter((x) => {
      const haystack = normalize([x.title, x.brand, x.model, x.generation, x.engine, x.category, x.description, x.reference_code, ...(x.available_parts ?? [])].filter(Boolean).join(" "));
      return tokens.every((token) => {
        const singular = token.length > 4 && token.endsWith("s") ? token.slice(0, -1) : token;
        return haystack.includes(token) || haystack.includes(singular);
      });
    });
  }
  if (filters.oem) {
    const wanted = normalizeReference(filters.oem);
    rows = rows.filter((x) => normalizeReference(x.reference_code ?? "").includes(wanted));
  }
  if (filters.type) rows = rows.filter((x) => x.type === filters.type);
  if (filters.brand) rows = rows.filter((x) => x.brand.toLowerCase() === filters.brand?.toLowerCase());
  if (filters.model) rows = rows.filter((x) => x.model.toLowerCase().includes(filters.model!.toLowerCase()));
  if (filters.generation) rows = rows.filter((x) => (x.generation ?? "").toLowerCase().includes(filters.generation!.toLowerCase()));
  if (filters.engine) rows = rows.filter((x) => (x.engine ?? "").toLowerCase().includes(filters.engine!.toLowerCase()));
  if (year !== undefined) rows = rows.filter((x) => x.year === year);
  if (filters.category) rows = rows.filter((x) => x.category === filters.category);
  if (filters.location) rows = rows.filter((x) => x.location.toLowerCase().includes(filters.location!.toLowerCase()));
  if (filters.condition) rows = rows.filter((x) => x.condition === filters.condition);
  if (filters.status) rows = rows.filter((x) => x.status === filters.status);
  else rows = rows.filter((x) => x.status !== "sold");
  if (minPrice !== undefined) rows = rows.filter((x) => x.price !== null && x.price >= minPrice);
  if (maxPrice !== undefined) rows = rows.filter((x) => x.price !== null && x.price <= maxPrice);
  rows=applyDistance(rows,filters);
  if (filters.sort === "price_asc") rows.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
  if (filters.sort === "price_desc") rows.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  if (filters.sort === "oldest") rows.sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime());
  if (!filters.sort || filters.sort === "recent") rows.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  return rows.slice(0, filters.limit ?? 60);
}

export async function getListings(filters: MarketplaceFilters = {}) {
  const supabase = getServerSupabase();
  if (!supabase) return filterDemoListings(filters);
  const { count, error: countError } = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("hidden", false).neq("status", "sold");
  if (countError || !count) return filterDemoListings(filters);

  const year = numericFilter(filters.year);
  const minPrice = numericFilter(filters.minPrice);
  const maxPrice = numericFilter(filters.maxPrice);
  const hasGeo=toFiniteNumber(filters.latitude)!==undefined&&toFiniteNumber(filters.longitude)!==undefined;
  let query = supabase.from("listings").select(listingSelect).eq("hidden", false);
  if (filters.q) query = query.textSearch("search_vector", filters.q, { config: "spanish", type: "websearch" });
  if (filters.oem) {
    const normalized = normalizeReference(filters.oem);
    if (normalized) query = query.ilike("reference_code_normalized", "%" + normalized + "%");
  }
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.model) query = query.ilike("model", "%" + filters.model + "%");
  if (filters.generation) query = query.ilike("generation", "%" + filters.generation + "%");
  if (filters.engine) query = query.ilike("engine", "%" + filters.engine + "%");
  if (year !== undefined) query = query.eq("year", year);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.location) query = query.ilike("location", "%" + filters.location + "%");
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.status) query = query.eq("status", filters.status);
  else query = query.neq("status", "sold");
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);

  if (!hasGeo && filters.sort === "price_asc") query = query.order("price", { ascending: true, nullsFirst: false });
  else if (!hasGeo && filters.sort === "price_desc") query = query.order("price", { ascending: false, nullsFirst: false });
  else if (!hasGeo && filters.sort === "oldest") query = query.order("created_at", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query.limit(hasGeo ? 300 : (filters.limit ?? 60));
  if (error) return filterDemoListings(filters);
  let rows=((data ?? []) as unknown as Listing[]).map(markDemoListing);
  if (count < DEMO_FILL_UNTIL) {
    const existing = new Set(rows.map((row) => row.id));
    const demoRows = filterDemoListings({ ...filters, limit: filters.limit ?? 60 });
    rows = [...rows, ...demoRows.filter((row) => !existing.has(row.id))];
  }
  rows=applyDistance(rows,filters);
  if (filters.sort === "price_asc") rows.sort((a,b)=>(a.price??Number.MAX_SAFE_INTEGER)-(b.price??Number.MAX_SAFE_INTEGER));
  else if (filters.sort === "price_desc") rows.sort((a,b)=>(b.price??-1)-(a.price??-1));
  else if (filters.sort === "oldest") rows.sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime());
  else if (filters.sort !== "distance") rows.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  return rows.slice(0,filters.limit??60);
}

export async function getListingBySlug(slug: string) {
  const demo = demoListings.find((x) => x.slug === slug) ?? null;
  const supabase = getServerSupabase();
  if (!supabase) return demo;
  const { data } = await supabase.from("listings").select(listingSelect).eq("slug", slug).eq("hidden", false).maybeSingle();
  return data ? markDemoListing(data as unknown as Listing) : demo;
}

export async function getSellerListings(id: string) {
  const demo = demoListings.filter((x) => x.seller_id === id && !x.hidden);
  const supabase = getServerSupabase();
  if (!supabase) return demo;
  const { data } = await supabase.from("listings").select(listingSelect).eq("seller_id", id).eq("hidden", false).order("created_at", { ascending: false });
  if (data?.length) return (data as unknown as Listing[]).map(markDemoListing);
  return demo;
}

export async function getPartRequests() {
  const supabase = getServerSupabase();
  if (!supabase) return [] as PartRequest[];
  const { data } = await supabase.from("part_requests").select("*, requester:profiles!part_requests_requester_id_fkey(id, display_name, location, phone, whatsapp, avatar_url, seller_kind, created_at)").eq("status", "open").order("created_at", { ascending: false }).limit(100);
  return (data ?? []) as unknown as PartRequest[];
}

export async function getOemCompatibilityKnowledge(reference?: string | null) {
  if (!reference?.trim()) return [] as OemCompatibilitySuggestion[];
  const supabase = getServerSupabase();
  if (!supabase) return [] as OemCompatibilitySuggestion[];
  const { data, error } = await supabase.rpc("oem_compatibility_suggestions", { p_reference: reference });
  if (error) return [] as OemCompatibilitySuggestion[];
  return (data ?? []) as OemCompatibilitySuggestion[];
}
