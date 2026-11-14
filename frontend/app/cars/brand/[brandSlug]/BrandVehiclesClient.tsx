"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicBrandSEO, PublicVehicle, PublicSiteSettings } from "@/lib/types";
import VehicleCard from "@/components/VehicleCard";
import { useUI } from "@/lib/UIContext";

interface BrandVehiclesClientProps {
  brandSeo: PublicBrandSEO;
  cars: PublicVehicle[];
  settings?: PublicSiteSettings | null;
}

export default function BrandVehiclesClient({
  brandSeo,
  cars,
  settings,
}: BrandVehiclesClientProps) {
  const { openAppointmentModal } = useUI();
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "year">("featured");

  // Format WhatsApp Link
  const targetPhone = settings?.whatsapp || settings?.hotline || "01615121312";
  let waPhone = targetPhone.replace(/[^0-9]/g, "");
  if (waPhone.startsWith("0")) {
    waPhone = "88" + waPhone;
  } else if (waPhone && !waPhone.startsWith("880") && waPhone.length === 10) {
    waPhone = "880" + waPhone;
  }
  const waMessage = encodeURIComponent(
    `Hello DREAM CAR HOUSE Concierge, I am inquiring about your ${brandSeo.name} vehicle collection and bespoke imports.`
  );
  const whatsappUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

  // Sort Cars dynamically
  const sortedCars = [...cars].sort((a, b) => {
    if (sortBy === "price-desc") {
      const pA = a.raw_price ? parseFloat(a.raw_price) : 0;
      const pB = b.raw_price ? parseFloat(b.raw_price) : 0;
      return pB - pA;
    }
    if (sortBy === "price-asc") {
      const pA = a.raw_price ? parseFloat(a.raw_price) : Infinity;
      const pB = b.raw_price ? parseFloat(b.raw_price) : Infinity;
      return pA - pB;
    }
    if (sortBy === "year") {
      return (b.year || 0) - (a.year || 0);
    }
    return 0; // default featured/natural order
  });

  return (
    <div className="inventory-page-wrap max-w-7xl">
      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.75rem", fontSize: "0.85rem", color: "#9ca3af" }}>
        <Link href="/" style={{ color: "#d1d5db", textDecoration: "none" }}>Home</Link>
        <span style={{ margin: "0 0.5rem", color: "#6b7280" }}>/</span>
        <Link href="/cars/brand/" style={{ color: "#d1d5db", textDecoration: "none" }}>Marques</Link>
        <span style={{ margin: "0 0.5rem", color: "#6b7280" }}>/</span>
        <span style={{ color: "#ffffff", fontWeight: 600 }}>{brandSeo.name}</span>
      </nav>

      {/* 2. Brand Hero & Header Section */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(17, 24, 39, 0.7) 0%, rgba(10, 11, 13, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "2.5rem 2rem",
          marginBottom: "2.5rem",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
          <div style={{ flex: "1 1 500px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.75rem" }}>
              {brandSeo.image && (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <img
                    src={brandSeo.image}
                    alt={brandSeo.logo_alt || `${brandSeo.name} Logo`}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>
              )}
              <span className="preference-badge" style={{ margin: 0 }}>
                {brandSeo.segment ? `${brandSeo.segment.toUpperCase()} MARQUE` : "OFFICIAL MARQUE PORTFOLIO"}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  background: "rgba(255, 255, 255, 0.06)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {cars.length} {cars.length === 1 ? "Vehicle" : "Vehicles"} In Vault
              </span>
            </div>

            <h1 className="section-h2" style={{ marginBottom: "0.75rem", fontSize: "2.25rem", lineHeight: 1.2 }}>
              {brandSeo.h1_title || `${brandSeo.name} Luxury Vehicles in Bangladesh`}
            </h1>

            {brandSeo.short_description ? (
              <div
                dangerouslySetInnerHTML={{ __html: brandSeo.short_description }}
                style={{ color: "#d1d5db", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "780px" }}
              />
            ) : (
              <p style={{ color: "#9ca3af", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "780px" }}>
                Explore official showroom allocations, zero-meter imports, and certified pre-owned {brandSeo.name} motorcars available exclusively through DREAM CAR HOUSE showrooms in Kakrail and Gulshan, Dhaka.
              </p>
            )}
          </div>

          {/* Quick Concierge Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "220px" }}>
            <button
              type="button"
              className="consult-primary-btn"
              onClick={() =>
                openAppointmentModal({
                  carName: cars[0]?.name || `${brandSeo.name} Allocation Inquiry`,
                  carYear: cars[0]?.year,
                })
              }
              style={{ width: "100%", textAlign: "center", justifyContent: "center" }}
            >
              <span>Schedule Private Viewing</span>
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="consult-whatsapp-btn"
              style={{
                width: "100%",
                textAlign: "center",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: "rgba(37, 211, 102, 0.12)",
                color: "#25d366",
                border: "1px solid rgba(37, 211, 102, 0.35)",
                padding: "0.75rem 1.25rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>

        {/* Feature Image Banner (if uploaded in Dashboard) */}
        {brandSeo.feature_image && (
          <div
            style={{
              marginTop: "2rem",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              height: "220px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Image
              src={brandSeo.feature_image}
              alt={brandSeo.feature_image_alt || `${brandSeo.name} Showcase Banner`}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{ objectFit: "cover" }}
              priority
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(10,11,13,0.85) 100%)",
                display: "flex",
                alignItems: "flex-end",
                padding: "1.25rem",
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "#f3f4f6", fontWeight: 600, letterSpacing: "0.05em" }}>
                OFFICIAL {brandSeo.name.toUpperCase()} ATELIER DOSSIER • DHAKA SHOWROOM VAULT
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Filter / Sort Toolbar (when vehicles exist) */}
      {cars.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ color: "#d1d5db", fontSize: "0.9rem" }}>
            Showing <strong>{sortedCars.length}</strong> available {brandSeo.name} {sortedCars.length === 1 ? "specimen" : "specimens"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <label htmlFor="brand-sort-select" style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              Sort by:
            </label>
            <select
              id="brand-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: "#111317",
                color: "#e5e7eb",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                padding: "0.4rem 0.8rem",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="featured">Featured Allocations</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="year">Newest Model Year</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. Vehicles Grid or Bespoke Commissioning State */}
      {sortedCars.length > 0 ? (
        <div className="cars-grid-layout" style={{ marginBottom: "3.5rem" }}>
          {sortedCars.map((car) => (
            <VehicleCard key={car.id} car={car} layout="grid" />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "linear-gradient(180deg, #0e1117 0%, #0a0b0d 100%)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            borderRadius: "14px",
            padding: "3.5rem 2rem",
            textAlign: "center",
            marginBottom: "3.5rem",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 1.5rem",
              background: "rgba(212, 175, 55, 0.1)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d4af37",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>

          <h2 style={{ fontSize: "1.5rem", color: "#ffffff", marginBottom: "0.75rem", fontWeight: 600 }}>
            No Public {brandSeo.name} Allocations Currently on the Floor
          </h2>
          <p
            style={{
              color: "#9ca3af",
              fontSize: "0.95rem",
              maxWidth: "600px",
              margin: "0 auto 2rem",
              lineHeight: 1.6,
            }}
          >
            Due to exceptional demand, our {brandSeo.name} stock frequently sells prior to public catalog publication. Our automotive acquisition atelier procures factory-fresh zero-meter and certified pre-owned {brandSeo.name} specimens on direct private order.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
            <button
              type="button"
              className="consult-primary-btn"
              onClick={() =>
                openAppointmentModal({
                  carName: `Bespoke ${brandSeo.name} Commissioning Request`,
                })
              }
            >
              <span>Commission a {brandSeo.name} Import</span>
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="consult-whatsapp-btn">
              <span>Chat with {brandSeo.name} Specialist</span>
            </a>
            <Link
              href="/inventory"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#e5e7eb",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                background: "rgba(255, 255, 255, 0.05)",
              }}
            >
              Browse Complete Inventory
            </Link>
          </div>
        </div>
      )}

      {/* 5. Detailed Long Description / Marque Dossier (from Dashboard) */}
      {brandSeo.long_description && (
        <div
          style={{
            background: "#0d0f12",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.25rem", color: "#ffffff", fontWeight: 600, margin: 0 }}>
              The {brandSeo.name} Heritage & Acquisition Guide
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Showroom Advisory
            </span>
          </div>

          <div
            style={{
              position: "relative",
              maxHeight: expandedDescription ? "none" : "180px",
              overflow: "hidden",
              transition: "max-height 0.4s ease",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: brandSeo.long_description }}
              style={{ color: "#d1d5db", fontSize: "0.92rem", lineHeight: 1.7 }}
            />
            {!expandedDescription && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "80px",
                  background: "linear-gradient(180deg, rgba(13, 15, 18, 0) 0%, rgba(13, 15, 18, 1) 100%)",
                }}
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => setExpandedDescription(!expandedDescription)}
            style={{
              marginTop: "1rem",
              background: "transparent",
              border: "none",
              color: "#d4af37",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              padding: "0.25rem 0",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span>{expandedDescription ? "Collapse Dossier" : "Read Full Marque Overview"}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: expandedDescription ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}

      {/* 6. Listing Footer Text (Configured in Dashboard) */}
      {brandSeo.listing_footer_text && (
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            color: "#6b7280",
            fontSize: "0.85rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            marginBottom: "2rem",
          }}
        >
          {brandSeo.listing_footer_text}
        </div>
      )}
    </div>
  );
}
