import { demoListings } from "./demo";
import { getServerSupabase } from "./supabase";
import type { Listing, MarketplaceFilters } from "./types";

const listingSelect = "*, listing_images(public_url, position), seller:profiles!listings_seller_id_fkey(id, display_name, location, phone, whatsapp, avatar_url, created_at)";

function numericFilter(value?: string) {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function filterDemoListings(filters: MarketplaceFilters = {}) {
  const year = numericFilter(filters.year);
  const minPrice = numericFilter(filters.minPrice);
  const maxPrice = numericFilter(filters.maxPrice);
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
  if (year !== undefined) rows = rows.filter((x) => x.year === year);
  if (filters.category) rows = rows.filter((x) => x.category === filters.category);
  if (filters.location) rows = rows.filter((x) => x.location.toLowerCase().includes(filters.location!.toLowerCase()));
  if (filters.condition) rows = rows.filter((x) => x.condition === filters.condition);
  if (filters.status) rows = rows.filter((x) => x.status === filters.status);
  else rows = rows.filter((x) => x.status !== "sold");
  if (minPrice !== undefined) rows = rows.filter((x) => x.price !== null && x.price >= minPrice);
  if (maxPrice !== undefined) rows = rows.filter((x) => x.price !== null && x.price <= maxPrice);
  return rows.slice(0, filters.limit ?? 40);
}

export async function getListings(filters: MarketplaceFilters = {}) {
  const supabase = getServerSupabase();
  if (!supabase) return filterDemoListings(filters);

  // A fresh deployment should still be visually testable before the first real
  // seller publishes. Demo rows are clearly labelled and contain no live contact data.
  const { count, error: countError } = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("hidden", false);
  if (countError || !count) return filterDemoListings(filters);

  const year = numericFilter(filters.year);
  const minPrice = numericFilter(filters.minPrice);
  const maxPrice = numericFilter(filters.maxPrice);
  let query = supabase.from("listings").select(listingSelect).eq("hidden", false).order("created_at", { ascending: false });
  if (filters.q) query = query.textSearch("search_vector", filters.q, { config: "spanish", type: "websearch" });
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.model) query = query.ilike("model", `%${filters.model}%`);
  if (year !== undefined) query = query.eq("year", year);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.status) query = query.eq("status", filters.status);
  else query = query.neq("status", "sold");
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  const { data, error } = await query.limit(filters.limit ?? 40);
  if (error) return [];
  return (data ?? []) as unknown as Listing[];
}

export async function getListingBySlug(slug: string) {
  const demo = demoListings.find((x) => x.slug === slug) ?? null;
  const supabase = getServerSupabase();
  if (!supabase) return demo;
  const { data } = await supabase.from("listings").select(listingSelect).eq("slug", slug).eq("hidden", false).maybeSingle();
  return (data as unknown as Listing | null) ?? demo;
}

export async function getSellerListings(id: string) {
  const demo = demoListings.filter((x) => x.seller_id === id && !x.hidden);
  const supabase = getServerSupabase();
  if (!supabase) return demo;
  const { data } = await supabase.from("listings").select(listingSelect).eq("seller_id", id).eq("hidden", false).order("created_at", { ascending: false });
  if (data?.length) return data as unknown as Listing[];
  return demo;
}
