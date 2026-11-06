import type { Metadata } from "next";
import Link from "next/link";
import { getPublicInventory, getCategorySEO, buildMetadataFromSEO } from "@/lib/server/api";
import VehicleCard from "@/components/VehicleCard";

const fallbackMetadata: Metadata = {
  title: "Certified Pre-Owned Luxury Vehicles | DREAM CAR HOUSE",
  description:
    "Explore 150-point certified pre-owned luxury cars in Dhaka at DREAM CAR HOUSE. Verified service history and showroom-ready condition.",
  alternates: {
    canonical: "https://dreamcarhouse.com/cars/pre-owned/",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCategorySEO("pre-owned");
  return buildMetadataFromSEO(seo, fallbackMetadata);
}

export default async function PreOwnedCarsPage() {
  let preOwnedCars: import("@/lib/types").PublicVehicle[] = [];
  try {
    const res = await getPublicInventory({ type: "PRE_OWNED" });
    preOwnedCars = res.items;
  } catch (error) {
    console.error("[PreOwnedCarsPage] Failed to fetch inventory:", error);
  }

  return (
    <div className="inventory-page-wrap max-w-7xl">
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "#9ca3af" }}>
        <Link href="/" style={{ color: "#d1d5db" }}>Home</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <Link href="/inventory" style={{ color: "#d1d5db" }}>Inventory</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "#ffffff", fontWeight: 600 }}>Pre-Owned</span>
      </nav>

      <div style={{ marginBottom: "2.5rem" }}>
        <span className="preference-badge" style={{ marginBottom: "0.35rem", display: "inline-block" }}>
          150-POINT AUDITED COLLECTION
        </span>
        <h1 className="section-h2" style={{ marginBottom: "0.5rem" }}>
          Certified Pre-Owned Luxury Vehicles
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>
          Explore our certified collection of {preOwnedCars.length} pristine pre-owned luxury vehicles with verified documentation and immediate handover.
        </p>
      </div>

      <div className="cars-grid-layout">
        {preOwnedCars.length > 0 ? (
          preOwnedCars.map((car) => (
            <VehicleCard key={car.id} car={car} layout="grid" />
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }}>
            No certified pre-owned luxury vehicles currently listed.
          </div>
        )}
      </div>
    </div>
  );
}
