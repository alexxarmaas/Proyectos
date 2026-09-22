import { getBrowserSupabase } from "./supabase";

export type ProductEventName =
  | "search"
  | "listing_open"
  | "favorite"
  | "contact_whatsapp"
  | "contact_phone"
  | "publish_started"
  | "publish_completed"
  | "request_created"
  | "pro_csv_import";

type TrackOptions = {
  targetId?: string | null;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

export async function trackEvent(name: ProductEventName, options: TrackOptions = {}) {
  if (typeof window === "undefined") return;

  const supabase = getBrowserSupabase();
  if (!supabase) return;

  try {
    const { data } = await supabase.auth.getSession();
    const cleanMetadata = Object.fromEntries(
      Object.entries(options.metadata ?? {}).filter(([, value]) => value !== undefined)
    );

    await supabase.from("product_events").insert({
      user_id: data.session?.user.id ?? null,
      name,
      path: window.location.pathname + window.location.search,
      target_id: options.targetId ?? null,
      metadata: cleanMetadata,
    });
  } catch {
    // Product analytics must never interrupt the user flow.
  }
}
