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
  const { isDrawerOpen, closeDrawer, openAppointmentModal, openCompareModal, theme } = useUI();
  const isDayMode = theme === "light";
  const logoSrc = isDayMode
    ? (settings?.logo_light || settings?.logo || "/assets/dch-logo.webp")
    : (settings?.logo || "/assets/dch-logo.webp");
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
      href: "/inventory/?type=BRAND_NEW",
    },
    {
      num: "02",
      title: "RECONDITIONED",
      href: "/inventory/?type=RECONDITIONED",
    },
    {
      num: "03",
      title: "PRE-OWNED",
      href: "/inventory/?type=PRE_OWNED",
    },
    {
      num: "04",
      title: "COMPARE CARS",
      action: "compare" as const,
    },
  ];

  const mainLinks = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory/" },
    { label: "Gallery & Media", href: "/gallery/" },
    { label: "Sell Your Luxury Car", href: "/sell/" },
    { label: "About Us", href: "/about/" },
    { label: "Location & Contact", href: "/contact/" },
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
                  </div>
                  <div className="stair-col-middle">
                    <h3 className="stair-col-title">{cat.title}</h3>
                  </div>
                  <div className="stair-col-bottom">
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
                href={cat.href || "/inventory/"}
                prefetch={true}
                className={`stair-cat-col stair-col-${idx + 1}`}
                onClick={closeDrawer}
              >
                <div className="stair-col-inner">
                  <div className="stair-col-top">
                    <span className="stair-col-num">{cat.num}</span>
                  </div>
                  <div className="stair-col-middle">
                    <h3 className="stair-col-title">{cat.title}</h3>
                  </div>
                  <div className="stair-col-bottom">
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
                prefetch={true}
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
              <Link href="/inventory/?type=BRAND_NEW" prefetch={true} onClick={closeDrawer} className="stair-grid-card">
                <span>BRAND NEW</span>
                <span className="stair-card-chevron">→</span>
              </Link>
              <Link href="/inventory/?type=RECONDITIONED" prefetch={true} onClick={closeDrawer} className="stair-grid-card">
                <span>RECONDITIONED</span>
                <span className="stair-card-chevron">→</span>
              </Link>
              <Link href="/inventory/?type=PRE_OWNED" prefetch={true} onClick={closeDrawer} className="stair-grid-card">
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
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
