import React from "react";

export default function CarDetailLoading() {
  return (
    <main className="dch-luxury-detail-page animate-pulse" aria-busy="true" aria-label="Loading vehicle specifications">
      {/* Luxury Breadcrumb Skeleton */}
      <div className="dch-detail-header-wrap" style={{ padding: "1.25rem 1rem", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ height: "14px", width: "220px", background: "rgba(255,255,255,0.08)", borderRadius: "4px" }} />
      </div>

      {/* Main Mosaic Gallery Skeleton */}
      <section className="dch-luxury-gallery-showcase" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
        <div className="dch-gallery-mosaic-grid" style={{ minHeight: "480px" }}>
          {/* Main Cinema Frame Skeleton */}
          <div
            className="dch-gallery-hero-frame"
            style={{
              background: "linear-gradient(135deg, #151518 0%, #1c1c21 100%)",
              borderRadius: "8px",
              minHeight: "480px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          </div>

          {/* Vignette Grid Skeleton */}
          <div className="dch-gallery-vignette-grid">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="dch-gallery-vignette-slot"
                style={{
                  background: "linear-gradient(135deg, #151518 0%, #1e1e24 100%)",
                  borderRadius: "6px",
                  minHeight: "115px",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Key Specs Bar Skeleton */}
      <div style={{ maxWidth: "1280px", margin: "1.5rem auto", padding: "0 1rem" }}>
        <div
          style={{
            height: "72px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
          }}
        />
      </div>

      {/* Title & Pricing Skeleton */}
      <div style={{ maxWidth: "1280px", margin: "2rem auto", padding: "0 1rem", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div>
          <div style={{ height: "32px", width: "60%", background: "rgba(255,255,255,0.08)", borderRadius: "6px", marginBottom: "1rem" }} />
          <div style={{ height: "20px", width: "40%", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "1.5rem" }} />
          <div style={{ height: "120px", width: "100%", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }} />
        </div>
        <div>
          <div style={{ height: "240px", width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }} />
        </div>
      </div>
    </main>
  );
}
