"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import type { PublicSiteSettings, PublicShowroomBranch } from "@/lib/types";

export default function NavDrawer({
  settings,
}: {
  settings?: PublicSiteSettings | null;
  branches?: PublicShowroomBranch[] | null;
} = {}) {
  const { isDrawerOpen, closeDrawer, openAppointmentModal, openCompareModal } = useUI();
  const logoSrc = settings?.logo || "/assets/dch-logo.webp";
  const rawWa = settings?.whatsapp || settings?.hotline || "8801615121312";
  const waNumber = rawWa.replace(/[^\d]/g, "") || "8801615121312";

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock background scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const categoryColumns = [
    {
      num: "01",
      title: "BRAND NEW",
      sub: "Zero Mileage Global Imports",
      href: "/inventory?type=BRAND_NEW",
      badge: "EXCLUSIVE",
    },
    {
      num: "02",
      title: "RECONDITIONED",
      sub: "Premium Flagship SUVs & Sedans",
      href: "/inventory?type=RECONDITIONED",
      badge: "SHOWROOM",
    },
    {
      num: "03",
      title: "PRE-OWNED",
      sub: "150-Point Certified Selection",
      href: "/inventory?type=PRE_OWNED",
      badge: "VERIFIED",
    },
    {
      num: "04",
      title: "COMPARE CARS",
      sub: "Side-by-Side Spec Analyzer",
      action: "compare" as const,
      badge: "ATELIER",
    },
  ];

  const mainLinks = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Gallery & Media", href: "/gallery" },
    { label: "Sell Your Luxury Car", href: "/sell" },
    { label: "About Us", href: "/about" },
    { label: "Location & Contact", href: "/contact" },
  ];

  return (
    <div
      id="megaOverlay"
      className={`mega-menu-overlay ${isDrawerOpen ? "is-open" : ""}`}
      aria-hidden={!isDrawerOpen}
    >
      {/* Blurred Backdrop */}
      <div
        className="mega-menu-backdrop"
        onClick={closeDrawer}
        aria-label="Close menu"
      />

      {/* Dual Staircase Container */}
      <div className="mega-menu-staircase">
        {/* Left Stair Panel: 4 Full-Height Category Columns (Desktop) */}
        <div className="stair-left-panel">
          {categoryColumns.map((cat, idx) =>
            cat.action === "compare" ? (
              <button
                key={cat.title}
                type="button"
                className={`stair-cat-col stair-col-${idx + 1}`}
                onClick={() => {
                  closeDrawer();
                  openCompareModal();
                }}
              >
                <div className="stair-col-inner">
                  <div className="stair-col-top">
                    <span className="stair-col-num">{cat.num}</span>
                    <span className="stair-col-badge">{cat.badge}</span>
                  </div>
                  <div className="stair-col-bottom">
                    <h3 className="stair-col-title">{cat.title}</h3>
                    <p className="stair-col-sub">{cat.sub}</p>
                    <div className="stair-col-arrow">
                      <span>Explore</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <Link
                key={cat.title}
                href={cat.href || "/inventory"}
                className={`stair-cat-col stair-col-${idx + 1}`}
                onClick={closeDrawer}
              >
                <div className="stair-col-inner">
                  <div className="stair-col-top">
                    <span className="stair-col-num">{cat.num}</span>
                    <span className="stair-col-badge">{cat.badge}</span>
                  </div>
                  <div className="stair-col-bottom">
                    <h3 className="stair-col-title">{cat.title}</h3>
                    <p className="stair-col-sub">{cat.sub}</p>
                    <div className="stair-col-arrow">
                      <span>Explore</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>

        {/* Right Stair Panel: Fixed Frosted Drawer */}
        <aside className="stair-right-drawer" aria-label="Main Navigation">
          {/* Header Row: Brand Logo & Circular Close Button */}
          <div className="stair-drawer-header">
            <Link href="/" onClick={closeDrawer} className="stair-drawer-logo">
              <Image
                src={logoSrc}
                alt="DREAM CAR HOUSE Logo"
                width={1020}
                height={350}
                className="stair-logo-img"
                unoptimized
              />
            </Link>
            <button
              type="button"
              className="stair-close-btn"
              onClick={closeDrawer}
              aria-label="Close menu"
              title="Close Menu (ESC)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Main Navigation Links */}
          <nav className="stair-nav-links">
            {mainLinks.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeDrawer}
                className="stair-nav-link"
                style={{ transitionDelay: `${0.18 + i * 0.04}s` }}
              >
                <span className="stair-link-title">{item.label}</span>
                <span className="stair-link-arrow">→</span>
              </Link>
            ))}
          </nav>

          {/* Mobile 2x2 Category Grid (< 1024px) */}
          <div className="stair-mobile-grid">
            <span className="stair-mobile-grid-label">COLLECTIONS</span>
            <div className="stair-grid-cards">
              <Link href="/inventory?type=BRAND_NEW" onClick={closeDrawer} className="stair-grid-card">
                <span>BRAND NEW</span>
                <span className="stair-card-chevron">→</span>
              </Link>
              <Link href="/inventory?type=RECONDITIONED" onClick={closeDrawer} className="stair-grid-card">
                <span>RECONDITIONED</span>
                <span className="stair-card-chevron">→</span>
              </Link>
              <Link href="/inventory?type=PRE_OWNED" onClick={closeDrawer} className="stair-grid-card">
                <span>PRE-OWNED</span>
                <span className="stair-card-chevron">→</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  openCompareModal();
                }}
                className="stair-grid-card"
              >
                <span>COMPARE CARS</span>
                <span className="stair-card-chevron">→</span>
              </button>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="stair-drawer-ctas">
            <button
              type="button"
              className="stair-cta-book"
              onClick={() => {
                closeDrawer();
                openAppointmentModal();
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>BOOK VIP VIEWING</span>
            </button>
            <a
              href={`https://wa.me/${waNumber}?text=Hello%20DREAM%20CAR%20HOUSE,%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20vehicle`}
              target="_blank"
              rel="noopener noreferrer"
              className="stair-cta-wa"
              title="Chat on WhatsApp"
              aria-label="WhatsApp Concierge"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1 .587 1.78.893 2.806.893 3.182 0 5.768-2.586 5.768-5.766.001-3.181-2.585-5.776-5.768-5.776zm3.435 8.163c-.144.404-.836.774-1.17.822-.311.045-.71.07-2.13-.518-1.815-.751-2.986-2.59-3.077-2.711-.091-.121-.739-.984-.739-1.877 0-.893.469-1.332.636-1.514.167-.182.365-.228.487-.228.122 0 .243.002.35.007.112.005.263-.042.412.315.152.365.518 1.265.564 1.356.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.284.814 1.466.905.182.091.289.076.395-.045.106-.121.456-.531.577-.713.121-.182.243-.152.41-.091.167.061 1.062.5 1.244.591.182.091.304.136.35.212.045.076.045.44-.099.844zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.957-1.399C8.414 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
            </a>
          </div>

          {/* Drawer Footer: Socials & Copyright */}
          <div className="stair-drawer-footer">
            <div className="stair-socials">
              <a
                href={settings?.social_media?.facebook || "https://facebook.com/dreamcarhouse"}
                target="_blank"
                rel="noopener noreferrer"
                className="stair-social-icon"
                aria-label="Facebook"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href={settings?.social_media?.instagram || "https://instagram.com/dreamcarhouse"}
                target="_blank"
                rel="noopener noreferrer"
                className="stair-social-icon"
                aria-label="Instagram"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href={settings?.social_media?.youtube || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="stair-social-icon"
                aria-label="YouTube"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                </svg>
              </a>
            </div>
            <span className="stair-copyright">
              © {new Date().getFullYear()} {settings?.name || "DREAM CAR HOUSE"}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
