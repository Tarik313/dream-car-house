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
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add background blur / border after 50px
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide header on scroll down, show on scroll up (after 120px)
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollYRef.current + 5) {
          setIsHidden(true); // scrolling down
        } else if (currentScrollY < lastScrollYRef.current - 5) {
          setIsHidden(false); // scrolling up
        }
      } else {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWheelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDrawerOpen) {
      closeDrawer();
      return;
    }

    // Trigger 1440° burnout spin animation
    setIsSpinning(true);

    // Open hypercar drawer after burnout spin reaches high speed
    setTimeout(() => {
      setIsSpinning(false);
      openDrawer();
    }, 1150);
  };

  const shouldHide = isHidden && !isDrawerOpen && !isStoriesOpen;

  return (
    <header
      className={`header ${isScrolled ? "header-scrolled" : ""} ${shouldHide ? "header-hidden" : ""}`}
    >
      <div className="header-container">
        {/* Left: Luxury Showroom Stories Ring Button */}
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
                  </defs>

                  {/* Outer Steering Rim */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="url(#steerRimGrad)"
                    strokeWidth="9"
                    strokeDasharray="4 2"
                  />
                  {/* Inner Rim Accent */}
                  <circle
                    cx="50"
                    cy="50"
                    r="37"
                    stroke="#0f172a"
                    strokeWidth="2.5"
                  />
                  {/* Central Boss / Horn Plate */}
                  <circle
                    cx="50"
                    cy="50"
                    r="15"
                    fill="#020617"
                    stroke="#d4af37"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="11"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <circle cx="50" cy="50" r="4.5" fill="#d4af37" />

                  {/* 3 Ergonomic Steering Spokes */}
                  {/* Left Spoke */}
                  <path
                    d="M35 50 L10 50"
                    stroke="url(#steerSpokeGrad)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Right Spoke */}
                  <path
                    d="M65 50 L90 50"
                    stroke="url(#steerSpokeGrad)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Bottom Center Spoke */}
                  <path
                    d="M50 65 L50 90"
                    stroke="url(#steerSpokeGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="story-btn-text-col">
              <span className="story-btn-label">STORIES</span>
              <span className="story-btn-sub">LIVE</span>
            </div>
          </button>
        </div>

        {/* Center: Brand Identity Logo */}
        <div className="header-logo-container">
          <Link href="/" className="header-logo-link" aria-label={`${brandName} Home`}>
            <div className="header-brand-wrap">
              <div className="header-brand-title">
                {brandName.includes(" ") ? (
                  <>
                    <span className="brand-word-1">{brandName.split(" ")[0]}</span>
                    <span className="brand-word-rest">
                      {brandName.substring(brandName.split(" ")[0].length)}
                    </span>
                  </>
                ) : (
                  <span>{brandName}</span>
                )}
              </div>
              <span className="header-brand-badge">
                SHOWROOM • KAKRAIL &amp; GULSHAN
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Theme Toggle & Burnout Alloy Wheel Menu Button */}
        <div className="header-right-actions">
          {/* Subtle VIP Theme Toggle (Dark / Light) */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to Cinematic Dark Mode" : "Switch to Executive Light Mode"}
            aria-label="Toggle Visual Theme"
          >
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          {/* Burnout Alloy Wheel Nav Launcher */}
          <div className="burnout-wheel-wrapper">
            <button
              className={`burnout-wheel-btn ${isSpinning ? "wheel-burnout-active" : ""} ${
                isDrawerOpen ? "wheel-open-state" : ""
              }`}
              id="header-menu-wheel-btn"
              onClick={handleWheelClick}
              title={isDrawerOpen ? "Close VIP Navigation" : "Explore VIP Navigation Menu"}
              aria-label={isDrawerOpen ? "Close Menu" : "Open Navigation"}
            >
              {/* Ceramic Disc Brake Calliper Glow */}
              <div className="brake-caliper-glow"></div>

              {/* Alloy Wheel Rim Graphic */}
              <div className="alloy-wheel-disc">
                <Image
                  src="/assets/supercar_wheel.png"
                  alt="Alloy Wheel Nav"
                  width={46}
                  height={46}
                  priority
                  className="alloy-wheel-img"
                  onError={(e) => {
                    // Fallback to stylized SVG if PNG is unavailable
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>

              {/* Burnout Smoke Particle Rings */}
              {isSpinning && (
                <div className="burnout-smoke-emitter">
                  <span className="smoke-ring smoke-ring-1"></span>
                  <span className="smoke-ring smoke-ring-2"></span>
                  <span className="smoke-ring smoke-ring-3"></span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
