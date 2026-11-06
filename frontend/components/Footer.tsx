"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SHOWROOM_BRANCHES } from "@/lib/showroomData";
import { useUI } from "@/lib/UIContext";
import type { PublicSiteSettings, PublicShowroomBranch } from "@/lib/types";

export default function Footer({
  settings,
  branches,
}: {
  settings?: PublicSiteSettings;
  branches?: PublicShowroomBranch[];
} = {}) {
  const { openCompareModal } = useUI();
  const [activeBranch, setActiveBranch] = useState<"kakrail" | "gulshan">("kakrail");

  // Fallback branch config
  const kakrailBranch =
    branches?.find((b) => b.branch_id === "kakrail") || SHOWROOM_BRANCHES["kakrail"];
  const gulshanBranch =
    branches?.find((b) => b.branch_id === "gulshan") || SHOWROOM_BRANCHES["gulshan"];

  const currentBranch = activeBranch === "kakrail" ? kakrailBranch : gulshanBranch;

  const hotline = settings?.hotline || "01615-121312";
  const email = settings?.email || "dreamcarhouse101@gmail.com";
  const hours = settings?.opening_hours_text || "Sat – Thu: 10:00 AM – 9:00 PM";
  const tagline = settings?.footer_tagline || "Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka.";
  const fbUrl = settings?.social_media?.facebook || "https://facebook.com";
  const igUrl = settings?.social_media?.instagram || "https://instagram.com";
  const ytUrl = settings?.social_media?.youtube || "https://youtube.com";

  // WhatsApp configuration
  const rawWa = settings?.whatsapp || settings?.social_media?.whatsapp || hotline;
  const waClean = rawWa.replace(/[^0-9]/g, "");
  let waNumber = waClean;
  if (waNumber.startsWith("0")) {
    waNumber = "88" + waNumber;
  } else if (!waNumber.startsWith("880") && waNumber.length === 10) {
    waNumber = "880" + waNumber;
  }
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        "Hello DREAM CAR HOUSE VIP Concierge, I would like to inquire about your luxury vehicle collection."
      )}`
    : "https://wa.me/8801615121312";

  return (
    <footer className="site-footer" id="contact">
      <div className="luxury-container px-4 sm:px-6 lg:px-8">
        {/* VIP Top Concierge Ribbon */}
        <div className="footer-vip-ribbon">
          <div className="footer-ribbon-left">
            <span className="ribbon-badge">VIP CONCIERGE</span>
            <span className="ribbon-text">
              Private Showroom Viewing & Nationwide Enquiries:{" "}
              <a href={`tel:${hotline.replace(/[^0-9]/g, "")}`} className="ribbon-hotline">
                {hotline}
              </a>
            </span>
          </div>

          <div className="footer-ribbon-right">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-wa-chat-btn"
              aria-label="Chat on WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1 .587 1.78.893 2.806.893 3.182 0 5.768-2.586 5.768-5.766.001-3.181-2.585-5.776-5.768-5.776zm3.435 8.163c-.144.404-.836.774-1.17.822-.311.045-.71.07-2.13-.518-1.815-.751-2.986-2.59-3.077-2.711-.091-.121-.739-.984-.739-1.877 0-.893.469-1.332.636-1.514.167-.182.365-.228.487-.228.122 0 .243.002.35.007.112.005.263-.042.412.315.152.365.518 1.265.564 1.356.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.284.814 1.466.905.182.091.289.076.395-.045.106-.121.456-.531.577-.713.121-.182.243-.152.41-.091.167.061 1.062.5 1.244.591.182.091.304.136.35.212.045.076.045.44-.099.844zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.957-1.399C8.414 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Main 3-Column Luxury Architecture */}
        <div className="footer-grid-3col">
          {/* Col 1: Brand & Contact Info */}
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
                    filter:
                      "drop-shadow(0 2px 10px rgba(0,0,0,0.85)) drop-shadow(0 0 14px rgba(255,255,255,0.15))",
                  }}
                  unoptimized
                />
              </Link>
            </div>

            <p className="footer-brand-tagline">{tagline}</p>

            <ul className="contact-list">
              <li className="contact-item">
                <svg
                  className="contact-icon text-amber-400"
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
                  <strong>Kakrail Flagship</strong>: 18, Shaheed Captain Monsur Ali Soroni, Kakrail
                  <br />
                  <strong>Gulshan Lounge</strong>: House #07, Road #127, Gulshan Avenue
                </span>
              </li>

              <li className="contact-item">
                <svg
                  className="contact-icon text-amber-400"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href={`tel:${hotline.replace(/[^0-9]/g, "")}`} className="contact-link font-semibold">
                  {hotline}
                </a>
              </li>

              <li className="contact-item">
                <svg
                  className="contact-icon text-amber-400"
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
                <a href={`mailto:${email}`} className="contact-link">
                  {email}
                </a>
              </li>

              <li className="contact-item">
                <svg
                  className="contact-icon text-emerald-400"
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
                  {hours} <span className="status-open-pill">Showroom Open</span>
                </span>
              </li>
            </ul>

            {/* Official Social Media Brand Pills with Authentic Colors */}
            <div className="footer-social-section">
              <span className="footer-social-title">Follow Our Marque</span>
              <div className="footer-social-row">
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dream Car House on Facebook"
                  className="social-pill social-fb"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>

                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dream Car House on Instagram"
                  className="social-pill social-ig"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>

                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dream Car House on YouTube"
                  className="social-pill social-yt"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Showroom Google Map (Interactive Branch Tabs) */}
          <div className="footer-col-map">
            <div className="map-col-header">
              <h3 className="footer-heading" style={{ marginBottom: "0.25rem" }}>
                Showroom Flagships
              </h3>
              <span className="map-subtitle">
                {activeBranch === "kakrail"
                  ? "Kakrail Flagship • 18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka"
                  : "Gulshan Lounge • House #07, Road #127, Gulshan Avenue, Dhaka"}
              </span>
            </div>

            <div className="footer-branch-tabs">
              <button
                type="button"
                className={`footer-branch-tab ${activeBranch === "kakrail" ? "active" : ""}`}
                onClick={() => setActiveBranch("kakrail")}
              >
                Kakrail Flagship
              </button>
              <button
                type="button"
                className={`footer-branch-tab ${activeBranch === "gulshan" ? "active" : ""}`}
                onClick={() => setActiveBranch("gulshan")}
              >
                Gulshan Lounge
              </button>
            </div>

            <div className="map-embed-wrapper-modern">
              <iframe
                src={currentBranch.embed_map}
                loading="lazy"
                title={`DREAM CAR HOUSE Showroom Location - ${currentBranch.name}`}
                allowFullScreen
              />
              <div className="map-glow-border"></div>
            </div>

            <div className="map-actions-row">
              <a
                href={currentBranch.map_link}
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

          {/* Col 3: Curated Luxury Shortcut Links */}
          <div className="footer-col-links">
            <h3 className="footer-heading">Curated Discovery</h3>
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
                <Link href="/sell">
                  <span className="shortcut-arrow">›</span> Sell Your Luxury Car
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCompareModal}
                  style={{
                    color: "inherit",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span className="shortcut-arrow">›</span> Compare Vehicles
                </button>
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
                <Link href="/about">
                  <span className="shortcut-arrow">›</span> Showroom Heritage & Vision
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Clean Luxury Bottom Copyright Bar (Plain Back to Top link replaced by Floating Supercar) */}
        <div className="footer-bottom-modern">
          <div className="footer-copy-text">
            © {new Date().getFullYear()} <strong>DREAM CAR HOUSE</strong>. All rights reserved. Kakrail & Gulshan, Dhaka, Bangladesh.
          </div>
          <div className="footer-sub-links">
            <span className="footer-sub-label">Confidential Private Concierge Advisory</span>
            <span className="sep">•</span>
            <Link href="/about" className="footer-sub-link">
              Showroom Heritage
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
