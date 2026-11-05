"use client";

import React, { useState, useEffect, useRef } from "react";

export default function FloatingSupercarTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down 280px
      const shouldShow = window.scrollY > 280;
      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLaunchToTop = () => {
    if (isLaunching) return;

    setIsLaunching(true);

    // Smooth luxury scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Reset launch physics animation after scroll duration
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsLaunching(false);
    }, 1100);
  };

  if (!isVisible && !isLaunching) return null;

  return (
    <div
      className={`floating-supercar-wrapper ${isVisible ? "is-visible" : "is-hidden"} ${
        isLaunching ? "is-launching" : ""
      }`}
      onClick={handleLaunchToTop}
      role="button"
      tabIndex={0}
      aria-label="Launch to top of page"
      title="Launch Hypercar to Top"
    >
      {/* Dynamic Speed Streaks / Road Velocity Lines during Launch */}
      <div className="supercar-speed-trails" aria-hidden="true">
        <span className="trail-line t1"></span>
        <span className="trail-line t2"></span>
        <span className="trail-line t3"></span>
      </div>

      {/* Circular Glowing Carbon Bezel */}
      <div className="supercar-launch-disc">
        {/* Dual Rear Exhaust Nitro Flames (ignites on click) */}
        <div className="supercar-nitro-flames" aria-hidden="true">
          <div className="nitro-flame left-flame"></div>
          <div className="nitro-flame right-flame"></div>
        </div>

        {/* Hypercar Top-Down Aerodynamic Silhouette SVG (pointing UP towards top) */}
        <svg
          className="supercar-actor-svg"
          viewBox="0 0 48 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="carBodyGrad" x1="0" y1="0" x2="48" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#cbd5e1" />
              <stop offset="65%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="windshieldGrad" x1="24" y1="20" x2="24" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0a0a0c" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="headlightBeam" cx="50%" cy="0%" r="90%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Forward Projector Headlight Beams */}
          <polygon points="12,14 4,0 20,0" fill="url(#headlightBeam)" opacity="0.85" />
          <polygon points="36,14 28,0 44,0" fill="url(#headlightBeam)" opacity="0.85" />

          {/* Aerodynamic Carbon Rear Diffuser / Wing */}
          <rect x="10" y="70" width="28" height="4" rx="2" fill="#090d16" stroke="#facc15" strokeWidth="0.8" />
          <rect x="6" y="65" width="36" height="3" rx="1.5" fill="#1e293b" />

          {/* Rear Wheels */}
          <rect x="4" y="52" width="6" height="15" rx="3" fill="#050608" stroke="#334155" strokeWidth="0.8" />
          <rect x="38" y="52" width="6" height="15" rx="3" fill="#050608" stroke="#334155" strokeWidth="0.8" />

          {/* Front Wheels */}
          <rect x="5" y="16" width="6" height="13" rx="3" fill="#050608" stroke="#334155" strokeWidth="0.8" />
          <rect x="37" y="16" width="6" height="13" rx="3" fill="#050608" stroke="#334155" strokeWidth="0.8" />

          {/* Main Sculpted Monocoque Chassis */}
          <path
            d="M24 6 C17 6 12 14 11 24 C10 32 12 40 10 50 C9 57 8 62 10 68 C13 70 35 70 38 68 C40 62 39 57 38 50 C36 40 38 32 37 24 C36 14 31 6 24 6 Z"
            fill="url(#carBodyGrad)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.2"
          />

          {/* Cockpit Canopy / Windshield */}
          <path
            d="M24 22 C18 22 16 28 15 36 C14 44 16 52 16 54 C18 55 30 55 32 54 C32 52 34 44 33 36 C32 28 30 22 24 22 Z"
            fill="url(#windshieldGrad)"
            stroke="#facc15"
            strokeWidth="0.8"
          />

          {/* Carbon Roof Spine & Golden Crest */}
          <line x1="24" y1="23" x2="24" y2="54" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
          <circle cx="24" cy="12" r="1.8" fill="#facc15" />

          {/* Dual LED Headlight Strips */}
          <line x1="12" y1="13" x2="16" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="13" x2="32" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

          {/* Rear Neon Red LED Taillight Bar */}
          <line x1="14" y1="67" x2="34" y2="67" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Ambient Pulsing Golden Ring */}
        <div className="supercar-glow-ring"></div>
      </div>

      {/* Subtle Speed HUD / Top Pill */}
      <span className="supercar-hud-label">
        <span className="hud-arrow">↑</span> TOP
      </span>
    </div>
  );
}
