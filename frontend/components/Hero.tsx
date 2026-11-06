"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUI } from "@/lib/UIContext";
import type { PublicHeroSlider, PublicHeroCta } from "@/lib/types";

interface HeroProps {
  initialData?: PublicHeroSlider | null;
}

export default function Hero({ initialData }: HeroProps = {}) {
  const { theme, openAppointmentModal } = useUI();

  const heading = initialData?.heading;
  const ctaButtons: PublicHeroCta[] = initialData?.cta_buttons || [];

  return (
    <section
      className={`hero-showcase-section ${theme === "dark" ? "theme-dark" : "theme-light"}`}
      id="hero-section"
      aria-label="DREAM CAR HOUSE Flagship Luxury Showroom"
    >
      {/* ================= Dual Showroom Background Images (Day vs Night) ================= */}
      <div className="hero-bg-container" aria-hidden="true">
        {/* Night Showroom */}
        <div className={`hero-bg-layer hero-bg-night ${theme === "dark" ? "is-active" : "is-inactive"}`}>
          <Image
            src="/assets/dch-night-showroom.webp"
            alt="DREAM CAR HOUSE Night Luxury Showroom - Pinnacle of Luxury Automobiles"
            fill
            priority
            unoptimized
            className="hero-bg-image"
          />
        </div>

        {/* Day Showroom */}
        <div className={`hero-bg-layer hero-bg-day ${theme === "light" ? "is-active" : "is-inactive"}`}>
          <Image
            src="/assets/dch-day-showroom.webp"
            alt="DREAM CAR HOUSE Day Luxury Showroom - Pinnacle of Luxury Automobiles"
            fill
            priority
            unoptimized
            className="hero-bg-image"
          />
        </div>
      </div>

      {heading ? (
        <div className="hero-content">
          <h1 className="hero-title sr-only">{heading}</h1>
          {ctaButtons.length > 0 && (
            <div className="hero-pills">
              {ctaButtons.map((btn, index) => {
                if (btn.action === "appointment_modal") {
                  return (
                    <button
                      key={index}
                      className="hero-pill-btn"
                      onClick={() => openAppointmentModal()}
                    >
                      {btn.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={index}
                    className="hero-pill-btn"
                    href={btn.destination || "/"}
                  >
                    {btn.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
