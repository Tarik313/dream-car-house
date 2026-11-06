"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import type { PublicSiteSettings, PublicShowroomBranch, PublicAboutSection, PublicPeopleTalk } from "@/lib/types";
import SocialFeatures from "@/components/SocialFeatures";

function renderPillarIcon(iconKey: string) {
  switch (iconKey?.toLowerCase()) {
    case "globe":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "check":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "vault":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "concierge":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
      );
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
}

export default function AboutClient({
  aboutData,
  settings,
  branches = [],
  totalVehicles,
  peopleTalks = [],
}: {
  aboutData?: PublicAboutSection | null;
  settings?: PublicSiteSettings;
  branches?: PublicShowroomBranch[];
  totalVehicles?: number;
  peopleTalks?: PublicPeopleTalk[];
} = {}) {
  const { openVideoModal, openAppointmentModal } = useUI();

  const targetPhone = settings?.whatsapp || settings?.hotline || "";
  let waPhone = targetPhone.replace(/[^0-9]/g, "");
  if (waPhone.startsWith("0")) {
    waPhone = "88" + waPhone;
  } else if (waPhone && !waPhone.startsWith("880") && waPhone.length === 10) {
    waPhone = "880" + waPhone;
  }
  const waUrl = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent("Hello Dream Car House, I would like to schedule a private showroom consultation.")}`
    : "";

  const heroBadge = aboutData?.hero_badge || "THE DREAM CAR HOUSE STORY";
  const heroTitle = aboutData?.hero_title || "Where Automotive Passion Meets Unrivaled Luxury";
  const heroSubtitle =
    aboutData?.hero_subtitle ||
    "Dhaka's benchmark in factory-fresh zero-meter imports, bespoke executive saloons, and confidential white-glove automotive advisory.";

  const statsList =
    aboutData?.stats && aboutData.stats.length > 0
      ? aboutData.stats
      : [
          { id: "1", number: "15+", label: "Years of Motoring Trust", order: 1 },
          { id: "2", number: "150+", label: "Point Diagnostic Audit", order: 2 },
          { id: "3", number: "100%", label: "Verified Global Provenance", order: 3 },
          { id: "4", number: String(branches.length || 2), label: "Dhaka Flagship Showrooms", order: 4 },
        ];

  const storyEyebrow = aboutData?.story_eyebrow || "OUR HERITAGE & PHILOSOPHY";
  const storyTitle = aboutData?.story_title || "An Uncompromising Pursuit of Automotive Perfection";
  const storyP1 =
    aboutData?.story_content_p1 ||
    "DREAM CAR HOUSE was founded with a singular, uncompromising vision: to establish Dhaka’s foremost luxury automotive destination where discerning connoisseurs can explore, acquire, and commission the world's most coveted motorcars with absolute peace of mind.";
  const storyP2 =
    aboutData?.story_content_p2 ||
    "Operating across two flagship showrooms in Kakrail (Shaheed Captain Monsur Ali Soroni) and Gulshan Avenue (Road #127), our curated portfolio encompasses zero-meter factory imports, bespoke executive saloons, track-bred supercars, and certified pre-owned collectors' editions from Mercedes-Maybach, Rolls-Royce, Porsche, Lexus, BMW, and Toyota.";
  const quoteText =
    aboutData?.quote_text ||
    "We do not merely deliver motorcars; we curate trust, pedigree, and lifelong relationships for Dhaka's most discerning motorists.";
  const quoteAuthor = aboutData?.quote_author || "";

  const reelImageUrl =
    aboutData?.reel_image_url ||
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85";
  const reelTitle = aboutData?.reel_title || "Flagship Automotive Showcase";
  const reelDuration = aboutData?.reel_duration || "4K REEL • 01:45";
  const reelVideoTarget: "reel" | "tour" =
    aboutData?.reel_video_target === "tour" ? "tour" : "reel";
  const tourCtaLabel = aboutData?.tour_cta_label || "Watch Full Showroom Tour (02:30)";
  const tourVideoTarget: "reel" | "tour" =
    aboutData?.tour_video_target === "reel" ? "reel" : "tour";

  const pillarsEyebrow = aboutData?.pillars_eyebrow || "THE FOUR PILLARS";
  const pillarsTitle = aboutData?.pillars_title || "Why Connoisseurs Choose DREAM CAR HOUSE";
  const pillarsList =
    aboutData?.pillars && aboutData.pillars.length > 0
      ? aboutData.pillars
      : [
          {
            id: "1",
            icon_key: "globe",
            title: "Direct Global Import",
            description:
              "Exclusive relationships with premier authorized dealerships in Stuttgart, Tokyo, and London facilitate direct, turnkey container importation with verified manifests.",
            order: 1,
          },
          {
            id: "2",
            icon_key: "check",
            title: "150+ Point Diagnostic Audit",
            description:
              "Every vehicle undergoes exhaustive computerized diagnostic scans, chassis laser measurements, high-voltage battery audits, and genuine BRTA paper verifications.",
            order: 2,
          },
          {
            id: "3",
            icon_key: "vault",
            title: "Private Handover Vault",
            description:
              "An exclusive soundproof delivery sanctuary featuring theatrical automotive unveilings, champagne reception, and confidential documentation management.",
            order: 3,
          },
          {
            id: "4",
            icon_key: "concierge",
            title: "White-Glove Concierge",
            description:
              "Lifetime vehicle documentation support, tailored financing advisory, genuine factory parts procurement, and guaranteed priority buy-back valuations.",
            order: 4,
          },
        ];

  const ctaTitle = aboutData?.cta_title || "Experience The Difference in Person";
  const ctaDesc =
    aboutData?.cta_description ||
    "Schedule an exclusive showroom walkthrough or speak directly with our senior automotive curators to discuss custom procurement of your next masterpiece.";
  const ctaPrimaryLabel = aboutData?.cta_primary_label || "Explore Current Inventory";
  const ctaSecondaryLabel = aboutData?.cta_secondary_label || "Schedule Showroom Tour";
  const ctaWhatsappLabel = aboutData?.cta_whatsapp_label || "Inquire on WhatsApp";

  return (
    <div className="about-page-wrap">
      {/* 1. Cinematic Hero Header */}
      <section className="about-hero-section">
        <div className="about-pill-badge">
          {heroBadge}
        </div>
        <h1 className="about-main-title">
          {heroTitle}
        </h1>
        <p className="about-hero-sub">
          {heroSubtitle}
        </p>
      </section>

      {/* 2. Key Showroom Trust Metrics */}
      <section className="about-stats-grid" aria-label="Showroom Key Metrics">
        {statsList.map((st, idx) => {
          let val = st.number;
          if (val === "{branches}") {
            val = String(branches.length || 2);
          }
          return (
            <div key={st.id || idx} className="about-stat-card">
              <div className="about-stat-num">{val}</div>
              <div className="about-stat-label">{st.label}</div>
            </div>
          );
        })}
      </section>

      {/* 3. Split Editorial Heritage Story with Interactive Showroom Reel */}
      <section className="about-story-split">
        {/* Interactive Showroom Reel Player Card */}
        <div
          className="about-reel-card group"
          onClick={() => openVideoModal(reelVideoTarget)}
          title={`Click to Watch DREAM CAR HOUSE 4K Showroom Cinematic Reel: ${reelTitle}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openVideoModal(reelVideoTarget);
            }
          }}
        >
          <Image
            src={reelImageUrl}
            alt="DREAM CAR HOUSE Flagship Luxury Showroom Floor"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority
            unoptimized={reelImageUrl.startsWith("http")}
          />
          <div className="about-reel-overlay"></div>

          {/* Central Pulsing Play Button */}
          <div className="about-reel-play-center">
            <div className="about-play-circle" aria-label="Play Reel">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="7 4 20 12 7 20 7 4" />
              </svg>
            </div>
            <span className="about-play-label">WATCH SHOWROOM REEL</span>
          </div>

          {/* Bottom Bar Info */}
          <div className="about-reel-bottom">
            <span className="about-reel-title-sub">{reelTitle}</span>
            <span className="about-reel-duration-pill">{reelDuration}</span>
          </div>
        </div>

        {/* Editorial Text */}
        <div className="about-story-text">
          <span className="about-story-eyebrow">{storyEyebrow}</span>
          <h2 className="about-story-title">
            {storyTitle}
          </h2>
          <p className="about-story-p">
            {storyP1}
          </p>
          {storyP2 && (
            <p className="about-story-p">
              {storyP2}
            </p>
          )}

          {quoteText && (
            <div className="about-quote-box">
              <p>&ldquo;{quoteText}&rdquo;</p>
              {quoteAuthor && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#d4af37", fontWeight: 600 }}>
                  — {quoteAuthor}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="see-video-btn"
            onClick={() => openVideoModal(tourVideoTarget)}
            style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}
          >
            <div className="video-play-circle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </div>
            <span>{tourCtaLabel}</span>
          </button>
        </div>
      </section>

      {/* 4. The 4 Pillars of Showroom Distinction */}
      <section className="about-pillars-section">
        <div className="about-section-header">
          <span className="about-story-eyebrow">{pillarsEyebrow}</span>
          <h2 className="about-section-title">{pillarsTitle}</h2>
        </div>

        <div className="about-pillars-grid">
          {pillarsList.map((p, idx) => (
            <div key={p.id || idx} className="about-pillar-card">
              <div className="about-pillar-icon">
                {renderPillarIcon(p.icon_key || p.icon || "")}
              </div>
              <h3 className="about-pillar-title">{p.title}</h3>
              <p className="about-pillar-desc">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Physical Showroom Sanctuaries in Dhaka */}
      <section className="about-branches-section">
        <div className="about-section-header">
          <span className="about-story-eyebrow">VISIT OUR SHOWROOMS</span>
          <h2 className="about-section-title">Two Flagship Sanctuaries Across Dhaka</h2>
        </div>

        <div className="about-branches-grid">
          {((branches && branches.length > 0 ? branches : []) as PublicShowroomBranch[]).concat(
            (!branches || branches.length === 0)
              ? [
                  {
                    id: 1,
                    branch_id: "kakrail",
                    name: "Kakrail Flagship Showroom",
                    short_name: "Kakrail Branch",
                    tag: "PRIMARY SHOWROOM & VAULT",
                    address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
                    phone: "01615-121312",
                    hotline: "+880 1615-121312",
                    email: "dreamcarhouse101@gmail.com",
                    hours: "Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)",
                    map_link: "https://maps.google.com/?q=Kakrail,Dhaka",
                    embed_map: "https://maps.google.com/maps?output=embed",
                    order: 1,
                    status: "PUBLISHED",
                    features: ["Main Display Floor", "Private Handover Vault", "Diagnostic Lab"],
                  },
                  {
                    id: 2,
                    branch_id: "gulshan",
                    name: "Gulshan Avenue Lounge",
                    short_name: "Gulshan Branch",
                    tag: "BOUTIQUE CONSULTATION DESK",
                    address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
                    phone: "01615-121312",
                    hotline: "+880 1615-121312",
                    email: "dreamcarhouse101@gmail.com",
                    hours: "Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)",
                    map_link: "https://maps.google.com/?q=House+07+Road+127+Gulshan+Avenue+Dhaka",
                    embed_map: "https://maps.google.com/maps?output=embed",
                    order: 2,
                    status: "PUBLISHED",
                    features: ["Executive Consultation", "Bespoke Custom Orders", "VIP Coffee Bar"],
                  },
                ]
              : []
          ).map((br: PublicShowroomBranch) => {
            const isGulshan = String(br.name).toLowerCase().includes("gulshan");
            const defaultFeatures: string[] = isGulshan
              ? ["Executive Consultation", "Bespoke Custom Orders", "VIP Coffee Bar"]
              : ["Main Display Floor", "Private Handover Vault", "Diagnostic Lab"];
            const features = br.features && br.features.length > 0 ? br.features : defaultFeatures;
            const tag = br.tag || (isGulshan ? "BOUTIQUE CONSULTATION DESK" : "PRIMARY SHOWROOM & VAULT");
            const mapHref = br.map_link || `https://maps.google.com/?q=${encodeURIComponent(br.address)}`;
            const phone = br.phone || br.hotline || "01615-121312";

            return (
              <div key={br.id} className="about-branch-card">
                <div>
                  <span className="about-branch-tag">{tag}</span>
                  <h3 className="about-branch-name">{br.name}</h3>
                  <p className="about-branch-address">{br.address}</p>

                  <div className="about-branch-features">
                    {features.map((feat: string, fIdx: number) => (
                      <span key={fIdx} className="about-branch-pill">
                        {feat}
                      </span>
                    ))}
                  </div>

                  <div className="about-branch-timing">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{br.hours}</span>
                  </div>
                </div>

                <div className="about-branch-actions">
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-dir-btn"
                  >
                    <span>Get Directions</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="about-call-btn">
                    <span>{phone}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5.5 Across Socials & Press / People Talk About Us (Real Deliveries & Press Spotlights) */}
      {peopleTalks && peopleTalks.length > 0 && (
        <SocialFeatures items={peopleTalks} />
      )}

      {/* 6. VIP Consultation Concierge CTA with Glowing WhatsApp Button */}
      <section className="about-cta-card">
        <h2 className="about-cta-title">
          {ctaTitle}
        </h2>
        <p className="about-cta-desc">
          {ctaDesc}
        </p>

        <div className="about-cta-btn-group">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="about-wa-btn"
              id="about-wa-consult-btn"
              title="Chat directly with Senior Showroom Concierge on WhatsApp"
            >
              <svg viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{ctaWhatsappLabel}</span>
            </a>
          )}

          <Link
            href="/inventory"
            className="consult-primary-btn"
            style={{ padding: "0.9rem 2rem", fontSize: "0.95rem" }}
          >
            <span>{ctaPrimaryLabel}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <button
            type="button"
            className="gallery-btn-secondary"
            onClick={() => openAppointmentModal()}
            style={{ padding: "0.9rem 2rem", fontSize: "0.95rem", cursor: "pointer" }}
          >
            <span>{ctaSecondaryLabel}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
