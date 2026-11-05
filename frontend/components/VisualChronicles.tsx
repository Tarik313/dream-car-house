"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function VisualChronicles({ chronicles }: { chronicles?: unknown } = {}) {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="socials-section max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8" id="socials">
      <div className="socials-header">
        <div className="socials-header-text">
          <h2 className="section-h2" style={{ marginBottom: "0.35rem" }}>
            DREAM CAR HOUSE Visual Chronicles
          </h2>
          <p className="socials-subtitle">
            Curated high-resolution photography, delivery spotlights, and automotive cinema from our Kakrail & Gulshan showrooms.
          </p>
        </div>
        <div className="socials-stats-badge">
          <span className="stats-num">19+</span>
          <span className="stats-label">Curated Masterpieces</span>
        </div>
      </div>

      {/* Bespoke Architectural Atelier Grid (Interactive 3D Flip Cards) */}
      <div className="atelier-mosaic-grid">
        {/* Tile 1: Widescreen Hero Showcase (Col 1-7) */}
        <div
          className={`atelier-flip-card tile-hero group ${flippedCards[1] ? "is-flipped" : ""}`}
          onClick={() => toggleFlip(1)}
        >
          <div className="atelier-flip-inner">
            <div className="atelier-flip-front">
              <Image
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85"
                alt="Mercedes-Maybach S 680"
                width={1200}
                height={700}
                loading="lazy"
              />
              <div className="atelier-front-overlay"></div>
              <div className="atelier-front-top">
                <span className="atelier-front-badge">
                  <span>SHOWROOM FLAGSHIP SPOTLIGHT</span>
                </span>
              </div>
            </div>

            <div className="atelier-flip-back">
              <div className="atelier-back-header">
                <span className="atelier-back-pill">FIRST-CLASS COMMISSION</span>
                <span className="atelier-back-num">01</span>
              </div>

              <div className="atelier-back-body">
                <h3 className="atelier-back-title">Mercedes-Maybach S 680 Bi-Turbo V12</h3>
                <p className="atelier-back-desc">
                  Obsidian Black over Silk Nappa leather. Exclusive rear executive lounge featuring heated massage ottomans, active road noise cancellation, and handcrafted champagne flutes.
                </p>

                <div className="atelier-specs-grid">
                  <div className="atelier-spec-box">
                    <span className="spec-label">Engine</span>
                    <span className="spec-value">6.0L V12 Bi-Turbo</span>
                  </div>
                  <div className="atelier-spec-box">
                    <span className="spec-label">Drivetrain</span>
                    <span className="spec-value">4MATIC All-Wheel</span>
                  </div>
                  <div className="atelier-spec-box">
                    <span className="spec-label">Interior</span>
                    <span className="spec-value">First-Class Lounge</span>
                  </div>
                  <div className="atelier-spec-box">
                    <span className="spec-label">Induction</span>
                    <span className="spec-value">Showroom Vault</span>
                  </div>
                </div>
              </div>

              <div className="atelier-back-footer">
                <Link
                  href="/inventory"
                  className="atelier-flip-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Explore Available Inventory</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tile 2: Vertical Stature Portrait (Col 8-12) */}
        <div
          className={`atelier-flip-card tile-portrait group ${flippedCards[2] ? "is-flipped" : ""}`}
          onClick={() => toggleFlip(2)}
        >
          <div className="atelier-flip-inner">
            <div className="atelier-flip-front">
              <Image
                src="https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=95"
                alt="Rolls-Royce Ghost Extended"
                width={800}
                height={1000}
                loading="lazy"
              />
              <div className="atelier-front-overlay"></div>
              <div className="atelier-front-top">
                <span className="atelier-front-badge">
                  <span>BESPOKE SANCTUARY</span>
                </span>
              </div>
            </div>

            <div className="atelier-flip-back">
              <div className="atelier-back-header">
                <span className="atelier-back-pill">GRAND TOURER</span>
                <span className="atelier-back-num">02</span>
              </div>

              <div className="atelier-back-body">
                <h3 className="atelier-back-title">Rolls-Royce Ghost Extended</h3>
                <p className="atelier-back-desc">
                  Silver Dawn coachwork with handcrafted fiber-optic Starlight headliner and self-closing coach doors. The ultimate pinnacle of Goodwood coachbuilding.
                </p>

                <div className="atelier-specs-grid">
                  <div className="atelier-spec-box">
                    <span className="spec-label">Engine</span>
                    <span className="spec-value">6.75L Twin-Turbo V12</span>
                  </div>
                  <div className="atelier-spec-box">
                    <span className="spec-label">Suspension</span>
                    <span className="spec-value">Planar Magic Carpet</span>
                  </div>
                  <div className="atelier-spec-box">
                    <span className="spec-label">Doors</span>
                    <span className="spec-value">Power Coach Doors</span>
                  </div>
                  <div className="atelier-spec-box">
                    <span className="spec-label">Acoustics</span>
                    <span className="spec-value">Whisper Studio 100kg+</span>
                  </div>
                </div>
              </div>

              <div className="atelier-back-footer">
                <Link
                  href="/gallery"
                  className="atelier-flip-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>View Media Spotlight</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tile 3: Track Performance Coupe */}
        <div
          className={`atelier-flip-card tile-tri group ${flippedCards[3] ? "is-flipped" : ""}`}
          onClick={() => toggleFlip(3)}
        >
          <div className="atelier-flip-inner">
            <div className="atelier-flip-front">
              <Image
                src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=95"
                alt="Porsche 911 Carrera GTS"
                width={600}
                height={500}
                loading="lazy"
              />
              <div className="atelier-front-overlay"></div>
              <div className="atelier-front-top">
                <span className="atelier-front-badge">
                  <span>STUTTGART PERFORMANCE</span>
                </span>
              </div>
            </div>

            <div className="atelier-flip-back">
              <div className="atelier-back-header">
                <span className="atelier-back-pill">TRACK BENCHMARK</span>
                <span className="atelier-back-num">03</span>
              </div>

              <div className="atelier-back-body">
                <h4 className="atelier-back-title-sm">Porsche 911 Carrera GTS</h4>
                <p className="atelier-back-desc">
                  Carrara White track stance. 4.0L naturally aspirated flat-6 with razor-sharp response, center-lock wheels, and track precision.
                </p>

                <div className="atelier-specs-compact">
                  <span className="spec-tag-item">3.0L Flat-6</span>
                  <span className="spec-tag-item">Center-Lock</span>
                  <span className="spec-tag-item">Sport Chrono</span>
                </div>
              </div>

              <div className="atelier-back-footer">
                <Link
                  href="/inventory"
                  className="atelier-flip-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>View Spotlight</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tile 4: Cabin Craftsmanship & Cockpit */}
        <div
          className={`atelier-flip-card tile-tri group ${flippedCards[4] ? "is-flipped" : ""}`}
          onClick={() => toggleFlip(4)}
        >
          <div className="atelier-flip-inner">
            <div className="atelier-flip-front">
              <Image
                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=95"
                alt="Executive Cockpit Craftsmanship"
                width={600}
                height={500}
                loading="lazy"
              />
              <div className="atelier-front-overlay"></div>
              <div className="atelier-front-top">
                <span className="atelier-front-badge">
                  <span>CABIN ARTISANSHIP</span>
                </span>
              </div>
            </div>

            <div className="atelier-flip-back">
              <div className="atelier-back-header">
                <span className="atelier-back-pill">VIP FIRST-CLASS SUITE</span>
                <span className="atelier-back-num">04</span>
              </div>

              <div className="atelier-back-body">
                <h4 className="atelier-back-title-sm">Bespoke Lounge Cockpit</h4>
                <p className="atelier-back-desc">
                  Handcrafted semi-aniline hides, open-pore walnut trim, and multi-contour active hot-stone massage chairs.
                </p>

                <div className="atelier-specs-compact">
                  <span className="spec-tag-item">Burmester 4D</span>
                  <span className="spec-tag-item">Heated Ottomans</span>
                  <span className="spec-tag-item">Ambient 64</span>
                </div>
              </div>

              <div className="atelier-back-footer">
                <Link
                  href="/gallery"
                  className="atelier-flip-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>View Spotlight</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tile 5: Flagship Luxury SUV */}
        <div
          className={`atelier-flip-card tile-tri group ${flippedCards[5] ? "is-flipped" : ""}`}
          onClick={() => toggleFlip(5)}
        >
          <div className="atelier-flip-inner">
            <div className="atelier-flip-front">
              <Image
                src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=95"
                alt="Range Rover SV Autobiography"
                width={600}
                height={500}
                loading="lazy"
              />
              <div className="atelier-front-overlay"></div>
              <div className="atelier-front-top">
                <span className="atelier-front-badge">
                  <span>FLAGSHIP OFF-ROAD</span>
                </span>
              </div>
            </div>

            <div className="atelier-flip-back">
              <div className="atelier-back-header">
                <span className="atelier-back-pill">BRITISH LUXURY</span>
                <span className="atelier-back-num">05</span>
              </div>

              <div className="atelier-back-body">
                <h4 className="atelier-back-title-sm">Range Rover SV Autobiography</h4>
                <p className="atelier-back-desc">
                  Long wheelbase executive edition in Santorini Black. All-wheel steering, electronic air suspension, and deployable executive tables.
                </p>

                <div className="atelier-specs-compact">
                  <span className="spec-tag-item">4.4L Twin-Turbo</span>
                  <span className="spec-tag-item">Air Suspension</span>
                  <span className="spec-tag-item">All-Wheel Steer</span>
                </div>
              </div>

              <div className="atelier-back-footer">
                <Link
                  href="/inventory"
                  className="atelier-flip-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>View Spotlight</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atelier Media Footer with "See All Gallery & Media" Navigation */}
      <div className="atelier-media-footer">
        <div className="media-footer-info">
          <div className="media-live-status">
            <span className="media-count-tag">19+ SHOWROOM ARCHIVE EDITIONS</span>
          </div>
          <p className="media-footer-desc">
            Explore high-definition exterior profiles, handcrafted cockpits, and delivery chronicles.
          </p>
        </div>
        <div className="media-footer-action">
          <Link href="/gallery" className="atelier-see-all-cta">
            <span>See All Gallery & Media (19+ Photos)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
