import type { Metadata } from "next";
import InventoryClient from "../inventory/InventoryClient";
import {
  getPublicInventory,
  getInventoryFilters,
  getShowroomBranches,
  resolveSeoPageMetadata,
} from "@/lib/server/api";

export async function generateMetadata(): Promise<Metadata> {
  return resolveSeoPageMetadata({
    key: "cars",
    kind: "category",
    fallback: {
      title: "Luxury Vehicles Collection",
      description:
        "Explore our complete collection of brand new and certified pre-owned luxury vehicles in Bangladesh. Mercedes-Benz, BMW, Lexus, Toyota, Land Rover, and Porsche.",
      ogDescription:
        "Explore our complete collection of brand new and certified pre-owned luxury vehicles in Bangladesh.",
      path: "/cars/",
    },
  });
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
