"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";

export default function GalleryLightbox() {
  const { galleryLightboxIndex, galleryPhotos, closeGalleryLightbox, openGalleryLightbox } = useUI();

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  const activeIndex = galleryLightboxIndex !== null ? galleryLightboxIndex : 0;
  const currentPhoto = galleryPhotos[activeIndex];

  // Reset zoom and pan on slide change
  useEffect(() => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  }, [galleryLightboxIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (galleryLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleZoomReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryLightboxIndex, galleryPhotos.length, zoomLevel]);

  if (galleryLightboxIndex === null || !currentPhoto) return null;

  const nextSlide = () => {
    const nextIdx = (activeIndex + 1) % galleryPhotos.length;
    openGalleryLightbox(nextIdx, galleryPhotos);
  };

  const prevSlide = () => {
    const prevIdx = (activeIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    openGalleryLightbox(prevIdx, galleryPhotos);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(3.5, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1.0, prev - 0.25);
      if (next === 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleZoomReset = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (zoomLevel > 1.0) {
      handleZoomReset();
    } else {
      setZoomLevel(2.0);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1.0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1.0) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      id="gallery-lightbox-modal"
      className="car-modal-backdrop lightbox-cinema-backdrop active"
      onClick={closeGalleryLightbox}
    >
      <div className="lightbox-cinema-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <div className="lightbox-top-bar">
          <div className="lightbox-brand-info">
            <span className="lightbox-gold-dot"></span>
            <span className="lightbox-brand-name">DREAM CAR HOUSE</span>
            <span className="lightbox-brand-sep">•</span>
            <span id="lightbox-category" className="lightbox-top-badge">
              {currentPhoto.categoryLabel.toUpperCase()}
            </span>
          </div>

          <div className="lightbox-top-actions">
            {/* Interactive Zoom Controls */}
            <div className="lightbox-zoom-bar" role="toolbar" aria-label="Photo Zoom Controls">
              <button
                type="button"
                className="lightbox-zoom-btn"
                onClick={handleZoomOut}
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span
                id="lightbox-zoom-val"
                className="lightbox-zoom-val"
                onClick={handleZoomReset}
                title="Click to Reset Zoom (1:1)"
                aria-label="Current Zoom Level"
              >
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                className="lightbox-zoom-btn"
                onClick={handleZoomIn}
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button
                type="button"
                className="lightbox-zoom-btn lightbox-zoom-reset-btn"
                onClick={handleZoomReset}
                title="Reset Zoom (1:1)"
                aria-label="Reset Zoom"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <polyline points="3 3 3 8 8 8" />
                </svg>
              </button>
            </div>

            {/* Counter Badge */}
            <span id="lightbox-counter" className="lightbox-counter-pill">
              {activeIndex + 1} / {galleryPhotos.length}
            </span>

            {/* Fullscreen Toggle Button */}
            <button
              className="lightbox-action-btn"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen (F)"
              aria-label="Toggle Fullscreen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              className="lightbox-action-btn lightbox-close-action"
              onClick={closeGalleryLightbox}
              title="Close Viewer (Esc)"
              aria-label="Close Viewer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {galleryPhotos.length > 1 && (
          <>
            <button
              className="lightbox-arrow lightbox-prev"
              onClick={prevSlide}
              aria-label="Previous Photo"
              title="Previous (Left Arrow)"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="lightbox-arrow lightbox-next"
              onClick={nextSlide}
              aria-label="Next Photo"
              title="Next (Right Arrow)"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Main Cinema Image Stage */}
        <div
          ref={stageRef}
          className="lightbox-image-stage"
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: zoomLevel > 1.0 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
          title="Double click to toggle 2x zoom • Scroll wheel to zoom in/out • Drag to pan"
        >
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Image
              id="lightbox-main-img"
              src={currentPhoto.image}
              alt={currentPhoto.title}
              width={1920}
              height={1080}
              style={{
                maxWidth: "92vw",
                maxHeight: "82vh",
                objectFit: "contain",
                userSelect: "none",
              }}
              priority
            />
          </div>
        </div>

        {/* Bottom Caption Bar */}
        <div className="lightbox-caption-bar" style={{ padding: "0.75rem 1.5rem", background: "rgba(0,0,0,0.85)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.25rem" }}>
            {currentPhoto.title}
          </h4>
          <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: 0, maxWidth: "700px", marginInline: "auto" }}>
            {currentPhoto.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
