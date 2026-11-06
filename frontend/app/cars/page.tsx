import type { Metadata } from "next";
import InventoryClient from "../inventory/InventoryClient";
import {
  getPublicInventory,
  getInventoryFilters,
  getShowroomBranches,
  getCategorySEO,
  buildMetadataFromSEO,
} from "@/lib/server/api";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCategorySEO("cars").catch(() => null);
  const fallback: Metadata = {
    title: "Luxury Vehicles Collection | DREAM CAR HOUSE",
    description:
      "Explore our complete collection of brand new and certified pre-owned luxury vehicles in Bangladesh. Mercedes-Benz, BMW, Lexus, Toyota, Land Rover, and Porsche.",
    alternates: {
      canonical: "https://dreamcarhouse.com/cars/",
    },
    openGraph: {
      title: "Luxury Vehicles Collection | DREAM CAR HOUSE",
      description:
        "Explore our complete collection of brand new and certified pre-owned luxury vehicles in Bangladesh.",
      url: "https://dreamcarhouse.com/cars/",
      siteName: "DREAM CAR HOUSE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Luxury Vehicles Collection | DREAM CAR HOUSE",
      description:
        "Explore our complete collection of brand new and certified pre-owned luxury vehicles in Bangladesh.",
    },
  };
  return buildMetadataFromSEO(seo, fallback);
}

export default async function CarsPage() {
  const [inv, filters, branchList] = await Promise.all([
    getPublicInventory().catch(() => ({ items: [], totalRows: 0, totalPages: 1 })),
    getInventoryFilters().catch(() => ({ brands: [], models: [], bodyStyles: [], colors: [] })),
    getShowroomBranches().catch(() => []),
  ]);

  return (
    <InventoryClient
      initialVehicles={inv.items}
      totalRows={inv.totalRows}
      filterOptions={filters}
      branches={branchList}
    />
  );
}
