export type ListingType = "part" | "vehicle";
export type ListingStatus = "available" | "reserved" | "sold";

export type Seller = {
  id: string;
  display_name: string;
  location: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  created_at?: string;
};

export type ListingImage = {
  id?: string;
  public_url: string;
  position: number;
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
  status: ListingStatus;
  hidden: boolean;
  created_at: string;
  updated_at: string;
  listing_images?: ListingImage[];
  seller?: Seller | null;
};

export type MarketplaceFilters = {
  q?: string;
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
  limit?: number;
};
