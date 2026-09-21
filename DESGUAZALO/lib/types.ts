export type ListingType = "part" | "vehicle";
export type ListingStatus = "available" | "reserved" | "sold";

export type Seller = {
  id: string;
  display_name: string;
  location: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  seller_kind?: "private" | "professional";
  created_at?: string;
  last_active_at?: string;
};

export type ListingImage = { id?: string; public_url: string; position: number };

export type ListingCompatibility = {
  id?: string; listing_id?: string; brand: string; model: string; generation: string | null;
  year_from: number | null; year_to: number | null; engine: string | null;
};

export type OemCompatibilitySuggestion = ListingCompatibility & { occurrences: number };

export type DonorPartPrivate = {
  donor_part_id: string;
  seller_id: string;
  internal_sku: string | null;
  storage_location: string | null;
  purchase_price: number | null;
  private_notes: string | null;
  batch_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DonorPart = {
  id: string;
  vehicle_listing_id: string;
  seller_id: string;
  name: string;
  category: string | null;
  reference_code: string | null;
  price: number | null;
  status: ListingStatus;
  notes: string | null;
  published_listing_id: string | null;
  position: number;
  condition: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  private_meta?: DonorPartPrivate | null;
  donor_part_images?: { id: string; public_url?: string; position: number }[];
  published_listing?: { id?: string; slug: string; title: string; status?: ListingStatus; hidden?: boolean } | null;
};

export type InventoryBatch = {
  id: string;
  seller_id: string;
  vehicle_listing_id: string | null;
  source: "manual" | "csv";
  filename: string | null;
  row_count: number;
  created_at: string;
};

export type UserVehicle = {
  id: string; user_id: string; nickname: string | null; brand: string; model: string; generation: string | null;
  year: number | null; engine: string | null; is_primary: boolean; created_at: string;
};

export type Listing = {
  id: string; seller_id: string; type: ListingType; title: string; slug: string; description: string | null;
  brand: string; model: string; generation: string | null; year: number | null; engine: string | null;
  category: string | null; condition: string; price: number | null; location: string; mileage: number | null;
  available_parts: string[] | null; reference_code: string | null; reference_code_normalized?: string | null;
  technical_notes: string | null; shipping_available?: boolean; pickup_available?: boolean; status: ListingStatus;
  hidden: boolean; created_at: string; updated_at: string; listing_images?: ListingImage[];
  listing_compatibilities?: ListingCompatibility[]; donor_parts?: DonorPart[]; seller?: Seller | null; is_demo?: boolean;
};

export type PartRequest = {
  id: string; requester_id: string; title: string; brand: string; model: string; generation: string | null;
  year: number | null; engine: string | null; reference_code: string | null; reference_code_normalized?: string | null;
  location: string; notes: string | null; status: "open" | "closed"; created_at: string; updated_at: string; requester?: Seller | null;
};

export type RequestMatch = {
  request_id: string; listing_id: string; score: number; reasons: string[]; seen_at: string | null; created_at: string;
  listing?: Pick<Listing, "id" | "title" | "slug" | "price" | "status" | "reference_code" | "brand" | "model" | "generation" | "year"> & { listing_images?: ListingImage[] };
};

export type SavedSearch = {
  id: string; user_id: string; name: string; query_params: Record<string,string>; alerts_enabled: boolean; created_at: string; last_checked_at: string | null;
};

export type MarketplaceFilters = {
  q?: string; oem?: string; brand?: string; model?: string; year?: string; category?: string; minPrice?: string; maxPrice?: string;
  location?: string; condition?: string; status?: string; type?: string; sort?: string; limit?: number;
};
