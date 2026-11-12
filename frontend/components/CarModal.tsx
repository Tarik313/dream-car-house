"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import { SHOWROOM_BRANCHES, GalleryPhoto, Vehicle } from "@/lib/showroomData";
import { formatVehiclePrice } from "@/lib/utils";

function getCarDrivetrain(car: Vehicle): string {
  const nameLower = (car.name || "").toLowerCase();
  const capLower = (car.engine_capacity || "").toLowerCase();
  if (capLower.includes("electric") || nameLower.includes("g 580")) {
    return "Dual Motor Electric AWD";
  } else if (
    nameLower.includes("mercedes") ||
    nameLower.includes("maybach") ||
    nameLower.includes("amg")
  ) {
    return "9G-Tronic 4MATIC AWD";
  } else if (nameLower.includes("bmw")) {
    return "8-Speed Steptronic xDrive";
  } else if (nameLower.includes("audi")) {
    return "S-Tronic Quattro AWD";
  } else if (
    nameLower.includes("land cruiser") ||
    nameLower.includes("toyota") ||
    nameLower.includes("prado")
  ) {
    return "Full-Time 4WD w/ Crawl Control";
  } else if (nameLower.includes("lexus")) {
    return "10-Speed Direct-Shift 4WD";
  } else if (
    nameLower.includes("defender") ||
    nameLower.includes("range rover")
  ) {
    return "Terrain Response 2 AWD";
  } else if (nameLower.includes("porsche")) {
    return "8-Speed PDK AWD";
  }
  return "Full-Time Intelligent All-Wheel Drive";
}

export default function CarModal({
  settings,
  branches,
}: {
  settings?: any;
  branches?: any;
} = {}) {
  const {
    selectedCar,
    closeCarModal,
    openAppointmentModal,
    openGalleryLightbox,
  } = useUI();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const logoSrc = settings?.logo || "/assets/dch-logo.webp";
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setActiveImgIdx(0);
  }, [selectedCar]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedCar) return;

    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://dreamcarhouse.com";
    const shareUrl = `${origin}/cars/${selectedCar.slug}`;
    const shareTitle = `${selectedCar.name} (${selectedCar.year}) | DREAM CAR HOUSE`;
    const shareText = `Explore this ${selectedCar.name} (${selectedCar.year}) at DREAM CAR HOUSE:`;

    // 1. Try native Web Share API (WhatsApp, Messenger, SMS, AirDrop)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
      }
    }

    // 2. Clipboard API
    let copied = false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      }
    } catch {
      // fallback
    }

    // 3. Document execCommand fallback
    if (!copied && typeof document !== "undefined") {
      try {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    }

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2400);
  };

  if (!selectedCar) return null;

  const branch =
    SHOWROOM_BRANCHES[selectedCar.branch_id] || SHOWROOM_BRANCHES["kakrail"];
  const isBrandNew = selectedCar.car_type === "BRAND_NEW";
  const drivetrain = getCarDrivetrain(selectedCar);
  const regText = isBrandNew
    ? "Unregistered Direct Import"
    : selectedCar.registered && selectedCar.registered !== "Available"
    ? selectedCar.registered
    : "Dhaka Metro Verified Papers";

  const galleryList =
    selectedCar.images && selectedCar.images.length > 0
      ? selectedCar.images
      : [
          {
            url: selectedCar.image,
            caption: "Front 3/4 Exterior Stance",
            tag: "EXTERIOR",
          },
        ];

  const currentImage = galleryList[activeImgIdx] || galleryList[0];

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev + 1) % galleryList.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIdx(
      (prev) => (prev - 1 + galleryList.length) % galleryList.length
    );
  };

  const handleExpandToCinema = (e: React.MouseEvent) => {
    e.stopPropagation();
    const convertedPhotos: GalleryPhoto[] = galleryList.map((img, i) => ({
      id: i + 100,
      title: `${selectedCar.name} • ${img.caption}`,
      category: "sedans",
      categoryLabel: selectedCar.brand,
      image: img.url,
      desc: selectedCar.description,
    }));
    openGalleryLightbox(activeImgIdx, convertedPhotos);
  };

  const waMessage = encodeURIComponent(
    `Hello DREAM CAR HOUSE, I am inquiring about the ${selectedCar.name} (${selectedCar.year}) allocated at your ${branch.name}. Please share the official spec sheet, showroom availability, and confidential valuation.`
  );
  const waUrl = `https://wa.me/8801615121312?text=${waMessage}`;

  return (
    <div className="car-modal-backdrop active" onClick={closeCarModal}>
      <div className="car-modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-x"
          onClick={closeCarModal}
          aria-label="Close Car Details"
          title="Close (ESC)"
        >
          &times;
        </button>

        <div id="modal-body-content">
          <div className="dch-car-modal-wrapper">
            {/* Top Status & Studio Allocation Beacon Bar */}
            <div className="dch-modal-top-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Image
                  src={logoSrc}
                  alt="DREAM CAR HOUSE"
                  width={1020}
                  height={350}
                  style={{
                    height: "36px",
                    width: "auto",
                    maxWidth: "200px",
                    objectFit: "contain",
                  }}
                  unoptimized
                />
              </div>
              <div className="dch-modal-badges">
                {isBrandNew ? (
                  <span className="car-badge-pill pill-brandnew">
                    BRAND NEW • ZERO METER
                  </span>
                ) : (
                  <span className="car-badge-pill pill-preowned">
                    CERTIFIED PRE-OWNED
                  </span>
                )}
                <div className="dch-showroom-beacon">
                  <span>INVENTORY VAULT • PHYSICAL ALLOCATION</span>
                </div>
              </div>
            </div>

            {/* Main 2-Column Showcase Grid */}
            <div className="dch-car-grid">
              {/* Left Column: Interactive Multi-Photo Cinema Showcase */}
              <div className="dch-car-visual-col">
                <div
                  className="dch-car-img-frame"
                  id="dch-gallery-hero-frame"
                  onClick={handleExpandToCinema}
                  style={{ cursor: "pointer" }}
                  title="Inspect in Full Cinema Mode"
                >
                  <img
                    src={currentImage.url}
                    alt={selectedCar.name}
                    className="dch-car-img"
                    id="dch-main-car-img"
                  />
                  <div className="dch-car-img-overlay"></div>

                  {/* Top-Right: Image Counter & Cinema Lightbox Button */}
                  <div className="dch-img-counter-wrap">
                    <span className="dch-img-counter-pill" id="dch-img-counter">
                      {activeImgIdx + 1} / {galleryList.length}
                    </span>
                    <button
                      type="button"
                      className="dch-img-expand-btn"
                      onClick={handleExpandToCinema}
                      title="Inspect in Full Cinema Mode"
                      aria-label="Inspect in Full Cinema Mode"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </button>
                  </div>

                  {/* Prev & Next Gallery Navigation Arrows */}
                  {galleryList.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="dch-gallery-arrow dch-gallery-prev"
                        onClick={prevImg}
                        aria-label="Previous Photo"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="dch-gallery-arrow dch-gallery-next"
                        onClick={nextImg}
                        aria-label="Next Photo"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Bottom Left: Clean Minimal Photo Angle Pill */}
                  <div
                    className="dch-photo-angle-pill"
                    id="dch-active-caption"
                  >
                    {currentImage.caption}
                  </div>
                </div>

                {/* Multi-Photo Thumbnail Strip Carousel */}
                {galleryList.length > 1 && (
                  <div className="dch-thumbnail-strip-wrap">
                    <div
                      className="dch-thumbnail-strip"
                      id="dch-thumbnail-strip"
                    >
                      {galleryList.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`dch-thumb-btn ${
                            idx === activeImgIdx ? "active" : ""
                          }`}
                          onClick={() => setActiveImgIdx(idx)}
                          aria-label={`View photo ${idx + 1}: ${img.caption}`}
                        >
                          <img src={img.url} alt={img.caption} />
                          <span className="thumb-tag">
                            {img.tag || idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Physical Showroom Branch Allocation Box */}
                <div className="dch-branch-allocation-box">
                  <div className="branch-alloc-head">
                    <div className="branch-alloc-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="branch-alloc-meta">
                      <div className="branch-alloc-eyebrow">
                        PHYSICAL VEHICLE ALLOCATION
                      </div>
                      <div className="branch-alloc-name">{branch.name}</div>
                      <div className="branch-alloc-address">
                        {branch.address}
                      </div>
                    </div>
                  </div>
                  <div className="branch-alloc-actions">
                    <div className="branch-alloc-hours">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{branch.hours}</span>
                    </div>
                    <a
                      href={branch.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="branch-alloc-map-btn"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                      </svg>
                      <span>Get Directions</span>
                    </a>
                  </div>
                </div>

                {/* Dealership Trust Verification (DREAM CAR HOUSE Flagship Standard) */}
                <div className="dch-trust-strip">
                  <div className="dch-trust-pill">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span>Genuine Mileage</span>
                  </div>
                  <div className="dch-trust-pill">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span>Dhaka Metro Papers</span>
                  </div>
                  <div className="dch-trust-pill">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span>Vault Ready Unit</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Vehicle Details, Technical Specifications & VIP Action Suite */}
              <div className="dch-car-info-col">
                <div className="dch-car-header">
                  <div className="dch-brand-year-tag">
                    {selectedCar.brand.toUpperCase()} • PRODUCTION {selectedCar.year}
                  </div>
                  <h2 className="dch-car-title">{selectedCar.name}</h2>
                  <div className="dch-car-price-row">
                    <div className="dch-valuation-top-bar">
                      <span className="dch-price-label">SHOWROOM VALUATION</span>
                      <button
                        type="button"
                        id="car-modal-share-btn"
                        className={`dch-share-car-btn ${isCopied ? "is-copied" : ""}`}
                        onClick={handleShare}
                        title="Share this vehicle (Copy link or share via WhatsApp/Social)"
                        aria-label="Share this vehicle"
                      >
                        {isCopied ? (
                          <>
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
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

                    <div className="dch-price-value">
                      {formatVehiclePrice(
                        selectedCar.price,
                        selectedCar.is_call_for_price,
                        "Price Upon Request • VIP Consultation"
                      )}
                    </div>
                  </div>
                </div>

                <p className="dch-car-description">{selectedCar.description}</p>

                {/* 8-Card Technical Specification Matrix (DREAM CAR HOUSE Flagship Standard) */}
                <div className="dch-specs-matrix">
                  {/* 1. Powertrain / Engine */}
                  <div className="dch-spec-item">
                    <div className="dch-spec-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>
                    <div className="dch-spec-texts">
                      <span className="dch-spec-label">POWERTRAIN</span>
                      <span className="dch-spec-value">
                        {selectedCar.engine_capacity}
                      </span>
                    </div>
                  </div>

                  {/* 2. Transmission & Drive */}
                  <div className="dch-spec-item">
                    <div className="dch-spec-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                      </svg>
                    </div>
                    <div className="dch-spec-texts">
                      <span className="dch-spec-label">TRANSMISSION</span>
                      <span className="dch-spec-value">{drivetrain}</span>
                    </div>
                  </div>

                  {/* 3. Fuel System */}
                  <div className="dch-spec-item">
                    <div className="dch-spec-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 22V4a2 2 0 012-2h6a2 2 0 012 2v18M13 10h4a2 2 0 012 2v4a2 2 0 002 2 2 2 0 002-2V9l-3-3M3 22h10" />
                      </svg>
                    </div>
                    <div className="dch-spec-texts">
                      <span className="dch-spec-label">FUEL SYSTEM</span>
                      <span className="dch-spec-value">
                        {selectedCar.fuel_type}
                      </span>
                    </div>
                  </div>

                  {/* 4. Odometer / Mileage */}
                  <div className="dch-spec-item">
                    <div className="dch-spec-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="dch-spec-texts">
                      <span className="dch-spec-label">ODOMETER</span>
                      <span className="dch-spec-value">
                        {selectedCar.mileage}
                      </span>
                    </div>
                  </div>

                  {/* 5. Documentation */}
                  <div className="dch-spec-item">
                    <div className="dch-spec-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="dch-spec-texts">
                      <span className="dch-spec-label">REGISTRATION</span>
                      <span className="dch-spec-value">{regText}</span>
                    </div>
                  </div>

                  {/* 6. Inspection Audit */}
                  <div className="dch-spec-item">
                    <div className="dch-spec-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="dch-spec-texts">
                      <span className="dch-spec-label">INSPECTION AUDIT</span>
                      <span className="dch-spec-value">150-Point Certified</span>
                    </div>
                  </div>

                  {/* 7. Showroom Status & Verification */}
                  <div className="dch-spec-item">
                    <div className="dch-spec-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="dch-spec-texts">
                      <span className="dch-spec-label">VEHICLE STATUS</span>
                      <span className="dch-spec-value">Physically Available</span>
                    </div>
                  </div>

                  {/* 8. Delivery Handover */}
                  <div className="dch-spec-item">
                    <div className="dch-spec-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 2l-2 2m-2-2l2 2m-5 9l5-5-2-2-5 5v2h2zM3 21l6-6M9 9l3 3" />
                      </svg>
                    </div>
                    <div className="dch-spec-texts">
                      <span className="dch-spec-label">HANDOVER</span>
                      <span className="dch-spec-value">Immediate Delivery</span>
                    </div>
                  </div>
                </div>

                {/* VIP Actions Suite (Twin Equal Symmetrical Standard) */}
                <div className="dch-vip-actions">
                  {/* 1. Titanium White Schedule Private Viewing Button */}
                  <button
                    type="button"
                    className="dch-viewing-vip-btn"
                    onClick={() => {
                      closeCarModal();
                      openAppointmentModal({
                        carName: selectedCar.name,
                        carYear: selectedCar.year,
                        branchId: selectedCar.branch_id,
                      });
                    }}
                  >
                    <div className="dch-viewing-icon-box">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0a0c10"
                        strokeWidth="2.2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="dch-btn-text-wrap">
                      <span
                        className="dch-btn-main"
                        style={{ color: "#0a0c10" }}
                      >
                        BOOK PRIVATE VIEWING
                      </span>
                      <span
                        className="dch-btn-sub"
                        style={{ color: "#475569" }}
                      >
                        Showroom Appointment
                      </span>
                    </div>
                  </button>

                  {/* 2. VIP WhatsApp Concierge Button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dch-wa-vip-btn"
                    id="dch-wa-action-btn"
                  >
                    <div className="dch-wa-icon-box">
                      <svg
                        viewBox="0 0 24 24"
                        width="24" height="24"
                        fill="#ffffff"
                      >
                        <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.838.497 3.633 1.442 5.213L2 22l4.908-1.408c1.517.854 3.238 1.439 5.123 1.439 5.535 0 10.031-4.496 10.031-10.031C22.062 6.496 17.566 2 12.031 2zm5.795 14.285c-.244.686-1.42 1.321-1.956 1.378-.536.057-1.196.229-3.957-.869-3.327-1.323-5.46-4.717-5.626-4.94-.166-.223-1.352-1.8-1.352-3.433 0-1.633.856-2.438 1.161-2.771.305-.333.666-.416.888-.416.222 0 .444.002.638.012.206.01.482-.078.754.577.28.674.957 2.33.1042 2.502.085.172.142.374.028.6-.114.226-.172.367-.342.566-.17.199-.358.444-.512.597-.171.171-.349.356-.15.698.199.342.887 1.464 1.902 2.37 1.309 1.168 2.413 1.53 2.756 1.701.343.171.543.143.744-.086.2-.229.856-.998 1.085-1.341.229-.343.457-.286.771-.171.314.114 1.996.941 2.339 1.112.343.171.571.257.657.4.086.143.086.828-.158 1.514z" />
                      </svg>
                    </div>
                    <div className="dch-btn-text-wrap">
                      <span className="dch-btn-main">
                        CHAT ON WHATSAPP
                      </span>
                      <span className="dch-btn-sub">
                        Direct Concierge Desk
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
