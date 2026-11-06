import type { Metadata } from "next";
import Link from "next/link";
import { getPublicInventory, getCategorySEO, buildMetadataFromSEO } from "@/lib/server/api";
import VehicleCard from "@/components/VehicleCard";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCategorySEO("brand-new").catch(() => null);
  const fallback: Metadata = {
    title: "Brand New & Reconditioned Luxury Vehicles | DREAM CAR HOUSE",
    description:
      "Explore factory-fresh, zero-mileage brand new luxury automobiles in Bangladesh at DREAM CAR HOUSE Kakrail and Gulshan showrooms.",
    alternates: {
      canonical: "https://dreamcarhouse.com/cars/brand-new/",
    },
    openGraph: {
      title: "Brand New & Reconditioned Luxury Vehicles | DREAM CAR HOUSE",
      description:
        "Explore factory-fresh, zero-mileage brand new luxury automobiles in Bangladesh.",
      url: "https://dreamcarhouse.com/cars/brand-new/",
      siteName: "DREAM CAR HOUSE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Brand New & Reconditioned Luxury Vehicles | DREAM CAR HOUSE",
      description:
        "Explore factory-fresh, zero-mileage brand new luxury automobiles in Bangladesh.",
    },
  };
  return buildMetadataFromSEO(seo, fallback);
}

export default async function BrandNewCarsPage() {
  let brandNewCars: import("@/lib/types").PublicVehicle[] = [];
  try {
    const res = await getPublicInventory({ type: "BRAND_NEW" });
    brandNewCars = res.items;
  } catch (error) {
    console.error("[BrandNewCarsPage] Failed to fetch inventory:", error);
  }

  return (
    <div className="inventory-page-wrap max-w-7xl">
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "#9ca3af" }}>
        <Link href="/" style={{ color: "#d1d5db" }}>Home</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <Link href="/inventory" style={{ color: "#d1d5db" }}>Inventory</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "#ffffff", fontWeight: 600 }}>Brand New</span>
      </nav>

      <div style={{ marginBottom: "2.5rem" }}>
        <span className="preference-badge" style={{ marginBottom: "0.35rem", display: "inline-block" }}>
          FACTORY ZERO-METER COLLECTION
        </span>
        <h1 className="section-h2" style={{ marginBottom: "0.5rem" }}>
          Brand New & Reconditioned Luxury Vehicles
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>
          Explore our exclusive collection of {brandNewCars.length} untouched zero-meter luxury imports with full official warranty.
        </p>
      </div>

      <div className="cars-grid-layout">
        {brandNewCars.length > 0 ? (
          brandNewCars.map((car) => (
            <VehicleCard key={car.id} car={car} layout="grid" />
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }}>
            No brand new luxury vehicles currently listed.
          </div>
        )}
      </div>
    </div>
  );
}
