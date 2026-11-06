"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import type { PublicVipSanctuarySection } from "@/lib/types";

export default function VipSanctuary({
  sanctuary,
}: {
  sanctuary?: PublicVipSanctuarySection | null;
} = {}) {
  const { openAppointmentModal, openVideoModal } = useUI();

  const location =
    sanctuary?.location_text ||
    "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000";
  const hours =
    sanctuary?.hours_text ||
    "Daily 10:00 AM – 10:00 PM (Private Viewings by Reservation)";
  const hotline = sanctuary?.phone_text || "01615-121312";
  const waUrl =
    sanctuary?.whatsapp_url ||
    `https://wa.me/8801615121312?text=Hello%20DREAM%20CAR%20HOUSE,%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20vehicle`;

  const bgImage =
    sanctuary?.background_image ||
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2560&q=95";

  return (
    <section className="vip-sanctuary-section" id="sanctuary">
      <Image
        className="vip-sanctuary-bg"
        src={bgImage}
        alt="DREAM CAR HOUSE Showroom Atmosphere"
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
        loading="lazy"
      />
      <div className="vip-sanctuary-overlay"></div>

      <div className="vip-sanctuary-container luxury-container px-4 sm:px-6 lg:px-8">
        <div className="vip-sanctuary-grid">
          {/* Left Column: Editorial Invitation & Value Pillars */}
          <div className="vip-sanctuary-narrative">
            <div className="vip-sanctuary-eyebrow">
              <span>KAKRAIL & GULSHAN • DHAKA</span>
            </div>

            <h2 className="vip-sanctuary-title">
              Step Into The Realm of <span className="vip-title-gold">Automotive Excellence</span>
            </h2>

            <p className="vip-sanctuary-desc">
              DREAM CAR HOUSE specializes in bringing you the finest selection of luxury cars from around the world. With a handpicked collection of the most prestigious brands, DREAM CAR HOUSE takes pride in offering only the highest quality vehicles that combine sophistication, performance, and innovation. Whether you&apos;re searching for a sleek sports coupe, a refined executive sedan, or an iconic luxury SUV, DREAM CAR HOUSE is your ultimate destination in Dhaka.
            </p>

            {/* Value Pillars Row */}
            <div className="vip-pillars-row">
              <div className="vip-pillar-item">
                <div className="vip-pillar-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div className="vip-pillar-info">
                  <span className="vip-pillar-title">100% Certified Provenance</span>
                  <span className="vip-pillar-sub">Verified mechanical inspection & auction grades</span>
                </div>
              </div>

              <div className="vip-pillar-item">
                <div className="vip-pillar-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="vip-pillar-info">
                  <span className="vip-pillar-title">Global Bespoke Sourcing</span>
                  <span className="vip-pillar-sub">Direct official imports from UK, DE & Japan</span>
                </div>
              </div>

              <div className="vip-pillar-item">
                <div className="vip-pillar-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="vip-pillar-info">
                  <span className="vip-pillar-title">White-Glove VIP Advisory</span>
                  <span className="vip-pillar-sub">Personalized acquisition & dedicated concierge</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="vip-actions-row">
              <button className="vip-primary-btn" onClick={() => openAppointmentModal()}>
                <span>Schedule Private Viewing</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <Link href="/inventory" className="vip-secondary-btn">
                <span>Browse Available Vault →</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Studio & Concierge Card */}
          <div className="vip-studio-card">
            <div className="vip-card-glow"></div>

            <div className="vip-card-head">
              <div>
                <span className="vip-card-badge">FLAGSHIP SHOWROOM</span>
                <h3 className="vip-card-title">DREAM CAR HOUSE Flagship</h3>
              </div>
              <div className="vip-live-pill">
                <span>OPEN TODAY</span>
              </div>
            </div>

            <div className="vip-studio-features">
              <div className="vip-feature-row">
                <div className="vip-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="vip-feature-text">
                  <span className="vip-feat-label">Showroom Location</span>
                  <span className="vip-feat-val">{location}</span>
                </div>
              </div>

              <div className="vip-feature-row">
                <div className="vip-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="vip-feature-text">
                  <span className="vip-feat-label">VIP Viewing Hours</span>
                  <span className="vip-feat-val">{hours}</span>
                </div>
              </div>

              <div className="vip-feature-row">
                <div className="vip-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="vip-feature-text">
                  <span className="vip-feat-label">Direct Concierge Hotline</span>
                  <a href={`tel:${hotline.replace(/\s+/g, "")}`} className="vip-feat-val vip-phone-link">
                    {hotline}
                  </a>
                </div>
              </div>
            </div>

            {/* Card Bottom Quick Connect Buttons */}
            <div className="vip-card-cta-group">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="vip-wa-btn"
                title="WhatsApp Concierge"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1 .587 1.78.893 2.806.893 3.182 0 5.768-2.586 5.768-5.766.001-3.181-2.585-5.776-5.768-5.776zm3.435 8.163c-.144.404-.836.774-1.17.822-.311.045-.71.07-2.13-.518-1.815-.751-2.986-2.59-3.077-2.711-.091-.121-.739-.984-.739-1.877 0-.893.469-1.332.636-1.514.167-.182.365-.228.487-.228.122 0 .243.002.35.007.112.005.263-.042.412.315.152.365.518 1.265.564 1.356.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.284.814 1.466.905.182.091.289.076.395-.045.106-.121.456-.531.577-.713.121-.182.243-.152.41-.091.167.061 1.062.5 1.244.591.182.091.304.136.35.212.045.076.045.44-.099.844zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.957-1.399C8.414 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
                <span>WhatsApp Concierge</span>
              </a>

              <button className="vip-tour-btn" onClick={() => openVideoModal("tour")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Showroom Tour</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
