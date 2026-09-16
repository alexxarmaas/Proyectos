import { demoListings } from "./demo";
import { getServerSupabase } from "./supabase";
import type { Listing, MarketplaceFilters } from "./types";

const listingSelect = "*, listing_images(public_url, position), seller:profiles!listings_seller_id_fkey(id, display_name, location, phone, whatsapp, avatar_url, created_at)";

export async function getListings(filters: MarketplaceFilters = {}) {
  const supabase = getServerSupabase();
  if (!supabase) {
    let rows = demoListings.filter((x) => !x.hidden);
    if (filters.q) {
      const normalize = (value: string) => value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, " ")
        .trim();
      const tokens = normalize(filters.q).split(/\s+/).filter(Boolean);
      rows = rows.filter((x) => {
        const haystack = normalize([x.title, x.brand, x.model, x.generation, x.engine, x.category, x.description, ...(x.available_parts ?? [])].filter(Boolean).join(" "));
        return tokens.every((token) => {
          const singular = token.length > 4 && token.endsWith("s") ? token.slice(0, -1) : token;
          return haystack.includes(token) || haystack.includes(singular);
        });
      });
    }
    if (filters.type) rows = rows.filter((x) => x.type === filters.type);
    if (filters.brand) rows = rows.filter((x) => x.brand.toLowerCase() === filters.brand?.toLowerCase());
    if (filters.model) rows = rows.filter((x) => x.model.toLowerCase().includes(filters.model!.toLowerCase()));
    if (filters.category) rows = rows.filter((x) => x.category === filters.category);
    if (filters.location) rows = rows.filter((x) => x.location.toLowerCase().includes(filters.location!.toLowerCase()));
    if (filters.status) rows = rows.filter((x) => x.status === filters.status);
    else rows = rows.filter((x) => x.status !== "sold");
    return rows.slice(0, filters.limit ?? 40);
  }

  let query = supabase.from("listings").select(listingSelect).eq("hidden", false).order("created_at", { ascending: false });
  if (filters.q) query = query.textSearch("search_vector", filters.q, { config: "spanish", type: "websearch" });
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.model) query = query.ilike("model", `%${filters.model}%`);
  if (filters.year) query = query.eq("year", Number(filters.year));
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.status) query = query.eq("status", filters.status);
  else query = query.neq("status", "sold");
  if (filters.minPrice) query = query.gte("price", Number(filters.minPrice));
  if (filters.maxPrice) query = query.lte("price", Number(filters.maxPrice));
  const { data, error } = await query.limit(filters.limit ?? 40);
  if (error) return [];
  return (data ?? []) as unknown as Listing[];
}

export async function getListingBySlug(slug: string) {
  const supabase = getServerSupabase();
  if (!supabase) return demoListings.find((x) => x.slug === slug) ?? null;
  const { data } = await supabase.from("listings").select(listingSelect).eq("slug", slug).eq("hidden", false).maybeSingle();
  return (data as unknown as Listing | null) ?? null;
}

export async function getSellerListings(id: string) {
  const supabase = getServerSupabase();
  if (!supabase) return demoListings.filter((x) => x.seller_id === id && !x.hidden);
  const { data } = await supabase.from("listings").select(listingSelect).eq("seller_id", id).eq("hidden", false).order("created_at", { ascending: false });
  return (data ?? []) as unknown as Listing[];
}
