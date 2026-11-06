"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import { VEHICLE_DATA, Vehicle } from "@/lib/showroomData";

import type { PublicVehicle } from "@/lib/types";

export default function CompareModal({
  initialVehicles = [],
}: {
  initialVehicles?: (Vehicle | PublicVehicle)[];
} = {}) {
  const { isCompareOpen, closeCompareModal, openCarModal } = useUI();
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    initialVehicles && initialVehicles.length > 0 ? (initialVehicles as Vehicle[]) : VEHICLE_DATA
  );
  const [car1Id, setCar1Id] = useState<number>(() => initialVehicles[0]?.id || VEHICLE_DATA[0]?.id || 1);
  const [car2Id, setCar2Id] = useState<number>(() => initialVehicles[1]?.id || initialVehicles[0]?.id || VEHICLE_DATA[1]?.id || 2);

  React.useEffect(() => {
    if (initialVehicles && initialVehicles.length > 0 && vehicles.length === 0) {
      setVehicles(initialVehicles as Vehicle[]);
      if (initialVehicles[0]) setCar1Id(initialVehicles[0].id);
      if (initialVehicles[1]) setCar2Id(initialVehicles[1].id);
    }
  }, [initialVehicles, vehicles.length]);

  React.useEffect(() => {
    if (isCompareOpen) {
      fetch("/api/v1/inventory/")
        .then((res) => res.json())
        .then((json) => {
          const list = json?.data?.results || json?.data?.items || json?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            const mapped: Vehicle[] = list.map((c: Record<string, unknown>) => {
              const branch = c.branch && typeof c.branch === "object" ? (c.branch as Record<string, unknown>) : null;
              return {
                id: typeof c.id === "number" ? c.id : 0,
                name: String(c.name || ""),
                brand: String(c.brand || ""),
                model: String(c.model_name || c.model || ""),
                year: typeof c.year === "number" ? c.year : 0,
                car_type: c.car_type === "PRE_OWNED" ? "PRE_OWNED" : "BRAND_NEW",
                fuel_type: String(c.fuel_type || ""),
                engine_capacity: c.engine_capacity ? String(c.engine_capacity) : "",
                mileage: c.mileage ? String(c.mileage) : "",
                price: c.price ? String(c.price) : "Call for Price",
                registered: String(c.registered || "Available"),
                branch_id: (branch?.branch_id as "kakrail" | "gulshan") || "",
                branch_name: String(branch?.name || ""),
                branch_address: String(branch?.address || ""),
                image: typeof c.feature_image === "string" ? c.feature_image : "/assets/maybach_hero_poster.jpg",
                images: [],
                description: String(c.description || ""),
                slug: String(c.slug || c.id || ""),
                drivetrain: typeof c.drive_type === "string" ? c.drive_type : undefined,
              };
            });
            setVehicles(mapped);
            if (mapped[0]) setCar1Id(mapped[0].id);
            if (mapped[1]) setCar2Id(mapped[1].id);
            else if (mapped[0]) setCar2Id(mapped[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isCompareOpen]);

  if (!isCompareOpen) return null;

  const car1 = vehicles.find((c) => c.id === car1Id) || vehicles[0];
  const car2 = vehicles.find((c) => c.id === car2Id) || vehicles[1] || vehicles[0];

  if (!car1 || !car2) {
    return (
      <div className="car-modal-backdrop active" onClick={closeCompareModal}>
        <div className="car-modal-box" style={{ maxWidth: "32rem", textAlign: "center", padding: "3rem 1.5rem" }} onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-x" onClick={closeCompareModal} aria-label="Close Vehicle Comparison">&times;</button>
          <p style={{ color: "#9ca3af" }}>Loading showroom inventory for comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="car-modal-backdrop active" onClick={closeCompareModal}>
      <div
        className="car-modal-box"
        style={{ maxWidth: "56rem", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-x"
          onClick={closeCompareModal}
          aria-label="Close Vehicle Comparison"
          title="Close (ESC)"
        >
          &times;
        </button>

        <div className="appointment-modal-head">
          <span className="consult-pill-tag">VEHICLE BENCHMARK COMPARISON</span>
          <h3 className="appointment-modal-title">Compare Luxury Specifications</h3>
          <p className="appointment-modal-sub">
            Side-by-side technical evaluation of premium showroom inventory.
          </p>
        </div>

        {/* Selection Pickers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
              Select Vehicle 01
            </label>
            <select
              value={car1Id}
              onChange={(e) => setCar1Id(Number(e.target.value))}
              className="appt-input appt-select"
              style={{ width: "100%" }}
            >
              {vehicles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.name} ({c.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
              Select Vehicle 02
            </label>
            <select
              value={car2Id}
              onChange={(e) => setCar2Id(Number(e.target.value))}
              className="appt-input appt-select"
              style={{ width: "100%" }}
            >
              {vehicles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.name} ({c.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Showcase Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.88rem",
              color: "#e5e7eb",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", width: "30%" }}>Feature</th>
                <th style={{ padding: "0.75rem 1rem", width: "35%" }}>
                  <div style={{ fontWeight: 700, color: "#ffffff" }}>{car1.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{car1.brand}</div>
                </th>
                <th style={{ padding: "0.75rem 1rem", width: "35%" }}>
                  <div style={{ fontWeight: 700, color: "#ffffff" }}>{car2.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{car2.brand}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Image preview row */}
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Preview</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Image
                    src={car1.image}
                    alt={car1.name}
                    width={220}
                    height={140}
                    style={{ borderRadius: "6px", objectFit: "cover" }}
                  />
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Image
                    src={car2.image}
                    alt={car2.name}
                    width={220}
                    height={140}
                    style={{ borderRadius: "6px", objectFit: "cover" }}
                  />
                </td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Condition</td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                  {car1.car_type === "BRAND_NEW" ? "Brand New (00 km)" : "Certified Pre-Owned"}
                </td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                  {car2.car_type === "BRAND_NEW" ? "Brand New (00 km)" : "Certified Pre-Owned"}
                </td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Model Year</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car1.year}</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car2.year}</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Engine / Technology</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car1.engine_capacity}</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car2.engine_capacity}</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Mileage</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car1.mileage}</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car2.mileage}</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Fuel Architecture</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car1.fuel_type}</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car2.fuel_type}</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Showroom Allocation</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car1.branch_name}</td>
                <td style={{ padding: "0.75rem 1rem" }}>{car2.branch_name}</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Valuation</td>
                <td style={{ padding: "0.75rem 1rem", color: "#d97706", fontWeight: 700 }}>
                  {car1.price === "Call for Price" ? "Price Upon Request" : car1.price}
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "#d97706", fontWeight: 700 }}>
                  {car2.price === "Call for Price" ? "Price Upon Request" : car2.price}
                </td>
              </tr>

              <tr>
                <td style={{ padding: "0.75rem 1rem", color: "#9ca3af" }}>Inspection</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <button
                    type="button"
                    className="pref-inspect-btn"
                    onClick={() => {
                      closeCompareModal();
                      openCarModal(car1);
                    }}
                  >
                    Inspect {car1.name}
                  </button>
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <button
                    type="button"
                    className="pref-inspect-btn"
                    onClick={() => {
                      closeCompareModal();
                      openCarModal(car2);
                    }}
                  >
                    Inspect {car2.name}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
