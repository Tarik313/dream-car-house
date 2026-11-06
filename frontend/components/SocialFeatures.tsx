"use client";

import React from "react";
import Image from "next/image";
import type { PublicPeopleTalk } from "@/lib/types";

export default function SocialFeatures({
  items = [],
}: {
  items?: PublicPeopleTalk[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="social-features-section" style={{ padding: "4rem 0", background: "rgba(5, 7, 10, 0.8)", borderTop: "1px solid rgba(255, 255, 255, 0.06)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
      <div className="max-w-7xl" style={{ margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span
            className="preference-badge"
            style={{
              display: "inline-block",
              marginBottom: "0.5rem",
              background: "rgba(56, 189, 248, 0.12)",
              borderColor: "rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
            }}
          >
            ACROSS SOCIALS & PRESS
          </span>
          <h2
            className="section-h2"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: "0.5rem",
            }}
          >
            People Talk About Us
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: "34rem", margin: "0 auto" }}>
            Authentic client handovers, media spotlights, and hypercar delivery celebrations across our Kakrail & Gulshan lounges.
          </p>
        </div>

        {/* Grid of Social Feature Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {items.map((item, idx) => {
            const imageSrc = item.image && item.image.trim() ? item.image : "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80";
            const cardContent = (
              <div
                style={{
                  background: "rgba(13, 15, 20, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                className="group hover:scale-[1.02] hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-500/5"
              >
                {/* Image */}
                <div style={{ position: "relative", width: "100%", height: "220px", background: "#0a0c10" }}>
                  <Image
                    src={imageSrc}
                    alt={item.title || "Showroom Delivery Spotlight"}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(13, 15, 20, 0.9) 0%, transparent 50%)",
                    }}
                  />
                  {item.is_featured && (
                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "rgba(217, 119, 6, 0.9)",
                        color: "#ffffff",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      ★ FEATURED
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.4,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {item.title}
                  </h3>

                  {item.url ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#38bdf8",
                        marginTop: "auto",
                      }}
                    >
                      <span>Explore Spotlight</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Showroom Archive</span>
                  )}
                </div>
              </div>
            );

            return item.url ? (
              <a
                key={item.id ?? idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                {cardContent}
              </a>
            ) : (
              <div key={item.id ?? idx}>{cardContent}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

