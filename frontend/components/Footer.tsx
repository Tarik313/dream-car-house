"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SHOWROOM_BRANCHES } from "@/lib/showroomData";
import { useUI } from "@/lib/UIContext";

export default function Footer({
  settings,
  branches,
}: {
  settings?: unknown;
  branches?: unknown;
} = {}) {
  const { openCompareModal } = useUI();
  const [activeBranch, setActiveBranch] = useState<"kakrail" | "gulshan">("kakrail");

  const branch = SHOWROOM_BRANCHES[activeBranch];

  return (
    <footer className="site-footer" id="contact">
      <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="footer-grid-3col">
          {/* Col 1: Contact Info */}
          <div className="footer-col-contact">
            <div style={{ marginBottom: "1.1rem" }}>
              <Link href="/" aria-label="DREAM CAR HOUSE Homepage">
                <Image
                  src="/assets/dch-logo.webp"
                  alt="DREAM CAR HOUSE Logo"
                  width={1020}
                  height={350}
                  style={{
                    height: "60px",
                    width: "auto",
                    maxWidth: "280px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.85)) drop-shadow(0 0 14px rgba(255,255,255,0.15))",
                  }}
                  unoptimized
                />
              </Link>
            </div>
            <p className="footer-brand-tagline">
              Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka.
            </p>

            <ul className="contact-list">
              <li className="contact-item">
                <svg
                  className="contact-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  <strong>Kakrail Branch (Main)</strong>: 18, Shaheed Captain Monsur Ali Soroni, Kakrail
                  <br />
                  <strong>Gulshan Branch</strong>: House #07, Road #127, Gulshan Avenue
                </span>
              </li>
              <li className="contact-item">
                <svg
                  className="contact-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href="tel:01615-121312" className="contact-link">
                  01615-121312
                </a>
              </li>
              <li className="contact-item">
                <svg
                  className="contact-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href="mailto:dreamcarhouse101@gmail.com" className="contact-link">
                  dreamcarhouse101@gmail.com
                </a>
              </li>
              <li className="contact-item">
                <svg
                  className="contact-icon"
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
                <span>
                  Sat – Thu: 10:00 AM – 9:00 PM <span className="status-open-pill">Open</span>
                </span>
              </li>
            </ul>

            <div className="footer-social-row">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-pill"
              >
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
                <span>Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-pill"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>Instagram</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="social-pill"
              >
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* Col 2: Showroom Google Map (Interactive Tabs) */}
          <div className="footer-col-map">
            <div className="map-col-header">
              <h3 className="footer-heading" style={{ marginBottom: "0.25rem" }}>
                Showroom Locations
              </h3>
              <span className="map-subtitle">
                {activeBranch === "kakrail"
                  ? "Kakrail Branch • 18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka"
                  : "Gulshan Branch • House #07, Road #127, Gulshan Avenue, Dhaka"}
              </span>
            </div>
            <div className="footer-branch-tabs">
              <button
                type="button"
                className={`footer-branch-tab ${activeBranch === "kakrail" ? "active" : ""}`}
                onClick={() => setActiveBranch("kakrail")}
              >
                Kakrail Branch (Main)
              </button>
              <button
                type="button"
                className={`footer-branch-tab ${activeBranch === "gulshan" ? "active" : ""}`}
                onClick={() => setActiveBranch("gulshan")}
              >
                Gulshan Branch
              </button>
            </div>
            <div className="map-embed-wrapper-modern">
              <iframe
                src={branch.embed_map}
                loading="lazy"
                title={`DREAM CAR HOUSE Showroom Location - ${branch.name}`}
                allowFullScreen
              />
              <div className="map-glow-border"></div>
            </div>
            <div className="map-actions-row">
              <a
                href={branch.map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="map-directions-btn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>Get Live Directions</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 3: Shortcut Links */}
          <div className="footer-col-links">
            <h3 className="footer-heading">Shortcut Links</h3>
            <ul className="footer-shortcut-list">
              <li>
                <Link href="/">
                  <span className="shortcut-arrow">›</span> Home Showcase
                </Link>
              </li>
              <li>
                <Link href="/inventory">
                  <span className="shortcut-arrow">›</span> Complete Inventory
                </Link>
              </li>
              <li>
                <Link href="/gallery">
                  <span className="shortcut-arrow">›</span> Showroom Gallery & Media
                </Link>
              </li>
              <li>
                <Link href="/#connect-consult">
                  <span className="shortcut-arrow">›</span> VIP Concierge Lounge
                </Link>
              </li>
              <li>
                <Link href="/#brand-runway-section">
                  <span className="shortcut-arrow">›</span> Prestigious Marques
                </Link>
              </li>
              <li>
                <Link href="/#experience">
                  <span className="shortcut-arrow">›</span> VIP Showroom Experience
                </Link>
              </li>
              <li>
                <Link href="/sell">
                  <span className="shortcut-arrow">›</span> Sell Your Luxury Car
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCompareModal}
                  style={{ color: "inherit", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                >
                  <span className="shortcut-arrow">›</span> Compare Vehicles
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="footer-bottom-modern">
          <div className="footer-copy-text">
            © 2026 <strong>DREAM CAR HOUSE</strong>. All rights reserved. Kakrail & Gulshan, Dhaka, Bangladesh.
          </div>
          <div className="footer-sub-links">
            <span className="footer-sub-label">
              Confidential Private Concierge Advisory
            </span>
            <span className="sep">•</span>
            <Link href="/about" className="footer-sub-link">
              Showroom Heritage
            </Link>
            <span className="sep">•</span>
            <a href="#hero-section" className="back-to-top-link">
              Back to Top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
