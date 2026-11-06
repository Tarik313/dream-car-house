"use client";

import React from "react";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import type { PublicExperienceSection, PublicExperiencePillar } from "@/lib/types";

export default function ExperiencePillars({
  experience,
}: {
  experience?: PublicExperienceSection | null;
} = {}) {
  const { openAppointmentModal } = useUI();

  const title = experience?.title || "Inside Our Showrooms";
  const subtitle = experience?.subtitle || "Kakrail & Gulshan • Dhaka, Bangladesh";
  const ctaLabel = experience?.video_cta_label || "Schedule a Visit";

  const defaultPillars: PublicExperiencePillar[] = [
    {
      id: 1,
      pillar_number: "01",
      badge: "MAIN FLAGSHIP",
      title: "Kakrail Flagship Showroom",
      description: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka",
      image: "/assets/dch-night-showroom.webp",
      tags: ["Main Display Floor", "Handover Vault"],
      order: 1,
    },
    {
      id: 2,
      pillar_number: "02",
      badge: "GULSHAN AVENUE",
      title: "Gulshan Avenue Showroom",
      description: "House #07, Road #127, Gulshan Avenue, Dhaka",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85",
      tags: ["Executive Consultation", "VIP Coffee Bar"],
      order: 2,
    },
    {
      id: 3,
      pillar_number: "03",
      badge: "VIP SANCTUARY",
      title: "Private Handover Lounge",
      description: "Ceremonial Unveiling & VIP Delivery Suite",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85",
      tags: ["Soundproof Suite", "Ceremonial Reveal"],
      order: 3,
    },
  ];

  const pillars =
    experience?.pillars && experience.pillars.length > 0
      ? experience.pillars
      : defaultPillars;

  return (
    <section className="experience-section w-full" id="experience">
      <div className="luxury-container px-4 sm:px-6 lg:px-8">
        <div className="experience-header">
          <div className="experience-header-text">
            <h2 className="experience-title">{title}</h2>
            <p className="experience-subtitle">{subtitle}</p>
          </div>
          <div className="experience-header-action">
            <button
              type="button"
              className="experience-vip-consult-btn"
              onClick={() => openAppointmentModal({ carName: "Showroom Visit" })}
              aria-label={ctaLabel}
            >
              <span>{ctaLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="experience-btn-arrow">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Photo-First Showroom Showcase Grid */}
        <div className="showroom-showcase-grid">
          {pillars.map((pillar) => {
            const isGulshan = pillar.title.toLowerCase().includes("gulshan");
            const isKakrail = pillar.title.toLowerCase().includes("kakrail");
            const branchId = isGulshan ? "gulshan" : isKakrail ? "kakrail" : undefined;

            return (
              <div
                key={pillar.id}
                className="showroom-photo-card"
                onClick={() =>
                  openAppointmentModal({
                    branchId,
                    carName: `${pillar.title} Visit`,
                  })
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openAppointmentModal({
                      branchId,
                      carName: `${pillar.title} Visit`,
                    });
                  }
                }}
              >
                <div className="showroom-photo-wrap">
                  <Image
                    src={pillar.image || "/assets/dch-night-showroom.webp"}
                    alt={pillar.title}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="showroom-img"
                  />
                  <div className="showroom-photo-gradient"></div>
                  <span className="showroom-badge">
                    {pillar.badge || pillar.pillar_number || "FEATURE"}
                  </span>
                </div>
                <div className="showroom-card-footer">
                  <h3 className="showroom-card-title">{pillar.title}</h3>
                  <p className="showroom-card-addr">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
