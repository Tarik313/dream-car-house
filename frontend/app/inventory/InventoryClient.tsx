"use client";

import Link from "next/link";
import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { VEHICLE_DATA, Vehicle, SHOWROOM_BRANCHES } from "@/lib/showroomData";
import type {
  PublicVehicle,
  PublicInventoryFilterOptions,
  PublicShowroomBranch,
  PublicSiteSettings,
} from "@/lib/types";

interface InventoryClientProps {
  initialVehicles?: PublicVehicle[];
  totalRows?: number;
  totalPages?: number;
  currentPage?: number;
  filterOptions?: PublicInventoryFilterOptions;
  branches?: PublicShowroomBranch[];
  settings?: PublicSiteSettings;
  initialParams?: {
    brand?: string;
    type?: string;
    branch?: string;
    body_style?: string;
    price_range?: string;
    q?: string;
  };
}

const MAX_PRICE_LIMIT = 50000000; // BDT 5 Crore benchmark (matching BEG Autos standard)

function parseVehicleNumericPrice(car: Vehicle | PublicVehicle): number | null {
  if (car.raw_price && typeof car.raw_price === "number") {
    return car.raw_price;
  }
  if (typeof car.price === "number") {
    return car.price;
  }
  if (!car.price || typeof car.price !== "string") return null;
  const s = car.price.trim().toLowerCase();
  if (s.includes("call") || s.includes("upon request") || s === "0") return null;
  const clean = s.replace(/[^0-9.]/g, "");
  const val = parseFloat(clean);
  return isNaN(val) || val <= 0 ? null : val;
}

function formatPriceLakhCrore(amount: number): string {
  if (amount <= 0) return "0";
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `${+cr.toFixed(2)} Cr`;
  }
  const lakh = amount / 100000;
  return `${+lakh.toFixed(1)} Lakh`;
}

function formatPriceRangeLabel(min: number, max: number): string {
  if (min <= 0 && max >= MAX_PRICE_LIMIT) return "All Prices";
  if (min <= 0) return `Under ${formatPriceLakhCrore(max)}`;
  if (max >= MAX_PRICE_LIMIT) return `Above ${formatPriceLakhCrore(min)}`;
  return `BDT ${formatPriceLakhCrore(min)} – ${formatPriceLakhCrore(max)}`;
}

function parsePriceRangeString(str?: string): [number, number] {
  if (!str || str === "all") return [0, MAX_PRICE_LIMIT];
  const s = str.trim().toLowerCase();
  if (s.startsWith("under-")) {
    const val = parseFloat(s.replace("under-", ""));
    return [0, isNaN(val) ? MAX_PRICE_LIMIT : val];
  }
  if (s.endsWith("-plus")) {
    const val = parseFloat(s.replace("-plus", ""));
    return [isNaN(val) ? 0 : val, MAX_PRICE_LIMIT];
  }
  if (s.includes("-")) {
    const [p1, p2] = s.split("-");
    const min = parseFloat(p1);
    const max = parseFloat(p2);
    return [
      isNaN(min) ? 0 : Math.max(0, min),
      isNaN(max) ? MAX_PRICE_LIMIT : Math.min(MAX_PRICE_LIMIT, max),
    ];
  }
  return [0, MAX_PRICE_LIMIT];
}

function serializePriceRange(min: number, max: number): string {
  if (min <= 0 && max >= MAX_PRICE_LIMIT) return "";
  if (min <= 0) return `under-${max}`;
  if (max >= MAX_PRICE_LIMIT) return `${min}-plus`;
  return `${min}-${max}`;
}

const PRICE_PRESETS = [
  { label: "All Prices", min: 0, max: MAX_PRICE_LIMIT },
  { label: "Under 50 Lakh", min: 0, max: 5000000 },
  { label: "50 Lakh – 1 Crore", min: 5000000, max: 10000000 },
  { label: "1 Crore – 2 Crore", min: 10000000, max: 20000000 },
  { label: "2 Crore – 3.5 Crore", min: 20000000, max: 35000000 },
  { label: "Above 3.5 Crore", min: 35000000, max: MAX_PRICE_LIMIT },
];

function InventoryContent({
  initialVehicles = [],
  filterOptions,
  branches = [],
  initialParams,
}: InventoryClientProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(initialParams?.q || "");
  const [selectedBrand, setSelectedBrand] = useState(initialParams?.brand || "all");
  const [selectedType, setSelectedType] = useState(initialParams?.type || "all");
  const [selectedBranch, setSelectedBranch] = useState(initialParams?.branch || "all");

  // Price Filter State
  const initialRange = useMemo(
    () => parsePriceRangeString(initialParams?.price_range || searchParams.get("price_range") || undefined),
    [initialParams?.price_range, searchParams]
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(initialRange);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>(initialRange);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Dynamic screen boundary protection so price popover never bleeds offscreen
  useEffect(() => {
    if (!isPriceOpen || !cardRef.current || !popoverRef.current) return;

    const adjustPosition = () => {
      const card = cardRef.current;
      const container = popoverRef.current;
      if (!card || !container) return;

      const vw = window.innerWidth;

      if (vw <= 640) {
        card.style.left = "0px";
        card.style.right = "0px";
        card.style.width = "100%";
        card.style.maxWidth = "100%";
        return;
      }

      card.style.width = "380px";
      card.style.maxWidth = "calc(100vw - 32px)";

      const containerRect = container.getBoundingClientRect();
      const cardWidth = Math.min(380, vw - 32);

      const spaceOnRight = vw - containerRect.left;
      const spaceOnLeft = containerRect.right;

      if (spaceOnRight < cardWidth + 16 && spaceOnLeft >= cardWidth + 16) {
        card.style.right = "0px";
        card.style.left = "auto";
      } else if (spaceOnLeft < cardWidth + 16 && spaceOnRight >= cardWidth + 16) {
        card.style.left = "0px";
        card.style.right = "auto";
      } else {
        card.style.right = "0px";
        card.style.left = "auto";
      }
    };

    const timer = setTimeout(adjustPosition, 10);
    window.addEventListener("resize", adjustPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", adjustPosition);
    };
  }, [isPriceOpen]);

  const allVehicles = useMemo(() => {
    if (
      initialVehicles &&
      initialVehicles.length > 0 &&
      !initialVehicles.every((v) => v.image?.includes("demo.jpg"))
    ) {
      return initialVehicles;
    }
    return VEHICLE_DATA;
  }, [initialVehicles]);

  // Debounced URL sync for text search so user can freely type spaces without interference
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = query.trim();
      const sp = new URLSearchParams(window.location.search);
      const currentQ = sp.get("q") || "";

      if (trimmed !== currentQ) {
        if (trimmed) {
          sp.set("q", trimmed);
        } else {
          sp.delete("q");
        }
        const qs = sp.toString();
        router.replace(`/inventory${qs ? `?${qs}` : ""}`, { scroll: false });
      }
    }, 380);

    return () => clearTimeout(handler);
  }, [query, router]);

  // Sync with URL query parameters on navigation (without wiping spaces while typing)
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    const typeParam = searchParams.get("type");
    const branchParam = searchParams.get("branch");
    const priceParam = searchParams.get("price_range");
    const qParam = searchParams.get("q");

    if (brandParam) setSelectedBrand(brandParam);
    if (typeParam) setSelectedType(typeParam);
    if (branchParam) setSelectedBranch(branchParam);
    if (qParam !== null && qParam !== query.trim()) {
      setQuery(qParam);
    }
    if (priceParam) {
      const parsed = parsePriceRangeString(priceParam);
      setPriceRange(parsed);
      setTempPriceRange(parsed);
    }
  }, [searchParams]);

  // Click outside listener for price popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPriceOpen(false);
      }
    };
    if (isPriceOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPriceOpen]);

  // Sync URL when filters change
  const syncUrlParams = (updates: {
    q?: string;
    brand?: string;
    type?: string;
    branch?: string;
    price?: [number, number];
  }) => {
    const qVal = updates.q !== undefined ? updates.q : query;
    const brandVal = updates.brand !== undefined ? updates.brand : selectedBrand;
    const typeVal = updates.type !== undefined ? updates.type : selectedType;
    const branchVal = updates.branch !== undefined ? updates.branch : selectedBranch;
    const priceVal = updates.price !== undefined ? updates.price : priceRange;

    const sp = new URLSearchParams();
    if (qVal && qVal.trim()) sp.set("q", qVal.trim());
    if (brandVal && brandVal !== "all") sp.set("brand", brandVal);
    if (typeVal && typeVal !== "all") sp.set("type", typeVal);
    if (branchVal && branchVal !== "all") sp.set("branch", branchVal);
    const pStr = serializePriceRange(priceVal[0], priceVal[1]);
    if (pStr) sp.set("price_range", pStr);

    const qs = sp.toString();
    router.replace(`/inventory${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const isPriceActive = priceRange[0] > 0 || priceRange[1] < MAX_PRICE_LIMIT;

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((car) => {
      // 1. Text search
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesQuery =
          car.name.toLowerCase().includes(q) ||
          car.brand.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          car.year.toString().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Brand filter
      if (selectedBrand !== "all") {
        if (car.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // 3. Type filter
      if (selectedType !== "all") {
        const cType = String(car.car_type || "");
        if (selectedType === "BRAND_NEW") {
          if (cType !== "BRAND_NEW" && cType !== "RECONDITIONED") return false;
        } else if (selectedType === "PRE_OWNED") {
          if (cType !== "PRE_OWNED") return false;
        } else if (cType !== selectedType) {
          return false;
        }
      }

      // 4. Branch filter
      if (selectedBranch !== "all") {
        const cBranch = String(car.branch_id || car.branch?.branch_id || "").toLowerCase();
        if (cBranch !== selectedBranch.toLowerCase()) return false;
      }

      // 5. BEG Autos Price Range Filter
      if (isPriceActive) {
        const numPrice = parseVehicleNumericPrice(car);
        if (numPrice !== null) {
          if (numPrice < priceRange[0] || numPrice > priceRange[1]) {
            return false;
          }
        }
      }

      return true;
    });
  }, [allVehicles, query, selectedBrand, selectedType, selectedBranch, priceRange, isPriceActive]);

  const handleApplyPrice = () => {
    setPriceRange(tempPriceRange);
    setIsPriceOpen(false);
    syncUrlParams({ price: tempPriceRange });
  };

  const handleClearPrice = () => {
    const cleared: [number, number] = [0, MAX_PRICE_LIMIT];
    setTempPriceRange(cleared);
    setPriceRange(cleared);
    setIsPriceOpen(false);
    syncUrlParams({ price: cleared });
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedBrand("all");
    setSelectedType("all");
    setSelectedBranch("all");
    setPriceRange([0, MAX_PRICE_LIMIT]);
    setTempPriceRange([0, MAX_PRICE_LIMIT]);
    setIsPriceOpen(false);
    router.replace("/inventory", { scroll: false });
  };

  // Dual thumb position percentage
  const minPercent = (tempPriceRange[0] / MAX_PRICE_LIMIT) * 100;
  const maxPercent = (tempPriceRange[1] / MAX_PRICE_LIMIT) * 100;

  // Available brands list
  const availableBrands = useMemo(() => {
    if (filterOptions?.brands && filterOptions.brands.length > 0) {
      return filterOptions.brands.map((b) => b.name);
    }
    const unique = Array.from(new Set(allVehicles.map((v) => v.brand))).filter(Boolean);
    return unique.sort();
  }, [filterOptions?.brands, allVehicles]);

  return (
    <div id="view-inventory" className="inventory-page-wrap luxury-container px-4 sm:px-6 lg:px-8">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="section-h2" style={{ marginBottom: "0.5rem" }}>
          Choose per your preference
        </h1>
        <p className="inventory-subtitle" style={{ fontSize: "0.95rem" }}>
          Browse all available luxury vehicles across our Kakrail and Gulshan showrooms.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="cars-filter-row">
        {/* Keyword Search */}
        <input
          type="text"
          id="cars-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="cars-search-input"
          placeholder="Search by brand or model (e.g. Mercedes, Land Cruiser, BMW)..."
        />

        {/* Brand Filter */}
        <select
          id="cars-filter-brand"
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            syncUrlParams({ brand: e.target.value });
          }}
          className="filter-select"
        >
          <option value="all">All Brands ({availableBrands.length})</option>
          {availableBrands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Vehicle Condition Type */}
        <select
          id="cars-filter-type"
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            syncUrlParams({ type: e.target.value });
          }}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="BRAND_NEW">Brand New & Reconditioned</option>
          <option value="PRE_OWNED">Certified Pre-Owned</option>
        </select>

        {/* ================= BEG AUTOS STYLE LUXURY PRICE FILTER ================= */}
        <div className="price-filter-container" ref={popoverRef}>
          <button
            type="button"
            id="cars-filter-price-trigger"
            onClick={() => {
              setTempPriceRange(priceRange);
              setIsPriceOpen((prev) => !prev);
            }}
            className={`price-popover-trigger ${isPriceActive ? "is-active" : ""} ${
              isPriceOpen ? "is-open" : ""
            }`}
            aria-expanded={isPriceOpen}
            aria-haspopup="true"
          >
            <span>
              {isPriceActive ? `Price · ${formatPriceRangeLabel(priceRange[0], priceRange[1])}` : "Price"}
            </span>
            {isPriceActive ? (
              <span className="price-trigger-badge">Filtered</span>
            ) : null}
            <svg
              className="price-trigger-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Luxury Dropdown Popover */}
          {isPriceOpen && (
            <div
              ref={cardRef}
              className="price-popover-card"
              role="dialog"
              aria-label="Price range filter"
            >
              {/* Popover Header */}
              <div className="price-popover-head">
                <span className="price-popover-label">BUDGET & PRICE RANGE</span>
                <span className="price-popover-display">
                  {formatPriceRangeLabel(tempPriceRange[0], tempPriceRange[1])}
                </span>
              </div>

              {/* BEG Autos Quick Preset Brackets */}
              <div className="price-presets-grid">
                {PRICE_PRESETS.map((preset, idx) => {
                  const isSelected =
                    tempPriceRange[0] === preset.min && tempPriceRange[1] === preset.max;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTempPriceRange([preset.min, preset.max])}
                      className={`price-preset-btn ${isSelected ? "is-active" : ""}`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Dual-Thumb Interactive Range Slider */}
              <div className="price-slider-track-wrap">
                <div className="price-slider-base-bar" />
                <div
                  className="price-slider-active-bar"
                  style={{
                    left: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />

                {/* Min Price Slider Thumb */}
                <input
                  type="range"
                  className="beg-range-slider"
                  min={0}
                  max={MAX_PRICE_LIMIT}
                  step={500000} // 5 Lakh increments
                  value={tempPriceRange[0]}
                  aria-label="Minimum price"
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    setTempPriceRange([
                      Math.min(newMin, tempPriceRange[1] - 500000),
                      tempPriceRange[1],
                    ]);
                  }}
                />

                {/* Max Price Slider Thumb */}
                <input
                  type="range"
                  className="beg-range-slider"
                  min={0}
                  max={MAX_PRICE_LIMIT}
                  step={500000} // 5 Lakh increments
                  value={tempPriceRange[1]}
                  aria-label="Maximum price"
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    setTempPriceRange([
                      tempPriceRange[0],
                      Math.max(newMax, tempPriceRange[0] + 500000),
                    ]);
                  }}
                />
              </div>

              <div className="price-slider-markers">
                <span>BDT 0</span>
                <span>BDT 5 Crore+</span>
              </div>

              {/* Popover Action Buttons */}
              <div className="price-popover-actions">
                <button
                  type="button"
                  onClick={handleClearPrice}
                  className="price-popover-clear-btn"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleApplyPrice}
                  className="price-popover-apply-btn"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Showroom Branch Filter */}
        <select
          id="cars-filter-branch"
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value);
            syncUrlParams({ branch: e.target.value });
          }}
          className="filter-select"
        >
          <option value="all">All Showroom Branches</option>
          {branches.length > 0 ? (
            branches.map((br) => (
              <option key={br.branch_id || br.id} value={br.branch_id || br.id}>
                {br.name} ({br.short_name})
              </option>
            ))
          ) : (
            <>
              <option value="kakrail">Kakrail Branch (18, Monsur Ali Soroni)</option>
              <option value="gulshan">Gulshan Branch (House #07, Road #127)</option>
            </>
          )}
        </select>

        {/* Reset All Filters */}
        <button
          type="button"
          onClick={resetFilters}
          className="hero-pill-btn"
          style={{ padding: "0.65rem 1.25rem", fontSize: "0.9rem" }}
        >
          Reset Filters
        </button>
      </div>

      {/* Active Filter Cues / Results Count Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          padding: "0.5rem 0",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#94a3b8",
          fontSize: "0.88rem",
        }}
      >
        <span>
          Showing <strong style={{ color: "#ffffff" }}>{filteredVehicles.length}</strong> available vehicles
        </span>
        {isPriceActive ? (
          <span style={{ color: "#facc15", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span>Price: {formatPriceRangeLabel(priceRange[0], priceRange[1])}</span>
            <button
              type="button"
              onClick={handleClearPrice}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "0 4px",
              }}
              title="Remove price filter"
            >
              ×
            </button>
          </span>
        ) : null}
      </div>

      {/* Cars Grid */}
      <div id="inventory-grid" className="cars-grid-layout">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((car) => {
            const branchId = car.branch_id || car.branch?.branch_id || "kakrail";
            const branch =
              SHOWROOM_BRANCHES[branchId] || SHOWROOM_BRANCHES.kakrail;

            const carSlug = car.slug || String(car.id);
            const numPrice = parseVehicleNumericPrice(car);
            const displayPrice = numPrice
              ? `BDT ${Math.round(numPrice).toLocaleString("en-IN")}`
              : typeof car.price === "string" && car.price.trim()
                ? car.price
                : "Call for Price";

            return (
              <Link
                href={`/cars/${carSlug}`}
                key={car.id}
                className="group inventory-card-box block"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="portrait-image-wrapper">
                  <img src={car.image} alt={car.name} loading="lazy" />
                  <span className="card-branch-tag">{branch.short_name}</span>
                </div>
                <div className="card-car-meta">
                  {car.brand} • {car.year}
                </div>
                <h3 className="card-car-title">{car.name}</h3>
                <div className="card-car-footer">
                  <span className="card-car-mileage">
                    {car.mileage ? String(car.mileage).replace(/km/i, "").trim() + " km" : "—"}
                  </span>
                  <span
                    className="card-car-price"
                    style={{
                      fontWeight: 600,
                      color: "#facc15",
                      fontSize: "0.85rem",
                    }}
                  >
                    {displayPrice}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div
            className="inventory-empty-state"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "4rem 1rem",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              No vehicles found
            </h3>
            <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
              Try adjusting your price range or resetting your search filters.
            </p>
            <button
              type="button"
              className="hero-pill-btn"
              onClick={resetFilters}
              style={{ margin: "0 auto", display: "inline-block" }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryClient(props: InventoryClientProps = {}) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "8rem 1.5rem", textAlign: "center", color: "#9ca3af" }}>
          Loading inventory directory...
        </div>
      }
    >
      <InventoryContent {...props} />
    </Suspense>
  );
}
