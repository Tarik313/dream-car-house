"use client";

import React from "react";
import Link from "next/link";
import { useUI } from "@/lib/UIContext";
import type { PublicConsultationSection } from "@/lib/types";

export default function ConnectConsult({
  consultation,
}: {
  consultation?: PublicConsultationSection | null;
} = {}) {
  const { openAppointmentModal } = useUI();

  const tag = consultation?.tag || "PRIVATE AUTOMOTIVE CONCIERGE";
  const heading = consultation?.heading || "Connect to Consult";
  const description =
    consultation?.description ||
    "Our dedicated automotive advisors offer bespoke consultations—whether you seek an exclusive allocation, custom reconditioned import, or confidential valuation for your vehicle trade-in.";

  const defaultTrustPills = [
    { title: "1-on-1 Dedicated Specialist", icon: "specialist" },
    { title: "VIP Handover Lounge Access", icon: "vip" },
    { title: "Confidential Valuation & Quota", icon: "shield" },
  ];
  const trustPills =
    consultation?.trust_pills && consultation.trust_pills.length > 0
      ? consultation.trust_pills
      : defaultTrustPills;

  const primaryLabel =
    consultation?.primary_cta_label || "Book Private Appointment";
  const primaryAction =
    consultation?.primary_cta_action || "appointment_modal";
  const primaryUrl = consultation?.primary_cta_url || "/appointment";

  const waLabel = consultation?.whatsapp_cta_label || "Chat on WhatsApp";
  const waUrl =
    consultation?.whatsapp_url ||
    "https://wa.me/8801615121312?text=Hello%20Dream%20Car%20House,%20I%20would%20like%20to%20consult%20regarding%20a%20luxury%20vehicle.";

  const beaconText =
    consultation?.status_beacon_text ||
    "Showroom Open Today • Kakrail & Gulshan, Dhaka";

  const renderPillIcon = (iconType: string) => {
    if (iconType === "vip" || iconType === "star") {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    if (iconType === "shield" || iconType === "valuation") {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    }
    // Default specialist / user icon
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      </svg>
    );
  };

  return (
    <section className="connect-consult-section" id="connect-consult">
      <div className="luxury-container px-4 sm:px-6 lg:px-8">
        <div className="consult-concept-card concept-card-1">
          <div className="concept-1-grid">
            <div className="concept-1-left">
              <span className="consult-pill-tag">{tag}</span>
              <h2 className="consult-heading">{heading}</h2>
              <p className="consult-paragraph">{description}</p>

              <div className="consult-trust-pills">
                {trustPills.map((pill, idx) => (
                  <div key={idx} className="trust-pill-item">
                    {renderPillIcon(pill.icon)}
                    <span>{pill.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="concept-1-right">
              <div className="consult-actions-box">
                {primaryAction === "appointment_modal" ? (
                  <button className="consult-primary-btn" onClick={() => openAppointmentModal()}>
                    <span>{primaryLabel}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <Link href={primaryUrl} className="consult-primary-btn">
                    <span>{primaryLabel}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="consult-whatsapp-btn"
                  title={waLabel}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>{waLabel}</span>
                </a>
                <div className="consult-status-beacon">
                  <span className="beacon-pulse"></span>
                  <span className="beacon-text">{beaconText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
