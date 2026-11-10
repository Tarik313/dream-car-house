"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import type { PublicSiteSettings, PublicShowroomBranch } from "@/lib/types";
import { parseShowroomHours } from "@/lib/utils/openingHours";

export default function NavDrawer({
  settings,
  branches,
}: {
  settings?: PublicSiteSettings | null;
  branches?: PublicShowroomBranch[] | null;
} = {}) {
  const { isDrawerOpen, closeDrawer, openAppointmentModal } = useUI();
  const rawHours =
    settings?.opening_hours_text ||
    branches?.[0]?.hours ||
    "Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)";
  const phone = settings?.hotline || branches?.[0]?.phone || "01615-121312";
  const logoSrc = settings?.logo || "/assets/dch-logo.webp";

  const [isOpen, setIsOpen] = useState(true);
  const [displayHours, setDisplayHours] = useState("10:00 AM – 10:00 PM");

  useEffect(() => {
    const evaluateStatus = () => {
      const parsed = parseShowroomHours(rawHours);
      setIsOpen(parsed.isOpen);
      setDisplayHours(parsed.displayHours);
    };

    evaluateStatus();
    const interval = setInterval(evaluateStatus, 30000);
    return () => clearInterval(interval);
  }, [rawHours]);

  return (
    <>
      {/* Backdrop */}
      <div
        id="drawer-backdrop"
        className={`drawer-backdrop ${isDrawerOpen ? "active" : ""}`}
        onClick={closeDrawer}
        aria-hidden={!isDrawerOpen}
      />

      {/* Aside Drawer */}
      <aside
        id="nav-drawer"
        className={`nav-drawer ${isDrawerOpen ? "open" : ""}`}
        aria-label="VIP Showroom Navigation"
      >
        {/* Animated Supercar Banner */}
        <div className="drawer-supercar-banner">
          <Image
            src="/assets/supercar_menu_car.jpg"
            alt="DREAM CAR HOUSE Hypercar"
            width={480}
            height={200}
            className="supercar-banner-img"
            priority
          />
          <div className="supercar-headlight-beam"></div>
          <div className="supercar-banner-overlay">
            <div className="supercar-brand-row">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <Image
                  src={logoSrc}
                  alt="DREAM CAR HOUSE Logo"
                  width={1020}
                  height={350}
                  style={{
                    height: "46px",
                    width: "auto",
                    maxWidth: "240px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.9)) drop-shadow(0 0 12px rgba(255,255,255,0.2))",
                  }}
                  unoptimized
                />
                <span className="drawer-brand-sub">
                  Premier Luxury Automotive Showroom • Kakrail & Gulshan
                </span>
              </div>
            </div>
            <div className="supercar-badge-pill">
              <span className="pulse-spark"></span>
              <span>HYPERCAR SHOWROOM VAULT</span>
            </div>
          </div>
          <button
            className="drawer-close-btn"
            onClick={closeDrawer}
            aria-label="Close Navigation"
            title="Close Menu (ESC)"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="drawer-nav-container">
          <span className="drawer-section-label">SHOWROOM DIRECTORY</span>

          <ul className="drawer-nav-list">
            <li>
              <Link href="/" onClick={closeDrawer} className="drawer-nav-item">
                <div className="drawer-item-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <span className="drawer-item-title">SHOWROOM HOME</span>
                <span className="drawer-item-arrow">→</span>
              </Link>
            </li>

            <li>
              <Link href="/inventory" onClick={closeDrawer} className="drawer-nav-item">
                <div className="drawer-item-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </div>
                <span className="drawer-item-title">COMPLETE INVENTORY</span>
                <span className="drawer-item-arrow">→</span>
              </Link>
            </li>

            <li>
              <Link href="/gallery" onClick={closeDrawer} className="drawer-nav-item">
                <div className="drawer-item-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <span className="drawer-item-title">SHOWROOM GALLERY & MEDIA</span>
                <span className="drawer-item-arrow">→</span>
              </Link>
            </li>

            <li>
              <Link href="/sell" onClick={closeDrawer} className="drawer-nav-item">
                <div className="drawer-item-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                    <path d="M12 18V6"></path>
                  </svg>
                </div>
                <span className="drawer-item-title">SELL YOUR LUXURY CAR</span>
                <span className="drawer-item-arrow">→</span>
              </Link>
            </li>

            <li>
              <Link href="/about" onClick={closeDrawer} className="drawer-nav-item">
                <div className="drawer-item-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <span className="drawer-item-title">ABOUT US</span>
                <span className="drawer-item-arrow">→</span>
              </Link>
            </li>

            <li>
              <Link href="/contact" onClick={closeDrawer} className="drawer-nav-item">
                <div className="drawer-item-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <span className="drawer-item-title">LOCATION & CONTACT</span>
                <span className="drawer-item-arrow">→</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Drawer Footer: Live Concierge Card & Quick Actions */}
        <div className="drawer-footer-card">
          <div className="drawer-live-status">
            <span className={`drawer-status-dot ${isOpen ? "open" : "closed"}`}></span>
            <span className={`drawer-status-text ${isOpen ? "status-open" : "status-closed"}`}>
              {isOpen
                ? `SHOWROOM OPEN TODAY • ${displayHours}`
                : `SHOWROOM CLOSED NOW • ${displayHours}`}
            </span>
          </div>

          <div className="drawer-concierge-phone">
            <span className="drawer-phone-label">VIP Concierge Line</span>
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="drawer-phone-val">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "4px" }}
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {phone}
            </a>
          </div>

          <div className="drawer-cta-group">
            <button
              className="drawer-consult-btn"
              onClick={() => {
                closeDrawer();
                openAppointmentModal();
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Book VIP Viewing</span>
            </button>

            <a
              href="https://wa.me/8801615121312?text=Hello%20DREAM%20CAR%20HOUSE,%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20vehicle"
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-wa-btn"
              title="Chat on WhatsApp"
              aria-label="WhatsApp Concierge"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1 .587 1.78.893 2.806.893 3.182 0 5.768-2.586 5.768-5.766.001-3.181-2.585-5.776-5.768-5.776zm3.435 8.163c-.144.404-.836.774-1.17.822-.311.045-.71.07-2.13-.518-1.815-.751-2.986-2.59-3.077-2.711-.091-.121-.739-.984-.739-1.877 0-.893.469-1.332.636-1.514.167-.182.365-.228.487-.228.122 0 .243.002.35.007.112.005.263-.042.412.315.152.365.518 1.265.564 1.356.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.284.814 1.466.905.182.091.289.076.395-.045.106-.121.456-.531.577-.713.121-.182.243-.152.41-.091.167.061 1.062.5 1.244.591.182.091.304.136.35.212.045.076.045.44-.099.844zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.957-1.399C8.414 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
