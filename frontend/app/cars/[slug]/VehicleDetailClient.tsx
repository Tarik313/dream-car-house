"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Vehicle, GalleryPhoto } from "@/lib/showroomData";
import { useUI } from "@/lib/UIContext";
import VehicleCard from "@/components/VehicleCard";
import type { PublicSiteSettings } from "@/lib/types";

interface VehicleDetailClientProps {
  car: Vehicle;
  relatedCars: Vehicle[];
  settings?: PublicSiteSettings;
}

function parseNumericPrice(price?: string | number | null): number | null {
  if (!price) return null;
  const s = String(price).trim();
  if (s.toLowerCase().includes("call")) return null;
  const clean = s.replace(/[^0-9.]/g, "");
  const val = parseFloat(clean);
  return isNaN(val) || val <= 0 ? null : val;
}

function formatPriceString(price?: string | number | null, isCallForPrice?: boolean): string {
  if (isCallForPrice || !price) return "Price Upon Request • VIP Consultation";
  const s = String(price).trim();
  if (!s || s.toLowerCase().includes("call") || s === "0") {
    return "Price Upon Request • VIP Consultation";
  }
  let numStr = s;
  if (numStr.toUpperCase().startsWith("BDT")) {
    numStr = numStr.substring(3).trim();
  }
  const num = parseFloat(numStr.replace(/,/g, ""));
  if (!isNaN(num) && num > 0) {
    return `BDT ${Math.round(num).toLocaleString("en-IN")}`;
  }
  return s.toUpperCase().startsWith("BDT") ? s : `BDT ${s}`;
}

export default function VehicleDetailClient({
  car,
  relatedCars,
  settings,
}: VehicleDetailClientProps) {
  const { openAppointmentModal, openGalleryLightbox } = useUI();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // EMI Calculator States
  const numericPrice = useMemo(() => parseNumericPrice(car.price), [car.price]);
  const defaultLoanAmount = numericPrice ? Math.round(numericPrice * 0.7) : 5000000;
  const defaultDownPayment = numericPrice ? Math.round(numericPrice * 0.3) : 2000000;

  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(36);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);

  // Calculate monthly EMI
  const calculatedEmi = useMemo(() => {
    if (!numericPrice) return null;
    const downAmount = Math.round((numericPrice * downPaymentPercent) / 100);
    const principal = numericPrice - downAmount;
    if (principal <= 0) return 0;

    const monthlyRate = interestRate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, loanTenureMonths)) /
      (Math.pow(1 + monthlyRate, loanTenureMonths) - 1);

    return isNaN(emi) ? null : Math.round(emi);
  }, [numericPrice, downPaymentPercent, loanTenureMonths, interestRate]);

  // Gallery list construction
  const galleryList = useMemo(() => {
    if (car.images && car.images.length > 0) {
      return car.images;
    }
    return [
      { url: car.image, caption: "Front 3/4 Exterior Stance", tag: "EXTERIOR" },
      { url: car.image, caption: "Side Aerodynamic Profile", tag: "PROFILE" },
      { url: car.image, caption: "Cockpit & Steering Assembly", tag: "COCKPIT" },
      { url: car.image, caption: "Handcrafted Luxury Cabin", tag: "INTERIOR" },
      { url: car.image, caption: "Alloy Monoblock & Calipers", tag: "WHEELS" },
    ];
  }, [car.images, car.image]);

  const currentHeroImage = galleryList[activeImgIdx] || galleryList[0];

  const branch = car.branch
    ? {
        id: car.branch.branch_id || car.branch_id || "",
        name: car.branch.name || car.branch_name || "",
        short_name: car.branch.short_name || car.branch.name || "",
        tag: car.branch.tag || "Flagship Showroom Allocation",
        address: car.branch.address || car.branch_address || "",
        phone: car.branch.phone || "+880 1615-121312",
        hotline: car.branch.hotline || "+880 1615-121312",
        hours: car.branch.hours || "Saturday – Thursday: 10:00 AM – 9:00 PM",
        map_link: car.branch.map_link || "https://maps.google.com/?q=Kakrail+Dhaka",
      }
    : {
        id: car.branch_id || "kakrail",
        name: car.branch_name || "Kakrail Branch & Showroom",
        short_name: "Kakrail Branch",
        tag: "Main Flagship Showroom",
        address:
          car.branch_address || "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
        phone: "+880 1615-121312",
        hotline: "+880 1615-121312",
        hours: "Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)",
        map_link: "https://maps.google.com/?q=18+Shaheed+Captain+Mansur+Ali+Soroni+Kakrail+Dhaka",
      };

  const isBrandNew = car.car_type === "BRAND_NEW";
  const displayPrice = formatPriceString(car.price, car.is_call_for_price);

  const handleExpandToCinema = (indexToOpen?: number) => {
    const targetIdx = typeof indexToOpen === "number" ? indexToOpen : activeImgIdx;
    const convertedPhotos: GalleryPhoto[] = galleryList.map((img, i) => ({
      id: i + 200,
      title: `${car.name} • ${img.caption || img.tag || "Showroom Angle"}`,
      category: "sedans",
      categoryLabel: car.brand,
      image: img.url,
      desc: car.description,
    }));
    openGalleryLightbox(targetIdx, convertedPhotos);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://dreamcarhouse.com";
    const shareUrl = `${origin}/cars/${car.slug}`;
    const shareTitle = `${car.name} (${car.year}) | DREAM CAR HOUSE`;
    const shareText = `Explore this prestigious ${car.name} (${car.year}) at DREAM CAR HOUSE:`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2400);
      }
    } catch {
      // Ignore
    }
  };

  const waMessage = encodeURIComponent(
    `Hello DREAM CAR HOUSE, I am inquiring about the ${car.name} (${car.year}) allocated at your ${branch.name}. Please share the official spec sheet, availability, and confidential valuation.`
  );
  const cleanDigits = (branch.hotline || branch.phone || settings?.whatsapp || "01615121312").replace(
    /[^0-9]/g,
    ""
  );
  let waPhone = cleanDigits;
  if (waPhone.startsWith("0")) waPhone = "88" + waPhone;
  else if (!waPhone.startsWith("880") && waPhone.length === 10) waPhone = "880" + waPhone;
  const waUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

  return (
    <div className="dch-car-detail-page max-w-7xl">
      {/* 1. Breadcrumbs & Top Navigation */}
      <nav aria-label="Breadcrumb" className="dch-breadcrumbs">
        <Link href="/" className="dch-crumb-link">
          Home
        </Link>
        <span className="dch-crumb-sep">/</span>
        <Link href="/inventory" className="dch-crumb-link">
          Inventory
        </Link>
        <span className="dch-crumb-sep">/</span>
        <span className="dch-crumb-current">{car.name}</span>
      </nav>

      {/* 2. Top Multi-Image Gallery Showcase */}
      <section className="dch-luxury-gallery-showcase" aria-label="Vehicle Photographic Showcase">
        <div className="dch-gallery-mosaic-grid">
          {/* Main Cinema View (Left Column) */}
          <div
            className="dch-gallery-hero-frame group"
            onClick={() => handleExpandToCinema(activeImgIdx)}
            role="button"
            tabIndex={0}
            title="Click to launch high-resolution Cinema Lightbox"
          >
            <Image
              src={currentHeroImage.url}
              alt={car.name}
              fill
              priority
              unoptimized
              className="dch-gallery-hero-img"
            />
            <div className="dch-gallery-img-gradient" />

            {/* Top Left Tag */}
            <div className="dch-gallery-angle-tag">
              <span className="dch-angle-dot" />
              <span>{currentHeroImage.tag || "EXTERIOR ARCHITECTURE"}</span>
            </div>

            {/* Top Right Counter & Expand Control */}
            <div className="dch-gallery-top-controls">
              <span className="dch-photo-counter-badge">
                {activeImgIdx + 1} / {galleryList.length}
              </span>
              <button
                type="button"
                className="dch-cinema-expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandToCinema(activeImgIdx);
                }}
                title="Fullscreen Cinema Inspection"
                aria-label="Fullscreen Cinema Inspection"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            </div>

            {/* Bottom Caption Pill */}
            <div className="dch-gallery-bottom-caption">
              <span>{currentHeroImage.caption || `${car.name} • Official Atelier Portfolio`}</span>
            </div>
          </div>

          {/* Right 2x2 Curated Angles Grid (4 Slots) */}
          <div className="dch-gallery-vignette-grid">
            {galleryList.slice(1, 5).map((img, idx) => {
              const actualIndex = idx + 1;
              const isFourthSlot = idx === 3;
              const hasMorePhotos = galleryList.length > 5;

              return (
                <div
                  key={actualIndex}
                  className={`dch-gallery-vignette-slot ${actualIndex === activeImgIdx ? "is-selected" : ""}`}
                  onClick={() => {
                    if (isFourthSlot && hasMorePhotos) {
                      handleExpandToCinema(actualIndex);
                    } else {
                      setActiveImgIdx(actualIndex);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  title={`View photo: ${img.caption || img.tag}`}
                >
                  <Image
                    src={img.url}
                    alt={img.caption || car.name}
                    fill
                    unoptimized
                    className="dch-vignette-img"
                  />
                  <div className="dch-vignette-gradient" />

                  {/* Tag Pill */}
                  <span className="dch-vignette-tag">{img.tag || `ANGLE 0${actualIndex + 1}`}</span>

                  {/* 4th Slot "+X More Photos" Overlay */}
                  {isFourthSlot && hasMorePhotos ? (
                    <div className="dch-vignette-more-overlay">
                      <div className="dch-more-icon-wrap">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5cf9b" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <span className="dch-more-count">+{galleryList.length - 4} Photos</span>
                      <span className="dch-more-subtext">View Full Gallery</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Horizontal Quick Thumbnail Ribbon */}
        {galleryList.length > 1 && (
          <div className="dch-gallery-rail-wrap">
            <div className="dch-gallery-rail">
              {galleryList.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  className={`dch-rail-thumb-btn ${i === activeImgIdx ? "is-active" : ""}`}
                  onClick={() => setActiveImgIdx(i)}
                  aria-label={`Select angle ${i + 1}`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || car.name}
                    width={90}
                    height={60}
                    unoptimized
                    className="dch-rail-img"
                  />
                  <span className="dch-rail-label">{photo.tag || `Angle ${i + 1}`}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="dch-rail-all-btn"
              onClick={() => handleExpandToCinema(activeImgIdx)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
              </svg>
              <span>Inspect All ({galleryList.length})</span>
            </button>
          </div>
        )}
      </section>

      {/* 3. Below Gallery Main Content & Sticky Pricing Suite */}
      <div className="dch-vehicle-content-grid">
        {/* Left Column: Comprehensive Specifications & Editorial Details (~66%) */}
        <div className="dch-vehicle-main-col">
          {/* Header & Badges */}
          <div className="dch-vehicle-headline-box">
            <div className="dch-headline-pills-row">
              {isBrandNew ? (
                <span className="car-badge-pill pill-brandnew">
                  <span className="pill-dot" />
                  BRAND NEW • ZERO METER
                </span>
              ) : (
                <span className="car-badge-pill pill-preowned">
                  <span className="pill-dot" />
                  CERTIFIED PRE-OWNED
                </span>
              )}

              <span className="dch-showroom-beacon">
                <span className="beacon-pulse" />
                <span>{branch.name.toUpperCase()} • PHYSICAL ALLOCATION</span>
              </span>
            </div>

            <h1 className="dch-car-main-title">{car.name}</h1>

            <p className="dch-car-subtitle">
              {car.brand.toUpperCase()} MARQUE • PRODUCTION YEAR {car.year} • STOCK REFERENCE: DCH-{car.id}
            </p>
          </div>

          {/* Quick Specifications Bar (4 Prominent Luxury Stat Blocks) */}
          <div className="dch-quick-stats-row">
            <div className="dch-quick-stat-card">
              <span className="dch-stat-label">ENGINE DISPLACEMENT</span>
              <span className="dch-stat-val">{car.engine_capacity || "—"}</span>
              <span className="dch-stat-caption">Factory Specification</span>
            </div>

            <div className="dch-quick-stat-card">
              <span className="dch-stat-label">ODOMETER MILEAGE</span>
              <span className="dch-stat-val">{car.mileage || (isBrandNew ? "0 km" : "—")}</span>
              <span className="dch-stat-caption">Verified Genuine</span>
            </div>

            <div className="dch-quick-stat-card">
              <span className="dch-stat-label">FUEL ARCHITECTURE</span>
              <span className="dch-stat-val">{car.fuel_type || "Petrol"}</span>
              <span className="dch-stat-caption">Direct Injection</span>
            </div>

            <div className="dch-quick-stat-card">
              <span className="dch-stat-label">TRANSMISSION</span>
              <span className="dch-stat-val">{car.transmission || "Automatic"}</span>
              <span className="dch-stat-caption">Smooth Shift Tiptronic</span>
            </div>
          </div>

          {/* Comprehensive Specifications Matrix */}
          <section className="dch-specs-matrix-section">
            <div className="dch-section-heading-wrap">
              <span className="dch-section-eyebrow">COMPREHENSIVE TECHNICAL MATRIX</span>
              <h2 className="dch-section-title">Official Showroom Specifications</h2>
            </div>

            <div className="dch-full-specs-table-card">
              <div className="dch-full-specs-grid">
                <div className="dch-spec-cell">
                  <span className="spec-label">Brand Marque</span>
                  <span className="spec-value">{car.brand}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Model Line</span>
                  <span className="spec-value">{car.model || car.name}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Production Year</span>
                  <span className="spec-value">{car.year}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Registration / Papers</span>
                  <span className="spec-value">
                    {car.registration_number || (isBrandNew ? "Unregistered Direct Import" : "Dhaka Metro Registered")}
                  </span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Condition Grade</span>
                  <span className="spec-value highlight-gold">
                    {isBrandNew ? "Brand New (Zero Meter)" : (car.condition === "NEW" ? "Like New Condition" : "Certified Pre-Owned")}
                  </span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Engine Displacement</span>
                  <span className="spec-value">{car.engine_capacity || "—"}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Transmission</span>
                  <span className="spec-value">{car.transmission || "Automatic Tiptronic"}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Fuel Architecture</span>
                  <span className="spec-value">{car.fuel_type || "Petrol"}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Drivetrain / Drive Type</span>
                  <span className="spec-value">{car.drivetrain || "All-Wheel Drive (AWD)"}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Wheel & Alloy Size</span>
                  <span className="spec-value">{car.wheel_base || "19–21 Inch Forged Diamond-Cut"}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Exterior Finish / Color</span>
                  <span className="spec-value">{car.color || "Obsidian Metallic Paint"}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Body Architecture</span>
                  <span className="spec-value">{car.body_style || "Luxury SUV"}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Recorded Odometer</span>
                  <span className="spec-value">{car.mileage || (isBrandNew ? "0 km (Untouched)" : "Verified Genuine")}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Auction Sheet / Manifest</span>
                  <span className="spec-value highlight-green">
                    {isBrandNew ? "Factory Manifest Verified (S Grade)" : "Grade 4.5/5.0 Verified Auction Sheet"}
                  </span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Showroom Allocation</span>
                  <span className="spec-value">{branch.name}</span>
                </div>

                <div className="dch-spec-cell">
                  <span className="spec-label">Physical Availability</span>
                  <span className="spec-value highlight-green">
                    {car.registered || "In Showroom Vault • Ready for Viewing"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Auction Sheet & Quality Provenance Trust Card */}
          <section className="dch-auction-sheet-section">
            <div className="dch-auction-sheet-card">
              <div className="dch-auction-left">
                <div className="dch-auction-badge-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e5cf9b" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <div className="dch-auction-title-row">
                    <h3 className="dch-auction-heading">Verified Auction Sheet & Technical Inspection</h3>
                    <span className="dch-auction-score-pill">
                      {isBrandNew ? "GRADE S • 100% FACTORY FRESH" : "GRADE 4.5 / 5.0 • POINT VERIFIED"}
                    </span>
                  </div>
                  <p className="dch-auction-desc">
                    Every vehicle at DREAM CAR HOUSE comes with authentic international auction manifest verification, genuine odometer certification, and our comprehensive 150+ point physical inspection report.
                  </p>
                </div>
              </div>

              <div className="dch-auction-actions">
                <a
                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                    `Hello DREAM CAR HOUSE, I would like to inspect the official Verified Auction Sheet and 150+ Point Inspection Report for the ${car.name} (${car.year}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dch-auction-req-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>Request Auction Sheet (PDF)</span>
                </a>
              </div>
            </div>
          </section>

          {/* Editorial Description & Atelier Story */}
          <section className="dch-editorial-section">
            <div className="dch-section-heading-wrap">
              <span className="dch-section-eyebrow">CURATED PROVENANCE</span>
              <h2 className="dch-section-title">Atelier Overview & Vehicle Story</h2>
            </div>
            <div className="dch-editorial-card">
              {car.description && car.description.includes("<") && car.description.includes(">") ? (
                <div
                  dangerouslySetInnerHTML={{ __html: car.description }}
                  className="dch-editorial-body"
                />
              ) : (
                <p className="dch-editorial-body">{car.description}</p>
              )}
            </div>
          </section>

          {/* Video Walkaround Presentation */}
          {car.youtube && (
            <section className="dch-video-walkaround-section">
              <div className="dch-section-heading-wrap">
                <span className="dch-section-eyebrow">CINEMATIC PRESENTATION</span>
                <h2 className="dch-section-title">Official Video Walkaround</h2>
              </div>
              <div className="dch-video-container">
                <iframe
                  src={
                    car.youtube.includes("watch?v=")
                      ? car.youtube.replace("watch?v=", "embed/")
                      : car.youtube.includes("youtu.be/")
                      ? car.youtube.replace("youtu.be/", "www.youtube.com/embed/")
                      : car.youtube
                  }
                  title={`${car.name} Video Walkaround`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="dch-video-frame"
                />
              </div>
            </section>
          )}

          {/* Interactive Financing & EMI Calculator */}
          <section className="dch-financing-calculator-section" id="financing-calculator">
            <div className="dch-section-heading-wrap">
              <span className="dch-section-eyebrow">FINANCING & AUTO LOAN ADVISORY</span>
              <h2 className="dch-section-title">Estimated Monthly Installment (EMI)</h2>
            </div>

            <div className="dch-calculator-card">
              <div className="dch-calc-inputs-grid">
                {/* Down Payment Slider */}
                <div className="dch-calc-control-group">
                  <div className="dch-calc-label-row">
                    <label htmlFor="down-payment-range">Down Payment</label>
                    <span className="dch-calc-value-badge">{downPaymentPercent}%</span>
                  </div>
                  <input
                    id="down-payment-range"
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(parseInt(e.target.value, 10))}
                    className="dch-slider"
                  />
                  <div className="dch-calc-sub-amount">
                    {numericPrice
                      ? `~BDT ${Math.round((numericPrice * downPaymentPercent) / 100).toLocaleString("en-IN")}`
                      : "Customizable upon private negotiation"}
                  </div>
                </div>

                {/* Tenure Selector */}
                <div className="dch-calc-control-group">
                  <div className="dch-calc-label-row">
                    <span>Loan Duration</span>
                    <span className="dch-calc-value-badge">{loanTenureMonths} Months ({loanTenureMonths / 12} Yrs)</span>
                  </div>
                  <div className="dch-tenure-pills-row">
                    {[12, 24, 36, 48, 60].map((months) => (
                      <button
                        key={months}
                        type="button"
                        className={`dch-tenure-pill ${loanTenureMonths === months ? "is-selected" : ""}`}
                        onClick={() => setLoanTenureMonths(months)}
                      >
                        {months}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="dch-calc-control-group">
                  <div className="dch-calc-label-row">
                    <span>Bank Interest Rate</span>
                    <span className="dch-calc-value-badge">{interestRate}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="14"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="dch-slider"
                  />
                  <div className="dch-calc-sub-amount">Standard Bangladesh Auto Loan Benchmark</div>
                </div>
              </div>

              {/* Calculated EMI Display */}
              <div className="dch-calc-result-box">
                <div className="dch-result-meta">
                  <span className="dch-result-label">ESTIMATED MONTHLY INSTALLMENT</span>
                  <div className="dch-result-emi-val">
                    {calculatedEmi ? (
                      <>
                        <span className="emi-currency">BDT</span> {calculatedEmi.toLocaleString("en-IN")}
                        <span className="emi-period"> / month</span>
                      </>
                    ) : (
                      "Contact Financial Concierge"
                    )}
                  </div>
                  <p className="dch-result-disclaimer">
                    Calculated for standard banking partner allocations. Subject to credit verification.
                  </p>
                </div>

                <button
                  type="button"
                  className="dch-calc-apply-btn"
                  onClick={() =>
                    openAppointmentModal({
                      carName: car.name,
                      carYear: car.year,
                      branchId: car.branch_id,
                    })
                  }
                >
                  <span>Apply for Loan Advisory</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Showroom Physical Branch Allocation Box */}
          <section className="dch-branch-visiting-section">
            <div className="dch-branch-card">
              <div className="dch-branch-card-header">
                <div className="dch-branch-pin-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <span className="dch-branch-eyebrow">PHYSICAL SHOWROOM ALLOCATION</span>
                  <h3 className="dch-branch-title">{branch.name}</h3>
                  <p className="dch-branch-addr">{branch.address}</p>
                </div>
              </div>

              <div className="dch-branch-card-footer">
                <div className="dch-branch-hours-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{branch.hours}</span>
                </div>

                {branch.map_link && (
                  <a
                    href={branch.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dch-branch-directions-link"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                    <span>Get Showroom Directions</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Pricing & Concierge Action Sidebar (~34%) */}
        <aside className="dch-vehicle-sidebar-col">
          <div className="dch-sticky-pricing-card">
            {/* Showroom Valuation Box */}
            <div className="dch-sidebar-pricing-box">
              <div className="dch-valuation-head-row">
                <span className="dch-pricing-eyebrow">SHOWROOM VALUATION</span>
                <button
                  type="button"
                  onClick={handleShare}
                  className={`dch-sidebar-share-btn ${isCopied ? "is-copied" : ""}`}
                  title="Share this vehicle"
                  aria-label="Share this vehicle"
                >
                  {isCopied ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bespoke Royal Price Typography */}
              <div className="dch-sidebar-price-amount">
                {displayPrice}
              </div>

              {calculatedEmi ? (
                <div className="dch-sidebar-emi-cue">
                  <span className="dch-emi-badge">EST. FINANCING</span>
                  <span>From ~BDT {calculatedEmi.toLocaleString("en-IN")}/mo</span>
                </div>
              ) : null}
            </div>

            {/* Concierge VIP Action Suite */}
            <div className="dch-sidebar-actions-suite">
              {/* Primary: Schedule Private Viewing */}
              <button
                type="button"
                className="dch-sidebar-vip-btn dch-btn-gold"
                onClick={() =>
                  openAppointmentModal({
                    carName: car.name,
                    carYear: car.year,
                    branchId: car.branch_id,
                  })
                }
              >
                <div className="dch-vip-btn-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="dch-vip-btn-text">
                  <span className="btn-main-title">BOOK PRIVATE VIEWING</span>
                  <span className="btn-sub-caption">Showroom Appointment</span>
                </div>
              </button>

              {/* Secondary: Inquire on WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dch-sidebar-vip-btn dch-btn-whatsapp"
              >
                <div className="dch-vip-btn-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.838.497 3.633 1.442 5.213L2 22l4.908-1.408c1.517.854 3.238 1.439 5.123 1.439 5.535 0 10.031-4.496 10.031-10.031C22.062 6.496 17.566 2 12.031 2zm5.795 14.285c-.244.686-1.42 1.321-1.956 1.378-.536.057-1.196.229-3.957-.869-3.327-1.323-5.46-4.717-5.626-4.94-.166-.223-1.352-1.8-1.352-3.433 0-1.633.856-2.438 1.161-2.771.305-.333.666-.416.888-.416.222 0 .444.002.638.012.206.01.482-.078.754.577.28.674.957 2.33.1042 2.502.085.172.142.374.028.6-.114.226-.172.367-.342.566-.17.199-.358.444-.512.597-.171.171-.349.356-.15.698.199.342.887 1.464 1.902 2.37 1.309 1.168 2.413 1.53 2.756 1.701.343.171.543.143.744-.086.2-.229.856-.998 1.085-1.341.229-.343.457-.286.771-.171.314.114 1.996.941 2.339 1.112.343.171.571.257.657.4.086.143.086.828-.158 1.514z" />
                  </svg>
                </div>
                <div className="dch-vip-btn-text">
                  <span className="btn-main-title">INQUIRE ON WHATSAPP</span>
                  <span className="btn-sub-caption">Direct Concierge Specialist</span>
                </div>
              </a>

              {/* Tertiary: Direct Call to Showroom Hotline */}
              <a
                href={`tel:${cleanDigits || "01615121312"}`}
                className="dch-sidebar-vip-btn dch-btn-outline"
              >
                <div className="dch-vip-btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="dch-vip-btn-text">
                  <span className="btn-main-title">CALL SHOWROOM HOTLINE</span>
                  <span className="btn-sub-caption">+880 1615-121312</span>
                </div>
              </a>
            </div>

            {/* Trust Assurances */}
            <div className="dch-sidebar-trust-box">
              <div className="dch-trust-point">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>150+ Multi-Point Inspection Passed</span>
              </div>
              <div className="dch-trust-point">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
                <span>100% Verified Authentic Odometer</span>
              </div>
              <div className="dch-trust-point">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Full Official Legal Paperwork Handover</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 4. Complementary & Related Vehicles */}
      {relatedCars.length > 0 && (
        <section className="dch-related-automobiles-section">
          <div className="dch-section-heading-wrap">
            <span className="dch-section-eyebrow">CURATED RECOMMENDATIONS</span>
            <h2 className="dch-section-title">Similar Luxury Automobiles</h2>
          </div>

          <div className="preference-showcase-grid">
            {relatedCars.map((relCar) => (
              <VehicleCard key={relCar.id} car={relCar} layout="grid" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
