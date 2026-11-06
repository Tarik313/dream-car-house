import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "8rem 1.5rem 4rem",
      }}
    >
      <span className="preference-badge" style={{ marginBottom: "1rem" }}>
        STATUS 404 • ROUTE UNRESOLVED
      </span>
      <h1 style={{ fontSize: "2.75rem", fontWeight: 800, color: "#ffffff", marginBottom: "1rem" }}>
        Vehicle Route Not Found
      </h1>
      <p style={{ color: "#9ca3af", maxWidth: "480px", lineHeight: "1.7", marginBottom: "2rem" }}>
        The vehicle record or showroom destination you requested does not exist or has been relocated within the DREAM CAR HOUSE atelier.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="consult-primary-btn" style={{ padding: "0.85rem 1.75rem" }}>
          <span>Return to Showroom Home</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <Link href="/inventory" className="gallery-btn-secondary" style={{ padding: "0.85rem 1.75rem" }}>
          <span>Explore All Inventory →</span>
        </Link>
      </div>
    </div>
  );
}
