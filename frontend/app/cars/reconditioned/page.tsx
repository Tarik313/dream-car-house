import type { Metadata } from "next";
import Link from "next/link";
import { VEHICLE_DATA } from "@/lib/showroomData";
import VehicleCard from "@/components/VehicleCard";

export const metadata: Metadata = {
  title: "Reconditioned Luxury Vehicles | DREAM CAR HOUSE",
  description:
    "Explore auction-grade 5A & certified reconditioned Japanese and European luxury cars in Dhaka at DREAM CAR HOUSE.",
  alternates: {
    canonical: "https://dreamcarhouse.com/cars/reconditioned/",
  },
};

export default function ReconditionedCarsPage() {
  const reconditionedCars = VEHICLE_DATA.filter((c) => c.car_type === "PRE_OWNED");

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
          Explore our certified collection of {reconditionedCars.length} handpicked reconditioned luxury vehicles with authentic auction sheets and verified service history.
        </p>
      </div>

      <div className="cars-grid-layout">
        {reconditionedCars.map((car) => (
          <VehicleCard key={car.id} car={car} layout="grid" />
        ))}
      </div>
    </div>
  );
}

