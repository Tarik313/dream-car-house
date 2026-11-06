import type { Metadata } from "next";
import Link from "next/link";
import { getPublicInventory, getCategorySEO, buildMetadataFromSEO } from "@/lib/server/api";
import VehicleCard from "@/components/VehicleCard";
import type { PublicVehicle } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCategorySEO("reconditioned").catch(() => null);
  const fallback: Metadata = {
    title: "Reconditioned Luxury Vehicles | DREAM CAR HOUSE",
    description:
      "Explore auction-grade 5A & certified reconditioned Japanese and European luxury cars in Dhaka at DREAM CAR HOUSE.",
    alternates: {
      canonical: "https://dreamcarhouse.com/cars/reconditioned/",
    },
  };
  return buildMetadataFromSEO(seo, fallback);
}

export default async function ReconditionedCarsPage() {
  let reconditionedCars: PublicVehicle[] = [];
  try {
    const res = await getPublicInventory({ type: "RECONDITIONED" });
    reconditionedCars = res.items;
    // If no explicit RECONDITIONED tag, also query PRE_OWNED or show all verified imports
    if (reconditionedCars.length === 0) {
      const fallbackRes = await getPublicInventory({ type: "PRE_OWNED" });
      reconditionedCars = fallbackRes.items;
    }
  } catch (err) {
    console.error("[ReconditionedCarsPage] Error fetching inventory:", err);
  }

  return (
    <div className="inventory-page-wrap max-w-7xl">
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "#9ca3af" }}>
        <Link href="/" style={{ color: "#d1d5db" }}>Home</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <Link href="/inventory" style={{ color: "#d1d5db" }}>Inventory</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "#ffffff", fontWeight: 600 }}>Reconditioned</span>
      </nav>

      <div style={{ marginBottom: "2.5rem" }}>
        <span className="preference-badge" style={{ marginBottom: "0.35rem", display: "inline-block" }}>
          AUCTION GRADE 5A & 4.5 CERTIFIED
        </span>
        <h1 className="section-h2" style={{ marginBottom: "0.5rem" }}>
          Reconditioned Luxury Vehicles
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>
          Explore our certified collection of {reconditionedCars.length} handpicked reconditioned luxury vehicles with authentic auction sheets and verified provenance.
        </p>
      </div>

      <div className="cars-grid-layout">
        {reconditionedCars.length > 0 ? (
          reconditionedCars.map((car) => (
            <VehicleCard key={car.id} car={car} layout="grid" />
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }}>
            No reconditioned luxury vehicles currently listed.
          </div>
        )}
      </div>
    </div>
  );
}
