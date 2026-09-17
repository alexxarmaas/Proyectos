import type { MetadataRoute } from "next";
import { getListings } from "@/lib/data";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const listings = await getListings({ status: "available", limit: 100 });
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/marketplace`, changeFrequency: "hourly", priority: 0.9 },
    ...listings.map((x) => ({ url: `${base}/pieza/${x.slug}`, lastModified: new Date(x.updated_at), changeFrequency: "daily" as const, priority: 0.8 }))
  ];
}
