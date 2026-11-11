import { MetadataRoute } from "next";
import { getPublicInventory, getAllPageSEO, getAllCategorySEO, getAllPublicBrands } from "@/lib/server/api";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://dreamcarhouse.com";
  const now = new Date();

  // 1. Fetch dynamic SEO configurations
  const [pageConfigs, categoryConfigs] = await Promise.all([
    getAllPageSEO().catch(() => []),
    getAllCategorySEO().catch(() => []),
  ]);

  const pageConfigMap = new Map(pageConfigs.map((c) => [c.page, c]));
  const categoryConfigMap = new Map(categoryConfigs.map((c) => [c.page, c]));

  // Helper to check if a route is allowed in sitemap
  const isIndexable = (
    cfg: { visibility?: string | null; robots?: string | null } | undefined
  ) => {
    if (!cfg) return true;
    if (cfg.visibility === "HIDDEN") return false;
    if (cfg.robots && cfg.robots.includes("noindex")) return false;
    return true;
  };

  const rawStaticPages = [
    {
      url: `${baseUrl}/`,
      pageKey: "home",
      type: "page",
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/inventory/`,
      pageKey: "cars",
      type: "category",
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cars/`,
      pageKey: "cars",
      type: "category",
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cars/brand-new/`,
      pageKey: "brand-new",
      type: "category",
      changeFrequency: "daily" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/cars/pre-owned/`,
      pageKey: "pre-owned",
      type: "category",
      changeFrequency: "daily" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/cars/brand/`,
      pageKey: "brands",
      type: "category",
      changeFrequency: "daily" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/gallery/`,
      pageKey: "gallery",
      type: "page",
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sell/`,
      pageKey: "sell",
      type: "page",
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about/`,
      pageKey: "about",
      type: "page",
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact/`,
      pageKey: "contact",
      type: "page",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/byd-cars/`,
      pageKey: "byd-cars",
      type: "page",
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ];

  const staticPages: MetadataRoute.Sitemap = rawStaticPages
    .filter((entry) => {
      const cfg =
        entry.type === "page"
          ? pageConfigMap.get(entry.pageKey)
          : categoryConfigMap.get(entry.pageKey);
      return isIndexable(cfg);
    })
    .map((entry) => ({
      url: entry.url,
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    }));

  let vehiclePages: MetadataRoute.Sitemap = [];
  try {
    const res = await getPublicInventory();
    vehiclePages = res.items.map((car) => ({
      url: `${baseUrl}/cars/${car.slug}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch {
    vehiclePages = [];
  }

  let brandPages: MetadataRoute.Sitemap = [];
  try {
    const brands = await getAllPublicBrands();
    brandPages = brands
      .filter((b) => b.slug)
      .map((b) => ({
        url: `${baseUrl}/cars/brand/${b.slug}/`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    brandPages = [];
  }

  return [...staticPages, ...vehiclePages, ...brandPages];
}
