"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Vehicle, VEHICLE_DATA } from "@/lib/showroomData";
import { PublicVehicle, PublicPreferenceSection } from "@/lib/types";
import VehicleCard from "./VehicleCard";

interface PreferenceSectionProps {
  vehicles?: (PublicVehicle | Vehicle)[];
  sectionData?: PublicPreferenceSection | null;
}

export default function PreferenceSection({
  vehicles,
  sectionData,
}: PreferenceSectionProps = {}) {
  const [activeTab, setActiveTab] = useState<"BRAND_NEW" | "PRE_OWNED" | "RECONDITIONED">("BRAND_NEW");

  const sourceCars = Array.isArray(vehicles) && vehicles.length > 0 ? vehicles : VEHICLE_DATA;

  const brandNewCars = sourceCars.filter((c) => c.car_type === "BRAND_NEW");
  const preOwnedCars = sourceCars.filter((c) => c.car_type === "PRE_OWNED");
  const reconditionedCars = sourceCars.filter(
    (c) =>
      c.car_type === "RECONDITIONED" ||
      (c.condition && c.condition.toUpperCase().includes("RECONDITION"))
  );

  const currentList =
    activeTab === "BRAND_NEW"
      ? brandNewCars
      : activeTab === "PRE_OWNED"
        ? preOwnedCars
        : reconditionedCars;
  const showcaseCars = currentList.slice(0, 3);

  const headingText = sectionData?.heading || "Choose per your preference";

  return (
    <section className="preference-section w-full">
      <div className="luxury-container px-4 sm:px-6 lg:px-8">
        <div className="preference-header-wrap">
          <div>
            <h2 className="section-h2" style={{ margin: 0 }}>
              {headingText}
            </h2>
          </div>

          {/* Segment Switcher Controller (3 tabs: Brand New, Reconditioned, Certified Pre-Owned) */}
          <div className="segment-switcher" role="tablist">
            <button
              id="tab-brand-new"
              className={`segment-btn ${activeTab === "BRAND_NEW" ? "active" : ""}`}
              onClick={() => setActiveTab("BRAND_NEW")}
              role="tab"
              aria-selected={activeTab === "BRAND_NEW"}
            >
              <span className="segment-label">Brand New</span>
              <span className="segment-count" id="count-brand-new">
                {brandNewCars.length}
              </span>
            </button>
            <button
              id="tab-reconditioned"
              className={`segment-btn ${activeTab === "RECONDITIONED" ? "active" : ""}`}
              onClick={() => setActiveTab("RECONDITIONED")}
              role="tab"
              aria-selected={activeTab === "RECONDITIONED"}
            >
              <span className="segment-label">Reconditioned</span>
              <span className="segment-count" id="count-reconditioned">
                {reconditionedCars.length}
              </span>
            </button>
            <button
              id="tab-pre-owned"
              className={`segment-btn ${activeTab === "PRE_OWNED" ? "active" : ""}`}
              onClick={() => setActiveTab("PRE_OWNED")}
              role="tab"
              aria-selected={activeTab === "PRE_OWNED"}
            >
              <span className="segment-label">Certified Pre-Owned</span>
              <span className="segment-count" id="count-pre-owned">
                {preOwnedCars.length}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Vehicle Showcase Grid */}
        <div id="preference-cars-grid" className="preference-showcase-grid">
          {showcaseCars.map((car) => (
            <VehicleCard key={car.id} car={car} layout="grid" />
          ))}
        </div>

        {/* Bottom View All CTA */}
        <div className="preference-bottom-cta">
          <Link
            id="preference-view-all-btn"
            href={`/inventory?type=${activeTab}`}
            className="preference-all-link"
          >
            <span>
              {activeTab === "BRAND_NEW"
                ? `Explore All Brand New Collection (${brandNewCars.length} Units)`
                : activeTab === "PRE_OWNED"
                  ? `Explore All Certified Pre-Owned Collection (${preOwnedCars.length} Units)`
                  : `Explore All Reconditioned Collection (${reconditionedCars.length} Units)`}
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
