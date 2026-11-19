"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import type { PublicSiteSettings } from "@/lib/types";

export default function Header({ settings }: { settings?: PublicSiteSettings } = {}) {
  const { isDrawerOpen, openDrawer, closeDrawer, theme, toggleTheme } = useUI();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const brandName = settings?.name || "DREAM CAR HOUSE";
  const isDayMode = theme === "light";
  const logoSrc = isDayMode
    ? (settings?.logo_light || settings?.logo || "/assets/dch-logo.webp")
    : (settings?.logo || "/assets/dch-logo.webp");
  const hasCustomMobileIcon = Boolean(
    isDayMode
      ? (settings?.logo_icon_light || settings?.logo_icon)
      : settings?.logo_icon
  );
  const mobileIconSrc = isDayMode
    ? (settings?.logo_icon_light || settings?.logo_icon || logoSrc)
    : (settings?.logo_icon || logoSrc);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          // Background blur threshold
          setIsScrolled(currentY > 20);

          // Smart Direction-Aware Scroll:
          // 1. Always visible near top of page
          if (currentY < 70) {
            setIsHidden(false);
          } else if (currentY > lastScrollYRef.current + 8) {
            // Scrolling down -> smoothly tuck away to maximize car viewing space
            setIsHidden(true);
          } else if (currentY < lastScrollYRef.current - 6) {
            // Scrolling up -> immediately reveal header for effortless navigation
            setIsHidden(false);
          }

          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldHide = isHidden && !isDrawerOpen;

  return (
    <header
      className={`header ${isScrolled ? "header-scrolled" : ""} ${shouldHide ? "header-hidden" : ""}`}
    >
      <div className="header-container">
        {/* Left Slot for perfect visual balance */}
        <div className="header-left-slot" aria-hidden="true" />

        {/* Center Logo (Desktop: Full Logo | Mobile: Compact Adaptive Icon/Emblem) */}
        <div className="header-logo">
          <Link href="/" className="header-logo-link" aria-label={`${brandName} Homepage`}>
            {/* Desktop / Tablet Full Brand Logo */}
            <Image
              src={logoSrc}
              alt={`${brandName} Logo`}
              width={1020}
              height={350}
              className="header-brand-logo-img header-logo-desktop"
              priority
              unoptimized
            />
            {/* Mobile Compact Adaptive Brand Icon */}
            <Image
              src={mobileIconSrc}
              alt={`${brandName} Mobile Icon`}
              width={120}
              height={120}
              className={`header-brand-logo-img header-logo-mobile ${
                hasCustomMobileIcon ? "header-logo-mobile-icon" : "header-logo-mobile-fallback"
              }`}
              priority
              unoptimized
            />
          </Link>
        </div>

        {/* Right Corner: Theme Toggle & Luxury 3-Line Hamburger Menu Trigger */}
        <div className="header-right-group">
          {/* Day / Night Smooth Luxury Toggle (Icon-Only Luxury Orb) */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`header-theme-toggle ${theme === "dark" ? "mode-dark" : "mode-light"}`}
            aria-label={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
            title={theme === "dark" ? "Switch to Day Mode (সূর্য)" : "Switch to Night Mode (চাঁদ)"}
            id="header-theme-btn"
          >
            {theme === "dark" ? (
              <svg className="theme-icon moon-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-3.37.73A8.15 8.15 0 0 1 9.08 5.49a8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36a10.14 10.14 0 1 0 14 11.69 1 1 0 0 0-.36-1.05z" />
              </svg>
            ) : (
              <svg className="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Bugatti-Style 2-Line Luxury Menu Trigger */}
          <button
            type="button"
            className={`header-hamburger-btn ${isDrawerOpen ? "is-active" : ""}`}
            id="header-menu-btn"
            onClick={isDrawerOpen ? closeDrawer : openDrawer}
            aria-label={isDrawerOpen ? "Close Luxury Showroom Menu" : "Open Luxury Showroom Menu"}
            title={isDrawerOpen ? "Close Menu" : "Open Menu"}
          >
            <span className="hamburger-box">
              <span className="hamburger-line line-1"></span>
              <span className="hamburger-line line-2"></span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
