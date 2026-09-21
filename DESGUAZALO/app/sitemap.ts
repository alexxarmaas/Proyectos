import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: base + "/", changeFrequency: "weekly", priority: 1 },
    { url: base + "/marketplace", changeFrequency: "daily", priority: .9 },
    { url: base + "/se-busca", changeFrequency: "daily", priority: .7 },
    { url: base + "/publicar", changeFrequency: "monthly", priority: .5 }
  ];
}
