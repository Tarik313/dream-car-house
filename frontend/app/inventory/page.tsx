import type { Metadata } from "next";
import InventoryClient from "./InventoryClient";
import {
  getPublicInventory,
  getInventoryFilters,
  getShowroomBranches,
  getSiteSettings,
} from "@/lib/server/api";
import type {
  PublicVehicle,
  PublicInventoryFilterOptions,
  PublicShowroomBranch,
  PublicSiteSettings,
} from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    brand?: string;
    type?: string;
    branch?: string;
    body_style?: string;
    price_range?: string;
    price_min?: string;
    price_max?: string;
    q?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  let siteName = "DREAM CAR HOUSE";
  let siteTagline = "The Pinnacle of Luxury Automobiles";
  let siteWebsite = "https://dreamcarhouse.com";

  try {
    const settings = await getSiteSettings();
    if (settings) {
      siteName = settings.name || siteName;
      siteTagline = settings.tagline || siteTagline;
      siteWebsite = settings.website || siteWebsite;
    }
  } catch {
    // Falls back safely
  }

  let title = "Complete Luxury Vehicle Inventory";
  if (params.brand && params.brand !== "all") {
    title = `${params.brand} Luxury Vehicles`;
  } else if (params.type && params.type !== "all") {
    const typeLabel = params.type === "BRAND_NEW" ? "Brand New" : "Certified Pre-Owned";
    title = `${typeLabel} Luxury Vehicles`;
  }

  const description = `Explore our complete inventory of brand new and certified pre-owned luxury vehicles at ${siteName} in Dhaka, Bangladesh. Browse flagship sedans, performance SUVs, and exotic supercars with transparent specifications and concierge consultation.`;
  const canonicalUrl = `${siteWebsite.replace(/\/$/, "")}/inventory/`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageNum = params.page ? Math.max(1, parseInt(params.page, 10)) : 1;

  let inventoryData: { items: PublicVehicle[]; totalRows: number; totalPages: number } = {
    items: [],
    totalRows: 0,
    totalPages: 1,
  };
  let filterOptions: PublicInventoryFilterOptions = {
    brands: [],
    models: [],
    bodyStyles: [],
    colors: [],
  };
  let branches: PublicShowroomBranch[] = [];
  let settings: PublicSiteSettings | null = null;

  try {
    const [inv, filters, branchList, siteSettings] = await Promise.all([
      getPublicInventory({
        brand: params.brand,
        type: params.type,
        branch: params.branch,
        body_style: params.body_style,
        price_range: params.price_range,
        price_min: params.price_min,
        price_max: params.price_max,
        q: params.q,
        page: pageNum,
      }),
      getInventoryFilters().catch(() => ({ brands: [], models: [], bodyStyles: [], colors: [] })),
      getShowroomBranches().catch(() => []),
      getSiteSettings().catch(() => null),
    ]);
    inventoryData = inv;
    filterOptions = filters;
    branches = branchList;
    settings = siteSettings;
  } catch (error) {
    console.error("[InventoryPage] Server fetch error:", error);
  }

  const siteOrigin = settings?.website || "https://dreamcarhouse.com";

  // Google ItemList JSON-LD Schema for 10000% SEO optimization
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${settings?.name || "DREAM CAR HOUSE"} Luxury Vehicle Inventory`,
    description: `Current luxury automotive stock at ${settings?.name || "DREAM CAR HOUSE"}.`,
    numberOfItems: inventoryData.totalRows,
    itemListElement: inventoryData.items.map((car, index) => ({
      "@type": "ListItem",
      position: (pageNum - 1) * 12 + index + 1,
      item: {
        "@type": "Car",
        name: car.name,
        brand: {
          "@type": "Brand",
          name: car.brand,
        },
        model: car.model,
        vehicleModelDate: car.year,
        vehicleIdentificationNumber: car.registration_number || undefined,
        itemCondition:
          car.car_type === "BRAND_NEW"
            ? "https://schema.org/NewCondition"
            : "https://schema.org/UsedCondition",
        image: car.image,
        url: `${siteOrigin.replace(/\/$/, "")}/cars/${car.slug}`,
        offers: {
          "@type": "Offer",
          price: car.raw_price || undefined,
          priceCurrency: "BDT",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <InventoryClient
        initialVehicles={inventoryData.items}
        totalRows={inventoryData.totalRows}
        totalPages={inventoryData.totalPages}
        currentPage={pageNum}
        filterOptions={filterOptions}
        branches={branches}
        settings={settings || undefined}
        initialParams={{
          brand: params.brand || "all",
          type: params.type || "all",
          branch: params.branch || "all",
          body_style: params.body_style || "all",
          price_range: params.price_range || "all",
          q: params.q || "",
        }}
      />
    </>
  );
}
