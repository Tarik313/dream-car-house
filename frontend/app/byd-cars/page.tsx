import type { Metadata } from "next";
import Link from "next/link";
import { getPublicInventory, getPageSEO, buildMetadataFromSEO } from "@/lib/server/api";
import VehicleCard from "@/components/VehicleCard";

const fallbackMetadata: Metadata = {
  title: "BYD Luxury Electric & Hybrid Vehicles | DREAM CAR HOUSE",
  description:
    "Explore BYD electric and hybrid luxury vehicles in Bangladesh at DREAM CAR HOUSE Kakrail and Gulshan showrooms.",
  alternates: {
    canonical: "https://dreamcarhouse.com/byd-cars/",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("byd-cars");
  return buildMetadataFromSEO(seo, fallbackMetadata);
}

export default async function BydCarsPage() {
  let bydCars: import("@/lib/types").PublicVehicle[] = [];
  try {
    const res = await getPublicInventory({ brand: "BYD" });
    bydCars = res.items;
  } catch (error) {
    console.error("[BydCarsPage] Failed to fetch BYD inventory:", error);
  }

  return (
    <div className="inventory-page-wrap max-w-7xl">
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "#9ca3af" }}>
        <Link href="/" style={{ color: "#d1d5db" }}>Home</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <Link href="/inventory" style={{ color: "#d1d5db" }}>Inventory</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "#ffffff", fontWeight: 600 }}>BYD Vehicles</span>
      </nav>

      <div style={{ marginBottom: "2.5rem" }}>
        <span className="preference-badge" style={{ marginBottom: "0.35rem", display: "inline-block" }}>
          NEW ENERGY LUXURY
        </span>
        <h1 className="section-h2" style={{ marginBottom: "0.5rem" }}>
          BYD Luxury Electric & Hybrid Vehicles
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>
          Experience cutting-edge Blade Battery technology, futuristic cockpits, and sustainable luxury in Dhaka.
        </p>
      </div>

      {bydCars.length > 0 ? (
        <div className="cars-grid-layout">
          {bydCars.map((car) => (
            <VehicleCard key={car.id} car={car} layout="grid" />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "#0d0f12",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "3rem 1.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#d1d5db", fontSize: "1rem", marginBottom: "1.5rem" }}>
            New BYD luxury electric allocations are currently arriving at our Kakrail showroom vault. Connect with our concierge for priority reservations.
          </p>
          <Link href="/inventory" className="consult-primary-btn" style={{ margin: "0 auto" }}>
            <span>Browse All Available Showroom Inventory</span>
          </Link>
        </div>
      )}
    </div>
  );
}
