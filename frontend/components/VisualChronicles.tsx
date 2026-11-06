"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicVisualChroniclesSection, PublicVisualChroniclesItem } from "@/lib/types";

export default function VisualChronicles({
  chronicles,
}: {
  chronicles?: PublicVisualChroniclesSection | null;
} = {}) {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const heading = chronicles?.heading || "DREAM CAR HOUSE Visual Chronicles";
  const subtitle =
    chronicles?.subtitle ||
    "Curated high-resolution photography, delivery spotlights, and automotive cinema from our Kakrail & Gulshan showrooms.";
  const statsNumber = chronicles?.stats_number || "19+";
  const statsLabel = chronicles?.stats_label || "Curated Masterpieces";

  const archiveTag = chronicles?.archive_tag || "19+ SHOWROOM ARCHIVE EDITIONS";
  const archiveDesc =
    chronicles?.archive_description ||
    "Explore high-definition exterior profiles, handcrafted cockpits, and delivery chronicles.";
  const archiveCta =
    chronicles?.archive_cta_label || "See All Gallery & Media (19+ Photos)";
  const archiveUrl = chronicles?.archive_cta_url || "/gallery";

  const defaultItems: PublicVisualChroniclesItem[] = [
    {
      id: 1,
      card_type: "hero",
      order: 1,
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
      front_alt: "Mercedes-Maybach S 680",
      front_badge: "SHOWROOM FLAGSHIP SPOTLIGHT",
      back_pill: "FIRST-CLASS COMMISSION",
      back_number: "01",
      title: "Mercedes-Maybach S 680 Bi-Turbo V12",
      description:
        "Obsidian Black over Silk Nappa leather. Exclusive rear executive lounge featuring heated massage ottomans, active road noise cancellation, and handcrafted champagne flutes.",
      specs: [
        { label: "Engine", value: "6.0L V12 Bi-Turbo" },
        { label: "Drivetrain", value: "4MATIC All-Wheel" },
        { label: "Interior", value: "First-Class Lounge" },
        { label: "Induction", value: "Showroom Vault" },
      ],
      cta_label: "Explore Available Inventory",
      cta_url: "/inventory",
    },
    {
      id: 2,
      card_type: "portrait",
      order: 2,
      image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=95",
      front_alt: "Rolls-Royce Ghost Extended",
      front_badge: "BESPOKE SANCTUARY",
      back_pill: "GRAND TOURER",
      back_number: "02",
      title: "Rolls-Royce Ghost Extended",
      description:
        "Silver Dawn coachwork with handcrafted fiber-optic Starlight headliner and self-closing coach doors. The ultimate pinnacle of Goodwood coachbuilding.",
      specs: [
        { label: "Engine", value: "6.75L Twin-Turbo V12" },
        { label: "Suspension", value: "Planar Magic Carpet" },
        { label: "Doors", value: "Power Coach Doors" },
        { label: "Acoustics", value: "Whisper Studio 100kg+" },
      ],
      cta_label: "View Media Spotlight",
      cta_url: "/gallery",
    },
    {
      id: 3,
      card_type: "tri",
      order: 3,
      image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=95",
      front_alt: "Porsche 911 Carrera GTS",
      front_badge: "STUTTGART PERFORMANCE",
      back_pill: "TRACK BENCHMARK",
      back_number: "03",
      title: "Porsche 911 Carrera GTS",
      description:
        "Carrara White track stance. 4.0L naturally aspirated flat-6 with razor-sharp response, center-lock wheels, and track precision.",
      specs: [
        { label: "Spec 1", value: "3.0L Flat-6" },
        { label: "Spec 2", value: "Center-Lock" },
        { label: "Spec 3", value: "Sport Chrono" },
      ],
      cta_label: "View Spotlight",
      cta_url: "/inventory",
    },
    {
      id: 4,
      card_type: "tri",
      order: 4,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=95",
      front_alt: "Executive Cockpit Craftsmanship",
      front_badge: "CABIN ARTISANSHIP",
      back_pill: "VIP FIRST-CLASS SUITE",
      back_number: "04",
      title: "Bespoke Lounge Cockpit",
      description:
        "Handcrafted semi-aniline hides, open-pore walnut trim, and multi-contour active hot-stone massage chairs.",
      specs: [
        { label: "Spec 1", value: "Burmester 4D" },
        { label: "Spec 2", value: "Heated Ottomans" },
        { label: "Spec 3", value: "Ambient 64" },
      ],
      cta_label: "View Spotlight",
      cta_url: "/gallery",
    },
    {
      id: 5,
      card_type: "tri",
      order: 5,
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=95",
      front_alt: "Range Rover SV Autobiography",
      front_badge: "FLAGSHIP OFF-ROAD",
      back_pill: "BRITISH LUXURY",
      back_number: "05",
      title: "Range Rover SV Autobiography",
      description:
        "Long wheelbase executive edition in Santorini Black. All-wheel steering, electronic air suspension, and deployable executive tables.",
      specs: [
        { label: "Spec 1", value: "4.4L Twin-Turbo" },
        { label: "Spec 2", value: "Air Suspension" },
        { label: "Spec 3", value: "All-Wheel Steer" },
      ],
      cta_label: "View Spotlight",
      cta_url: "/inventory",
    },
  ];

  const items =
    chronicles?.items && chronicles.items.length > 0 ? chronicles.items : defaultItems;
  const heroItem =
    items.find((i) => i.card_type === "hero" || i.order === 1) || defaultItems[0];
  const portraitItem =
    items.find((i) => i.card_type === "portrait" || i.order === 2) || defaultItems[1];
  const triItems = items.filter(
    (i) => i.card_type === "tri" || (i.order >= 3 && i.order <= 5)
  );
  const activeTriItems = triItems.length > 0 ? triItems : defaultItems.slice(2, 5);

  return (
    <section className="socials-section w-full" id="socials">
      <div className="luxury-container px-4 sm:px-6 lg:px-8">
        <div className="socials-header">
          <div className="socials-header-text">
            <h2 className="section-h2" style={{ marginBottom: "0.35rem" }}>
              {heading}
            </h2>
            <p className="socials-subtitle">{subtitle}</p>
          </div>
          <div className="socials-stats-badge">
            <span className="stats-num">{statsNumber}</span>
            <span className="stats-label">{statsLabel}</span>
          </div>
        </div>

        {/* Bespoke Architectural Atelier Grid (Interactive 3D Flip Cards) */}
        <div className="atelier-mosaic-grid">
          {/* Tile 1: Widescreen Hero Showcase (Col 1-7) */}
          <div
            className={`atelier-flip-card tile-hero group ${
              flippedCards[heroItem.id || 1] ? "is-flipped" : ""
            }`}
            onClick={() => toggleFlip(heroItem.id || 1)}
          >
            <div className="atelier-flip-inner">
              <div className="atelier-flip-front">
                <Image
                  src={heroItem.image || defaultItems[0].image!}
                  alt={heroItem.front_alt || heroItem.title}
                  width={1200}
                  height={700}
                  loading="lazy"
                />
                <div className="atelier-front-overlay"></div>
                <div className="atelier-front-top">
                  <span className="atelier-front-badge">
                    <span>{heroItem.front_badge}</span>
                  </span>
                </div>
              </div>

              <div className="atelier-flip-back">
                <div className="atelier-back-header">
                  <span className="atelier-back-pill">{heroItem.back_pill}</span>
                  <span className="atelier-back-num">{heroItem.back_number || "01"}</span>
                </div>

                <div className="atelier-back-body">
                  <h3 className="atelier-back-title">{heroItem.title}</h3>
                  <p className="atelier-back-desc">{heroItem.description}</p>

                  <div className="atelier-specs-grid">
                    {heroItem.specs?.map((spec, sIdx) => (
                      <div key={sIdx} className="atelier-spec-box">
                        <span className="spec-label">{spec.label}</span>
                        <span className="spec-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="atelier-back-footer">
                  <Link
                    href={heroItem.cta_url || "/inventory"}
                    className="atelier-flip-action-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{heroItem.cta_label || "Explore Available Inventory"}</span>
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
            className={`atelier-flip-card tile-portrait group ${
              flippedCards[portraitItem.id || 2] ? "is-flipped" : ""
            }`}
            onClick={() => toggleFlip(portraitItem.id || 2)}
          >
            <div className="atelier-flip-inner">
              <div className="atelier-flip-front">
                <Image
                  src={portraitItem.image || defaultItems[1].image!}
                  alt={portraitItem.front_alt || portraitItem.title}
                  width={800}
                  height={1000}
                  loading="lazy"
                />
                <div className="atelier-front-overlay"></div>
                <div className="atelier-front-top">
                  <span className="atelier-front-badge">
                    <span>{portraitItem.front_badge}</span>
                  </span>
                </div>
              </div>

              <div className="atelier-flip-back">
                <div className="atelier-back-header">
                  <span className="atelier-back-pill">{portraitItem.back_pill}</span>
                  <span className="atelier-back-num">{portraitItem.back_number || "02"}</span>
                </div>

                <div className="atelier-back-body">
                  <h3 className="atelier-back-title">{portraitItem.title}</h3>
                  <p className="atelier-back-desc">{portraitItem.description}</p>

                  <div className="atelier-specs-grid">
                    {portraitItem.specs?.map((spec, sIdx) => (
                      <div key={sIdx} className="atelier-spec-box">
                        <span className="spec-label">{spec.label}</span>
                        <span className="spec-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="atelier-back-footer">
                  <Link
                    href={portraitItem.cta_url || "/gallery"}
                    className="atelier-flip-action-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{portraitItem.cta_label || "View Media Spotlight"}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tiles 3, 4, 5: Tri-Column Compact Showcase */}
          {activeTriItems.map((triItem, idx) => (
            <div
              key={triItem.id || idx + 3}
              className={`atelier-flip-card tile-tri group ${
                flippedCards[triItem.id || idx + 3] ? "is-flipped" : ""
              }`}
              onClick={() => toggleFlip(triItem.id || idx + 3)}
            >
              <div className="atelier-flip-inner">
                <div className="atelier-flip-front">
                  <Image
                    src={triItem.image || defaultItems[idx + 2].image!}
                    alt={triItem.front_alt || triItem.title}
                    width={600}
                    height={500}
                    loading="lazy"
                  />
                  <div className="atelier-front-overlay"></div>
                  <div className="atelier-front-top">
                    <span className="atelier-front-badge">
                      <span>{triItem.front_badge}</span>
                    </span>
                  </div>
                </div>

                <div className="atelier-flip-back">
                  <div className="atelier-back-header">
                    <span className="atelier-back-pill">{triItem.back_pill}</span>
                    <span className="atelier-back-num">
                      {triItem.back_number || `0${idx + 3}`}
                    </span>
                  </div>

                  <div className="atelier-back-body">
                    <h4 className="atelier-back-title-sm">{triItem.title}</h4>
                    <p className="atelier-back-desc">{triItem.description}</p>

                    <div className="atelier-specs-compact">
                      {triItem.specs?.map((spec, sIdx) => (
                        <span key={sIdx} className="spec-tag-item">
                          {spec.value || spec.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="atelier-back-footer">
                    <Link
                      href={triItem.cta_url || "/inventory"}
                      className="atelier-flip-action-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{triItem.cta_label || "View Spotlight"}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Atelier Media Footer with "See All Gallery & Media" Navigation */}
        <div className="atelier-media-footer">
          <div className="media-footer-info">
            <div className="media-live-status">
              <span className="media-count-tag">{archiveTag}</span>
            </div>
            <p className="media-footer-desc">{archiveDesc}</p>
          </div>
          <div className="media-footer-action">
            <Link href={archiveUrl} className="atelier-see-all-cta">
              <span>{archiveCta}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
