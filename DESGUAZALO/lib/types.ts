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

export type ListingImage = {
  id?: string;
  public_url: string;
  position: number;
};

export type ListingCompatibility = {
  id?: string;
  listing_id?: string;
  brand: string;
  model: string;
  generation: string | null;
  year_from: number | null;
  year_to: number | null;
  engine: string | null;
};

export type UserVehicle = {
  id: string;
  user_id: string;
  nickname: string | null;
  brand: string;
  model: string;
  generation: string | null;
  year: number | null;
  engine: string | null;
  is_primary: boolean;
  created_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  type: ListingType;
  title: string;
  slug: string;
  description: string | null;
  brand: string;
  model: string;
  generation: string | null;
  year: number | null;
  engine: string | null;
  category: string | null;
  condition: string;
  price: number | null;
  location: string;
  mileage: number | null;
  available_parts: string[] | null;
  reference_code: string | null;
  technical_notes: string | null;
  shipping_available?: boolean;
  pickup_available?: boolean;
  status: ListingStatus;
  hidden: boolean;
  created_at: string;
  updated_at: string;
  listing_images?: ListingImage[];
  listing_compatibilities?: ListingCompatibility[];
  seller?: Seller | null;
  is_demo?: boolean;
};

export type PartRequest = {
  id: string;
  requester_id: string;
  title: string;
  brand: string;
  model: string;
  generation: string | null;
  year: number | null;
  engine: string | null;
  reference_code: string | null;
  location: string;
  notes: string | null;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
  requester?: Seller | null;
};

export type SavedSearch = {
  id: string;
  user_id: string;
  name: string;
  query_params: Record<string, string>;
  alerts_enabled: boolean;
  created_at: string;
  last_checked_at: string | null;
};

export type MarketplaceFilters = {
  q?: string;
  oem?: string;
  brand?: string;
  model?: string;
  year?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
  condition?: string;
  status?: string;
  type?: string;
  sort?: string;
  limit?: number;
};
