"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GALLERY_DATA, GalleryPhoto } from "@/lib/showroomData";
import { useUI } from "@/lib/UIContext";

export default function GalleryClient({ initialPhotos = [] }: { initialPhotos?: GalleryPhoto[] } = {}) {
  const { openGalleryLightbox, openAppointmentModal, openVideoModal } = useUI();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const allPhotos =
    initialPhotos && initialPhotos.length > 0 && !initialPhotos.some((p) => p.image.includes("demo.jpg"))
      ? initialPhotos
      : GALLERY_DATA;

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === "all") return allPhotos;
    return allPhotos.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, allPhotos]);

  const handleLightboxOpen = (photo: GalleryPhoto, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
    openGalleryLightbox(idx !== -1 ? idx : 0, filteredPhotos);
  };

  const handleVideoOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    openVideoModal("reel");
  };

  return (
    <div className="inventory-page-wrap max-w-7xl">
      {/* Gallery Page Header */}
      <div className="gallery-page-header">
        <div className="gallery-breadcrumb-row">
          <Link href="/" className="gallery-back-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Return to Home</span>
          </Link>
          <span className="gallery-breadcrumb-sep">/</span>
          <span className="gallery-breadcrumb-current">Showroom Media Gallery</span>
        </div>

        <div className="gallery-header-main">
          <div>
            <div className="gallery-eyebrow">
              <span className="experience-pulse-dot"></span>
              <span>ATELIER ARCHIVE SPOTLIGHT</span>
            </div>
            <h1 className="gallery-hero-title">Showroom Gallery & Visual Showcase</h1>
            <p className="gallery-hero-desc">
              High-definition photography and cinema spotlights of exotic, flagship, and
              rare luxury vehicles inducted into our Kakrail & Gulshan showrooms.
            </p>
          </div>

          <div className="gallery-stats-counter">
            <span className="gallery-counter-num" id="gallery-counter-badge">
              {filteredPhotos.length}
            </span>
            <span className="gallery-counter-label">Curated Photos</span>
          </div>
        </div>

        {/* Category Filter Pills (Sleek Horizontal Swipe Row matching Python) */}
        <div className="gallery-pills-row">
          <button
            type="button"
            className={`gallery-filter-pill ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All Showcase ({allPhotos.length})
          </button>
          <button
            type="button"
            className={`gallery-filter-pill ${selectedCategory === "sedans" ? "active" : ""}`}
            onClick={() => setSelectedCategory("sedans")}
          >
            Flagship Sedans
          </button>
          <button
            type="button"
            className={`gallery-filter-pill ${selectedCategory === "supercars" ? "active" : ""}`}
            onClick={() => setSelectedCategory("supercars")}
          >
            Supercars & GTs
          </button>
          <button
            type="button"
            className={`gallery-filter-pill ${selectedCategory === "suvs" ? "active" : ""}`}
            onClick={() => setSelectedCategory("suvs")}
          >
            Luxury & Off-Road SUVs
          </button>
          <button
            type="button"
            className={`gallery-filter-pill ${selectedCategory === "cockpit" ? "active" : ""}`}
            onClick={() => setSelectedCategory("cockpit")}
          >
            Cockpits & Interiors
          </button>
        </div>
      </div>

      {/* Gallery Photos Grid with Authentic Python 3D Flip System */}
      <div id="gallery-grid" className="gallery-grid-layout">
        {filteredPhotos.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "4rem 1rem",
              color: "#9ca3af",
            }}
          >
            No showroom gallery items currently listed under this category.
          </div>
        ) : (
          filteredPhotos.map((photo, index) => {
          const isFlipped = !!flippedCards[photo.id];
          return (
            <div
              key={photo.id}
              className={`gallery-flip-card group ${isFlipped ? "is-flipped" : ""}`}
              onClick={() => toggleFlip(photo.id)}
            >
              <div className="gallery-flip-inner">
                {/* Front: Clean, Pristine High-Res Photography */}
                <div className="gallery-flip-front">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    loading={index < 6 ? "eager" : "lazy"}
                    decoding="async"
                    style={{
                      transition: "opacity 0.4s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                  <div className="gallery-front-overlay"></div>
                  <div className="gallery-front-top">
                    <span className="gallery-front-badge">{photo.categoryLabel}</span>
                  </div>
                  <div className="gallery-front-bottom">
                    <span className="gallery-flip-hint">FLIP FOR SPECS ↻</span>
                  </div>
                </div>

                {/* Back: Reverse Side with Specs & Fullscreen Lightbox Action */}
                <div className="gallery-flip-back">
                  <div className="gallery-back-top">
                    <span className="gallery-back-badge">{photo.categoryLabel}</span>
                    <span className="gallery-back-idx">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="gallery-back-content">
                    <h3 className="gallery-back-title">{photo.title}</h3>
                    <p className="gallery-back-desc">{photo.desc}</p>
                  </div>
                  <div className="gallery-back-bottom">
                    <div className="gallery-back-actions">
                      <button
                        type="button"
                        className="gallery-back-lightbox-btn"
                        onClick={handleVideoOpen}
                        title="Watch Cinematic Reel Spotlight"
                      >
                        <span>View Media Spotlight</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M7 17L17 7M7 7h10v10" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="gallery-action-icon-btn"
                        onClick={(e) => handleLightboxOpen(photo, e)}
                        title="View Fullscreen HD Photo"
                        aria-label="View Fullscreen HD Photo"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Bottom Studio Invitation Banner */}
      <div className="gallery-invitation-banner">
        <div className="gallery-invite-text">
          <h3 className="gallery-invite-title">Experience These Masterpieces In Person</h3>
          <p className="gallery-invite-desc">
            Private viewings, mechanical diagnostic inspections, and trade-in valuations
            available daily across our Kakrail and Gulshan showrooms.
          </p>
        </div>
        <div className="gallery-invite-actions">
          <button
            type="button"
            className="consult-primary-btn"
            onClick={() => openAppointmentModal()}
          >
            <span>Schedule Private Viewing</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <Link href="/inventory" className="gallery-btn-secondary">
            <span>Browse Available Inventory →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
