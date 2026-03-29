import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/siteUrl";

const PUBLIC_PATHS: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/listings", priority: 0.9 },
  { path: "/arama", priority: 0.85 },
  { path: "/egitim-danismani", priority: 0.8 },
  { path: "/iletisim", priority: 0.6 },
  { path: "/hakkimizda", priority: 0.6 },
  { path: "/gizlilik", priority: 0.4 },
  { path: "/kurumsal-giris", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const now = new Date();
  return PUBLIC_PATHS.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));
}
