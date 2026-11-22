"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Vehicle, GalleryPhoto } from "@/lib/showroomData";
import { useUI } from "@/lib/UIContext";
import VehicleCard from "@/components/VehicleCard";
import type { PublicSiteSettings } from "@/lib/types";
import { submitInventoryQuoteAction } from "@/app/actions/quote";
import { formatVehiclePrice, parseVehiclePriceNumber } from "@/lib/utils";

interface VehicleDetailClientProps {
  car: Vehicle;
  relatedCars: Vehicle[];
  settings?: PublicSiteSettings;
}

function getYoutubeEmbedUrl(youtubeUrl?: string): string {
  if (!youtubeUrl || !youtubeUrl.trim() || !youtubeUrl.includes("http")) {
    // Official cinematic 4K luxury automobile walkaround showcase
    return "https://www.youtube-nocookie.com/embed/1F3hm6MfR1k?rel=0";
  }
  const url = youtubeUrl.trim();
  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1]?.split("&")[0];
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  }
  if (url.includes("embed/")) {
    return url;
  }
  return "https://www.youtube-nocookie.com/embed/1F3hm6MfR1k?rel=0";
}

export default function VehicleDetailClient({
  car,
  relatedCars,
  settings,
}: VehicleDetailClientProps) {
  const { openAppointmentModal, openGalleryLightbox } = useUI();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Quote Request States
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quotePending, setQuotePending] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quotePending) return;
    setQuoteError("");
    setQuotePending(true);
    try {
      const res = await submitInventoryQuoteAction({
        carId: car.id,
        name: quoteName,
        email: quoteEmail,
        phone: quotePhone,
      });
      if (res.ok) {
        setQuoteSuccess(true);
      } else {
        setQuoteError(res.error || "Unable to submit quote request. Please try again.");
      }
    } catch {
      setQuoteError("An unexpected error occurred. Please contact us directly.");
    } finally {
      setQuotePending(false);
    }
  };

  // EMI Calculator States
  const numericPrice = useMemo(
    () => parseVehiclePriceNumber(car.price, car.is_call_for_price),
    [car.price, car.is_call_for_price]
  );

  const [customPrice, setCustomPrice] = useState<number>(() => {
    return parseVehiclePriceNumber(car.price, car.is_call_for_price) || 5000000;
  });
  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(36);
  const [interestRate, setInterestRate] = useState<number>(9.5);

  // Sync customPrice if car price loads/changes
  useEffect(() => {
    if (numericPrice && customPrice === 5000000) {
      setCustomPrice(numericPrice);
    }
  }, [numericPrice, customPrice]);

  // Calculate monthly EMI, Total Repayment, and Total Extra Interest
  const { calculatedEmi, totalPayment, totalInterest } = useMemo(() => {
    const principal = customPrice > 0 ? customPrice : 0;
    const months = loanTenureMonths > 0 ? loanTenureMonths : 1;

    if (principal <= 0) {
      return { calculatedEmi: 0, totalPayment: 0, totalInterest: 0 };
    }

    if (interestRate <= 0) {
      const emi = Math.round(principal / months);
      return {
        calculatedEmi: emi,
        totalPayment: principal,
        totalInterest: 0,
      };
    }

    const monthlyRate = interestRate / 12 / 100;
    const emiExact =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    if (isNaN(emiExact) || !isFinite(emiExact)) {
      return { calculatedEmi: 0, totalPayment: 0, totalInterest: 0 };
    }

    const emi = Math.round(emiExact);
    const totalPay = Math.round(emi * months);
    const totalExtra = Math.max(0, totalPay - principal);

    return {
      calculatedEmi: emi,
      totalPayment: totalPay,
      totalInterest: totalExtra,
    };
  }, [customPrice, loanTenureMonths, interestRate]);

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
        hours: car.branch.hours || "Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)",
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
        hours: "Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)",
        map_link: "https://maps.google.com/?q=18+Shaheed+Captain+Mansur+Ali+Soroni+Kakrail+Dhaka",
      };

  const isBrandNew = car.car_type === "BRAND_NEW";
  const isElectric = Boolean(
    (car.fuel_type && car.fuel_type.toUpperCase().includes("ELECTRIC")) ||
    (car.engine_capacity && (car.engine_capacity.toLowerCase().includes("kwh") || car.engine_capacity.toLowerCase().includes("electric"))) ||
    (car.brand && car.brand.toUpperCase() === "BYD") ||
    (car.name && (
      car.name.toLowerCase().includes("g 580") ||
      car.name.toLowerCase().includes("g580") ||
      car.name.toLowerCase().includes("eqs") ||
      car.name.toLowerCase().includes("eqe") ||
      car.name.toLowerCase().includes("taycan") ||
      car.name.toLowerCase().includes("tesla") ||
      car.name.toLowerCase().includes("electric")
    ))
  );

  const evBattery = useMemo(() => {
    if (!isElectric) return car.engine_capacity || "—";
    if (car.engine_capacity && !car.engine_capacity.toLowerCase().includes("cc") && car.engine_capacity !== "0") {
      return car.engine_capacity;
    }
    const nameLower = (car.name || "").toLowerCase();
    if (nameLower.includes("g 580") || nameLower.includes("g580")) return "116 kWh";
    if (nameLower.includes("eqs")) return "108 kWh";
    if (nameLower.includes("eqe")) return "90 kWh";
    if (nameLower.includes("taycan")) return "93.4 kWh";
    if (nameLower.includes("seal")) return "82.5 kWh";
    if (nameLower.includes("atto")) return "60.4 kWh";
    if (nameLower.includes("model s") || nameLower.includes("model x")) return "100 kWh";
    if (nameLower.includes("model 3") || nameLower.includes("model y")) return "75 kWh";
    return car.engine_capacity || "EV Battery";
  }, [isElectric, car.engine_capacity, car.name]);

  const evRange = useMemo(() => {
    if (!isElectric) return car.fuel_type || "Petrol";
    if (car.fuel_type && (car.fuel_type.toLowerCase().includes("km") || car.fuel_type.toLowerCase().includes("wltp") || car.fuel_type.toLowerCase().includes("range"))) {
      return car.fuel_type;
    }
    if (car.drivetrain && (car.drivetrain.toLowerCase().includes("km") || car.drivetrain.toLowerCase().includes("wltp"))) {
      return car.drivetrain;
    }
    const nameLower = (car.name || "").toLowerCase();
    if (nameLower.includes("g 580") || nameLower.includes("g580")) return "473 km (WLTP)";
    if (nameLower.includes("eqs")) return "650 km (WLTP)";
    if (nameLower.includes("eqe")) return "590 km (WLTP)";
    if (nameLower.includes("taycan")) return "505 km (WLTP)";
    if (nameLower.includes("seal")) return "570 km (NEDC)";
    if (nameLower.includes("atto") || nameLower.includes("song")) return "420 km (NEDC)";
    if (nameLower.includes("model s")) return "652 km (EPA)";
    if (nameLower.includes("model x")) return "543 km (EPA)";
    if (nameLower.includes("model 3")) return "513 km (WLTP)";
    if (nameLower.includes("model y")) return "533 km (WLTP)";
    return "450+ km (WLTP)";
  }, [isElectric, car.fuel_type, car.drivetrain, car.name]);
  const displayPrice = formatVehiclePrice(
    car.price,
    car.is_call_for_price,
    "Price Upon Request • VIP Consultation"
  );

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
    <div className="dch-car-detail-page luxury-container">
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

      {/* 2. Symmetrical 2 - 1 - 2 Gallery Stage (Clean, Zero Text Plastered on Photos) */}
      <section className="dch-luxury-gallery-showcase" aria-label="Vehicle Photographic Showcase">
        {galleryList.length >= 5 ? (
          <div className="dch-gallery-symmetrical-grid">
            {/* Slot Left 1 (Left Top) */}
            <div
              className={`dch-symm-slot dch-symm-slot-left-1 ${activeImgIdx === 1 ? "is-selected" : ""}`}
              onClick={() => setActiveImgIdx(1)}
              role="button"
              tabIndex={0}
              title="View angle 2"
            >
              <Image
                src={galleryList[1].url}
                alt={galleryList[1].caption || car.name}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 25vw, 15vw"
                unoptimized
                className="dch-symm-img"
              />
            </div>

            {/* Slot Left 2 (Left Bottom) */}
            <div
              className={`dch-symm-slot dch-symm-slot-left-2 ${activeImgIdx === 2 ? "is-selected" : ""}`}
              onClick={() => setActiveImgIdx(2)}
              role="button"
              tabIndex={0}
              title="View angle 3"
            >
              <Image
                src={galleryList[2].url}
                alt={galleryList[2].caption || car.name}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 25vw, 15vw"
                unoptimized
                className="dch-symm-img"
              />
            </div>

            {/* Centerpiece Grand Hero Stage (Center Big) */}
            <div
              className="dch-symm-hero group"
              onClick={() => handleExpandToCinema(activeImgIdx)}
              role="button"
              tabIndex={0}
              title="Click to inspect full high-resolution Cinema Gallery"
            >
              <Image
                src={currentHeroImage.url}
                alt={car.name}
                fill
                priority
                unoptimized
                className="dch-symm-img"
              />
            </div>

            {/* Slot Right 1 (Right Top) */}
            <div
              className={`dch-symm-slot dch-symm-slot-right-1 ${activeImgIdx === 3 ? "is-selected" : ""}`}
              onClick={() => setActiveImgIdx(3)}
              role="button"
              tabIndex={0}
              title="View angle 4"
            >
              <Image
                src={galleryList[3].url}
                alt={galleryList[3].caption || car.name}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 25vw, 15vw"
                unoptimized
                className="dch-symm-img"
              />
            </div>

            {/* Slot Right 2 (Right Bottom - with +X More Photos overlay if > 5) */}
            <div
              className={`dch-symm-slot dch-symm-slot-right-2 ${activeImgIdx === 4 ? "is-selected" : ""}`}
              onClick={() => {
                if (galleryList.length > 5) {
                  handleExpandToCinema(4);
                } else {
                  setActiveImgIdx(4);
                }
              }}
              role="button"
              tabIndex={0}
              title={galleryList.length > 5 ? "View all photos" : "View angle 5"}
            >
              <Image
                src={galleryList[4].url}
                alt={galleryList[4].caption || car.name}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 25vw, 15vw"
                unoptimized
                className="dch-symm-img"
              />

              {/* Clean Frosted +X Photos Overlay */}
              {galleryList.length > 5 ? (
                <div className="dch-symm-more-overlay">
                  <span className="dch-more-count">+{galleryList.length - 5}</span>
                  <span className="dch-more-subtext">View All</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* Graceful Fallback for fewer than 5 images */
          <div className="dch-gallery-mosaic-grid">
            <div
              className="dch-gallery-hero-frame group"
              onClick={() => handleExpandToCinema(activeImgIdx)}
              role="button"
              tabIndex={0}
              title="Click to view full photo gallery"
            >
              <Image
                src={currentHeroImage.url}
                alt={car.name}
                fill
                priority
                unoptimized
                className="dch-gallery-hero-img"
              />
            </div>
          </div>
        )}

        {/* Bottom Horizontal Quick Thumbnail Ribbon (Clean, without noisy labels) */}
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
                    loading="lazy"
                    unoptimized
                    className="dch-rail-img"
                  />
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

      {/* 3. BegAutos-Style Clean Car Title Underneath Gallery */}
      <div className="dch-vehicle-headline-box">
        <h1 className="dch-car-main-title">{car.name}</h1>
      </div>

      {/* 4. BegAutos-Style 4 Dynamic Specification Cards (Border-divided, 100% Dynamic from Dashboard) */}
      <div className="dch-beg-specs-bar">
        <div className="dch-beg-spec-item">
          <span className="dch-beg-spec-label">Model year</span>
          <p className="dch-beg-spec-val">{car.year || "—"}</p>
        </div>

        <div className="dch-beg-spec-item">
          <span className="dch-beg-spec-label">Mileage</span>
          <p className="dch-beg-spec-val">{car.mileage || (isBrandNew ? "0 km" : "—")}</p>
        </div>

        <div className="dch-beg-spec-item">
          <span className="dch-beg-spec-label">{isElectric ? "Battery" : "Engine"}</span>
          <p className="dch-beg-spec-val">{isElectric ? evBattery : (car.engine_capacity || "—")}</p>
        </div>

        <div className="dch-beg-spec-item">
          <span className="dch-beg-spec-label">{isElectric ? "Range" : "Fuel"}</span>
          <p className="dch-beg-spec-val">{isElectric ? evRange : (car.fuel_type || "Petrol")}</p>
        </div>
      </div>

      {/* 4. Engineering & Valuation Grid: Left (Comprehensive Specs Matrix) vs Right (Slimmer Valuation Suite & Auction Sheet) */}
      <div className="dch-vehicle-content-grid">
        {/* Left Column: Comprehensive Technical Matrix (Spacious & Clean) */}
        <div className="dch-vehicle-main-col">
          {/* Specifications Matrix with COMPREHENSIVE TECHNICAL MATRIX + 4 Bespoke Chapters */}
          <section className="dch-specs-matrix-section">
            <div className="dch-section-heading-wrap">
              <h2 className="dch-section-title">Specification</h2>
            </div>

            <dl className="dch-beg-spec-list">
              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Brand</dt>
                <dd className="dch-beg-spec-dd">{car.brand || "—"}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Model</dt>
                <dd className="dch-beg-spec-dd">{car.model || car.name || "—"}</dd>
              </div>

              {!isBrandNew && car.year ? (
                <div className="dch-beg-spec-row">
                  <dt className="dch-beg-spec-dt">Reg. year</dt>
                  <dd className="dch-beg-spec-dd">{car.registration_number || car.year}</dd>
                </div>
              ) : null}

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Mileage</dt>
                <dd className="dch-beg-spec-dd">{car.mileage || (isBrandNew ? "0 km" : "—")}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Engine (CC)</dt>
                <dd className="dch-beg-spec-dd">{isElectric ? evBattery : (car.engine_capacity || "—")}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Transmission</dt>
                <dd className="dch-beg-spec-dd">{car.transmission || "Automatic"}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Fuel type</dt>
                <dd className="dch-beg-spec-dd">{isElectric ? "Electric" : (car.fuel_type || "Petrol")}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Drive type</dt>
                <dd className="dch-beg-spec-dd">{car.drivetrain || "4WD"}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Wheel</dt>
                <dd className="dch-beg-spec-dd">{car.wheel_base || "Factory Standard"}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Exterior</dt>
                <dd className="dch-beg-spec-dd">{car.color || "—"}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Body style</dt>
                <dd className="dch-beg-spec-dd">{car.body_style || "SUV"}</dd>
              </div>

              <div className="dch-beg-spec-row">
                <dt className="dch-beg-spec-dt">Condition</dt>
                <dd className={`dch-beg-spec-dd ${car.car_type === "BRAND_NEW" ? "is-gold" : ""}`}>
                  {car.car_type === "BRAND_NEW"
                    ? "NEW"
                    : car.car_type === "RECONDITIONED"
                    ? "RECONDITIONED"
                    : car.condition || "USED"}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {/* Right Column: Pricing & VIP Concierge Suite */}
        <aside className="dch-vehicle-sidebar-col">
          {/* 1. Showroom Pricing & VIP Concierge Suite */}
          <div className="dch-sticky-pricing-card">
            {/* Showroom Pricing Box */}
            <div className="dch-sidebar-pricing-box">
              <div className="dch-valuation-head-row">
                <div className="dch-sidebar-price-amount">
                  {displayPrice}
                </div>
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

              {/* Secondary: Chat on WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dch-sidebar-vip-btn dch-btn-whatsapp"
              >
                <div className="dch-vip-btn-icon dch-whatsapp-icon-wrap">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div className="dch-vip-btn-text">
                  <span className="btn-main-title">CHAT ON WHATSAPP</span>
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
          </div>
        </aside>
      </div>

      {/* 5. Story & Financing Suite: Description + EMI Calculator */}
      <div className="dch-story-financing-grid">
        {/* Left: Description */}
        <section className="dch-editorial-section">
          <div className="dch-section-heading-wrap">
            <h2 className="dch-section-title">DESCRIPTION</h2>
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

        {/* Right: Estimated Monthly Installment (EMI) */}
        <section className="dch-financing-calculator-section" id="financing-calculator">
          <div className="dch-section-heading-wrap">
            <h2 className="dch-section-title">ESTIMATED MONTHLY INSTALLMENT (EMI)</h2>
          </div>

          <div className="dch-calculator-card">
            <div className="dch-calc-inputs-grid">
              {/* 1. Vehicle Price / Loan Principal */}
              <div className="dch-calc-control-group">
                <div className="dch-calc-label-row">
                  <label htmlFor="loan-price-input">Vehicle Price / Loan Principal</label>
                  <span className="dch-calc-value-badge">
                    BDT {customPrice > 0 ? customPrice.toLocaleString("en-IN") : "0"}
                  </span>
                </div>
                <div className="dch-calc-input-wrap">
                  <span className="dch-calc-input-prefix">BDT</span>
                  <input
                    id="loan-price-input"
                    type="number"
                    min="100000"
                    step="50000"
                    value={customPrice || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCustomPrice(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    className="dch-calc-number-input"
                    placeholder="Enter customized price"
                  />
                  {numericPrice && customPrice !== numericPrice ? (
                    <button
                      type="button"
                      onClick={() => setCustomPrice(numericPrice)}
                      className="dch-calc-reset-btn"
                      title="Reset to Showroom Price"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
                <div className="dch-calc-sub-amount">
                  {customPrice >= 10000000
                    ? `~ ${(customPrice / 10000000).toFixed(2)} Crore`
                    : customPrice >= 100000
                    ? `~ ${(customPrice / 100000).toFixed(2)} Lakh`
                    : "Direct customizable purchase valuation"}
                </div>
              </div>

              {/* 2. Tenure / Duration Selector (Custom entry supported) */}
              <div className="dch-calc-control-group">
                <div className="dch-calc-label-row">
                  <label htmlFor="loan-tenure-input">Loan Duration</label>
                  <span className="dch-calc-value-badge">
                    {loanTenureMonths} Months ({(loanTenureMonths / 12).toFixed(1).replace(/\.0$/, "")} Yrs)
                  </span>
                </div>
                <div className="dch-calc-input-wrap">
                  <input
                    id="loan-tenure-input"
                    type="number"
                    min="1"
                    max="120"
                    step="1"
                    value={loanTenureMonths || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setLoanTenureMonths(isNaN(val) ? 1 : Math.max(1, Math.min(120, val)));
                    }}
                    className="dch-calc-number-input"
                    placeholder="Enter months (e.g. 30)"
                  />
                  <span className="dch-calc-input-suffix">Months</span>
                </div>
                <div className="dch-tenure-pills-row">
                  {[12, 24, 30, 36, 48, 60].map((months) => (
                    <button
                      key={months}
                      type="button"
                      className={`dch-tenure-pill ${loanTenureMonths === months ? "is-selected" : ""}`}
                      onClick={() => setLoanTenureMonths(months)}
                    >
                      {months}m{months === 30 ? " (2.5y)" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Interest Rate (.01 step, up to 15%, custom entry) */}
              <div className="dch-calc-control-group">
                <div className="dch-calc-label-row">
                  <label htmlFor="loan-interest-input">Bank Interest Rate</label>
                  <span className="dch-calc-value-badge">
                    {interestRate.toFixed(2)}% p.a.
                  </span>
                </div>
                <div className="dch-calc-input-wrap">
                  <input
                    id="loan-interest-input"
                    type="number"
                    min="0.01"
                    max="15"
                    step="0.01"
                    value={interestRate || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setInterestRate(isNaN(val) ? 0 : Math.max(0.01, Math.min(15, parseFloat(val.toFixed(2)))));
                    }}
                    className="dch-calc-number-input"
                    placeholder="e.g. 9.50"
                  />
                  <span className="dch-calc-input-suffix">% p.a.</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  className="dch-slider"
                />
                <div className="dch-calc-sub-amount">Adjustable up to 15.00% (0.01% fine-tuning)</div>
              </div>
            </div>

            {/* Calculated Results Suite: 3 Financial Figures */}
            <div className="dch-calc-result-box">
              <div className="dch-result-metrics-grid">
                {/* 1. Monthly EMI */}
                <div className="dch-metric-card is-primary">
                  <span className="dch-metric-label">ESTIMATED MONTHLY INSTALLMENT</span>
                  <div className="dch-result-emi-val">
                    {calculatedEmi ? (
                      <>
                        <span className="emi-currency">BDT</span> {calculatedEmi.toLocaleString("en-IN")}
                        <span className="emi-period"> / mo</span>
                      </>
                    ) : (
                      "BDT 0 / mo"
                    )}
                  </div>
                  <span className="dch-metric-sub">Monthly installment for {loanTenureMonths} months</span>
                </div>

                {/* 2. Total Repayment */}
                <div className="dch-metric-card">
                  <span className="dch-metric-label">TOTAL REPAYMENT ({loanTenureMonths} MOS)</span>
                  <div className="dch-metric-val">
                    <span className="emi-currency">BDT</span> {totalPayment.toLocaleString("en-IN")}
                  </div>
                  <span className="dch-metric-sub">Total amount payable over full tenure</span>
                </div>

                {/* 3. Extra / Total Interest */}
                <div className="dch-metric-card">
                  <span className="dch-metric-label">TOTAL EXTRA COST (INTEREST)</span>
                  <div className="dch-metric-val is-gold">
                    <span className="emi-currency">+BDT</span> {totalInterest.toLocaleString("en-IN")}
                  </div>
                  <span className="dch-metric-sub">Bank interest charges above principal</span>
                </div>
              </div>

              <div className="dch-calc-action-row">
                <p className="dch-result-disclaimer">
                  Calculated for standard banking partner allocations in Bangladesh. Final terms subject to credit verification.
                </p>

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
          </div>
        </section>
      </div>

      {/* 6. Video Walkaround Presentation */}
      <section className="dch-video-walkaround-section">
        <div className="dch-section-heading-wrap">
          <h2 className="dch-section-title">OFFICIAL VIDEO WALKAROUND</h2>
          <p className="dch-section-subtext">
            High-definition visual tour, engine exhaust acoustic notes, and cockpit walkthrough.
          </p>
        </div>
        <div className="dch-video-container">
          <iframe
            src={getYoutubeEmbedUrl(car.youtube)}
            title={`${car.name} Video Walkaround`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="dch-video-frame"
          />
        </div>
      </section>

      {/* 4. Complementary & Related Vehicles */}
      {relatedCars.length > 0 && (
        <section className="dch-related-automobiles-section">
          <div className="dch-section-heading-wrap">
            <h2 className="dch-section-title">SIMILAR LUXURY AUTOMOBILES</h2>
            <p className="dch-section-subtext">
              Explore handpicked alternative allocations sharing comparable engineering and prestige.
            </p>
          </div>

          <div className="preference-showcase-grid">
            {relatedCars.map((relCar) => (
              <VehicleCard key={relCar.id} car={relCar} layout="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Official Quotation Modal */}
      {isQuoteOpen && (
        <div className="car-modal-backdrop active" onClick={() => setIsQuoteOpen(false)}>
          <div
            className="car-modal-box appointment-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px" }}
          >
            <button
              className="modal-close-x"
              onClick={() => setIsQuoteOpen(false)}
              aria-label="Close Quotation Modal"
              title="Close"
            >
              &times;
            </button>

            <div className="appointment-modal-head">
              <span className="consult-pill-tag">OFFICIAL PRO-FORMA INVOICE</span>
              <h3 className="appointment-modal-title">Request Formal Quotation</h3>
              <p className="appointment-modal-sub">
                Receive duty breakdown, import documentation, and official written quotation for{" "}
                <strong style={{ color: "#38bdf8" }}>
                  {car.year ? `${car.year} ` : ""}{car.name}
                </strong>
                .
              </p>
            </div>

            {quoteSuccess ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
                <h4 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#ffffff", marginBottom: "0.5rem" }}>
                  Quotation Request Sent!
                </h4>
                <p style={{ color: "#94a3b8", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                  Our corporate sales desk has received your quotation request for{" "}
                  <strong style={{ color: "#ffffff" }}>{car.name}</strong>. An official pro-forma invoice will be
                  prepared and communicated to you.
                </p>
                <button
                  type="button"
                  className="consult-primary-btn"
                  onClick={() => setIsQuoteOpen(false)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <span>Close Window</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {quoteError && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      borderRadius: "8px",
                      color: "#fca5a5",
                      fontSize: "0.85rem",
                    }}
                  >
                    {quoteError}
                  </div>
                )}

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="e.g. Chowdhury Rahman"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={quoteEmail}
                    onChange={(e) => setQuoteEmail(e.target.value)}
                    placeholder="corporate@company.com"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    placeholder="017XX-XXXXXX"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={quotePending}
                  className="consult-primary-btn"
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    marginTop: "0.5rem",
                    justifyContent: "center",
                    cursor: quotePending ? "not-allowed" : "pointer",
                  }}
                >
                  <span>{quotePending ? "Submitting Request..." : "Request Pro-Forma Quote →"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
