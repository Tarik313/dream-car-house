"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import type { PublicSiteSettings } from "@/lib/types";

export default function Header({ settings }: { settings?: PublicSiteSettings } = {}) {
  const { isDrawerOpen, openDrawer, closeDrawer, isStoriesOpen, openStories, theme, toggleTheme } = useUI();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const brandName = settings?.name || "DREAM CAR HOUSE";
  const isDayMode = theme === "light";
  const logoSrc = isDayMode
    ? (settings?.logo_light || settings?.logo || "/assets/dch-logo.webp")
    : (settings?.logo || "/assets/dch-logo.webp");
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

  const handleWheelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDrawerOpen) {
      closeDrawer();
      return;
    }

    // Trigger instant burnout spin animation
    setIsSpinning(true);

    // Open hypercar drawer immediately for zero-lag responsive feel
    openDrawer();

    setTimeout(() => {
      setIsSpinning(false);
    }, 800);
  };

  const shouldHide = isHidden && !isDrawerOpen && !isStoriesOpen;

  return (
    <header
      className={`header ${isScrolled ? "header-scrolled" : ""} ${shouldHide ? "header-hidden" : ""}`}
    >
      <div className="header-container">
        {/* Left: Luxury Showroom Stories Ring Button (No Text Beside It) */}
        <div style={{ display: "inline-flex", alignItems: "center", background: "transparent", border: "none" }}>
          <button
            className="header-story-ring-btn"
            id="header-story-btn"
            onClick={openStories}
            title={`Watch ${brandName} VIP Showroom Stories & Highlights`}
            aria-label="Open Showroom Stories"
          >
            <div className="story-ring-border">
              <div className="story-ring-inner">
                <svg
                  className="steering-wheel-icon"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="steerRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="35%" stopColor="#475569" />
                      <stop offset="70%" stopColor="#334155" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                    <linearGradient id="steerSpokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f1f5f9" />
                      <stop offset="50%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                    <radialGradient id="steerHubGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="70%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                  </defs>

                  {/* Left & Right Paddle Shifters (behind wheel) */}
                  <path d="M12 34 C8 41 8 51 12 60 L17 58 C14 51 14 43 17 36 Z" fill="#cbd5e1" opacity="0.95" />
                  <text x="12.5" y="49" fill="#0f172a" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">-</text>

                  <path d="M88 34 C92 41 92 51 88 60 L83 58 C86 51 86 43 83 36 Z" fill="#cbd5e1" opacity="0.95" />
                  <text x="84" y="49" fill="#0f172a" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">+</text>

                  {/* Outer Steering Wheel Rim (Sport Grip) */}
                  <circle cx="50" cy="50" r="41" stroke="url(#steerRimGrad)" strokeWidth="9.5" />
                  <circle cx="50" cy="50" r="45.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none" />
                  <circle cx="50" cy="50" r="36" stroke="rgba(0,0,0,0.9)" strokeWidth="1.2" fill="none" />

                  {/* 12 O'Clock Racing Center Alignment Stripe */}
                  <path d="M46.5 4.5 A45.5 45.5 0 0 1 53.5 4.5 L52.8 14 A36 36 0 0 0 47.2 14 Z" fill="#facc15" />

                  {/* 3-Spoke Architecture */}
                  {/* Left Horizontal Spoke */}
                  <path d="M36 46 L14 46 C14 53 15 55 16 56 L36 54 Z" fill="url(#steerSpokeGrad)" />
                  <rect x="20" y="47.5" width="9" height="3.5" rx="1.5" fill="#0f172a" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

                  {/* Right Horizontal Spoke */}
                  <path d="M64 46 L86 46 C86 53 85 55 84 56 L64 54 Z" fill="url(#steerSpokeGrad)" />
                  <rect x="71" y="47.5" width="9" height="3.5" rx="1.5" fill="#0f172a" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

                  {/* Bottom Vertical Spoke (Twin Blade Skeleton) */}
                  <path d="M45.5 63 L43.5 86 C47 87 53 87 56.5 86 L54.5 63 Z" fill="url(#steerSpokeGrad)" />
                  <circle cx="50" cy="74.5" r="3" fill="#090d16" />

                  {/* Center Hub Bezel & Golden Star Crest */}
                  <circle cx="50" cy="50" r="15" fill="url(#steerHubGrad)" stroke="#facc15" strokeWidth="1.8" />
                  <circle cx="50" cy="50" r="11" fill="#0a0e17" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                  
                  {/* Star Crest */}
                  <path d="M50 43.5 L51.8 48.2 L56.5 50 L51.8 51.8 L50 56.5 L48.2 51.8 L43.5 50 L48.2 48.2 Z" fill="#facc15" />

                  {/* Ferrari-style Manettino Drive Mode Dial */}
                  <circle cx="61.5" cy="59.5" r="3.2" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Center Logo (Strictly Centered Original Image) */}
        <div className="header-logo">
          <Link href="/" className="header-logo-link" aria-label={`${brandName} Homepage`}>
            <Image
              src={logoSrc}
              alt={`${brandName} Logo`}
              width={1020}
              height={350}
              className="header-brand-logo-img"
              priority
              unoptimized
            />
          </Link>
        </div>

        {/* Right Corner: Theme Toggle & 3D Wheel Menu Trigger */}
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

          {/* 3D Photorealistic Supercar Wheel Trigger */}
          <div style={{ position: "relative" }}>
            <button
              className={`header-wheel-trigger ${isSpinning ? "wheel-spinning" : ""} ${isDrawerOpen ? "menu-active" : ""}`}
              id="header-menu-btn"
              onClick={handleWheelClick}
              aria-label="Open Luxury Showroom Menu"
              title="Click to Spin Wheel & Launch Supercar Menu"
            >
              <div className="wheel-disc-wrapper">
                <Image
                  src="/assets/supercar_wheel.png"
                  alt="Supercar Forged Wheel"
                  width={54}
                  height={54}
                  className="realistic-wheel-img"
                  priority
                />
                <div className="wheel-light-sweep"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
