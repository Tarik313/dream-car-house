"use client";

import React, { useState } from "react";
import { SHOWROOM_BRANCHES } from "@/lib/showroomData";
import { useUI } from "@/lib/UIContext";
import { parseShowroomHours } from "@/lib/utils/openingHours";
import type { PublicShowroomBranch, PublicSiteSettings, PublicSalesRepresentative } from "@/lib/types";

export default function ContactClient({
  branches = [],
  settings,
  salesReps = [],
}: {
  branches?: PublicShowroomBranch[];
  settings?: PublicSiteSettings | null;
  salesReps?: PublicSalesRepresentative[];
} = {}) {
  const { openAppointmentModal } = useUI();

  // Active Branch Selection
  const defaultBranchId = branches[0]?.branch_id || "kakrail";
  const [activeTab, setActiveTab] = useState<string>(defaultBranchId);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("BUYING");
  const [preferredContact, setPreferredContact] = useState("WHATSAPP");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Branch data resolution
  const activeBranchList = branches && branches.length > 0 ? branches : [
    {
      id: 1,
      branch_id: "kakrail",
      name: SHOWROOM_BRANCHES.kakrail.name,
      short_name: SHOWROOM_BRANCHES.kakrail.short_name,
      tag: "MAIN FLAGSHIP SHOWROOM",
      address: SHOWROOM_BRANCHES.kakrail.address,
      phone: SHOWROOM_BRANCHES.kakrail.phone,
      hotline: SHOWROOM_BRANCHES.kakrail.phone,
      email: "dreamcarhouse101@gmail.com",
      hours: SHOWROOM_BRANCHES.kakrail.hours,
      embed_map: SHOWROOM_BRANCHES.kakrail.embed_map,
      map_link: SHOWROOM_BRANCHES.kakrail.map_link,
      order: 1,
      status: "PUBLISHED",
    },
    {
      id: 2,
      branch_id: "gulshan",
      name: SHOWROOM_BRANCHES.gulshan.name,
      short_name: SHOWROOM_BRANCHES.gulshan.short_name,
      tag: "GULSHAN AVENUE ATELIER",
      address: SHOWROOM_BRANCHES.gulshan.address,
      phone: SHOWROOM_BRANCHES.gulshan.phone,
      hotline: SHOWROOM_BRANCHES.gulshan.phone,
      email: "dreamcarhouse101@gmail.com",
      hours: SHOWROOM_BRANCHES.gulshan.hours,
      embed_map: SHOWROOM_BRANCHES.gulshan.embed_map,
      map_link: SHOWROOM_BRANCHES.gulshan.map_link,
      order: 2,
      status: "PUBLISHED",
    },
  ];

  const currentBranch =
    activeBranchList.find((b) => b.branch_id === activeTab) || activeBranchList[0];

  // Dynamic hours status
  const hoursText =
    currentBranch.hours ||
    settings?.opening_hours_text ||
    "Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)";
  const hoursState = parseShowroomHours(hoursText);

  // Settings values
  const corporateHotline = settings?.hotline || settings?.phone || "01615-121312";
  const corporateEmail = settings?.email || "dreamcarhouse101@gmail.com";
  const corporateWhatsapp = settings?.whatsapp || "8801615121312";

  let cleanWa = corporateWhatsapp.replace(/[^0-9]/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "88" + cleanWa;
  if (!cleanWa.startsWith("880") && cleanWa.length === 10) cleanWa = "880" + cleanWa;

  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    "Hello DREAM CAR HOUSE, I am inquiring about a luxury vehicle consultation."
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      setSubmitError("Please fill in your name, phone number, and message.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/v1/home/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          topic,
          preferred_contact: preferredContact,
          enquiry: message,
          vehicle: `${currentBranch.name} Inquiry`,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setName("");
        setPhone("");
        setEmail("");
        setMessage("");
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data?.detail || "Failed to submit message. Please try again or WhatsApp us directly.");
      }
    } catch {
      setSubmitError("Network connection error. Please contact us via WhatsApp directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inventory-page-wrap max-w-7xl">
      <div className="contact-page-container">
        {/* Page Header */}
        <div className="contact-header-wrap">
          <span className="contact-eyebrow-badge">OFFICIAL SHOWROOM DIRECTORY</span>
          <h1 className="contact-page-title">Contact & Showroom Locations</h1>
          <p className="contact-page-sub">
            Visit our state-of-the-art luxury showrooms or connect directly with our VIP executive sales concierge across Kakrail & Gulshan.
          </p>
        </div>

        {/* Dynamic Showroom Branch Cards Grid */}
        <div className="contact-branches-grid">
          {activeBranchList.map((branch) => {
            const isSelected = branch.branch_id === activeTab;
            const branchHours = branch.hours || hoursText;
            const branchState = parseShowroomHours(branchHours);

            return (
              <div
                key={branch.id || branch.branch_id}
                className={`contact-branch-card ${isSelected ? "active" : ""}`}
              >
                <div className="contact-card-top">
                  <span className="car-badge-pill pill-brandnew">
                    {branch.tag || "OFFICIAL SHOWROOM"}
                  </span>
                  <span className="contact-live-status">
                    <span
                      className="contact-status-dot"
                      style={{
                        background: branchState.isOpen ? "#10b981" : "#ef4444",
                      }}
                    ></span>
                    <span>{branchState.isOpen ? "OPEN TODAY" : "CLOSED NOW"}</span>
                  </span>
                </div>
                <h3 className="contact-branch-name">{branch.name}</h3>
                <p className="contact-branch-addr">{branch.address}</p>
                <div className="contact-meta-row">
                  <span className="contact-meta-label">Direct Hotline:</span>
                  <a href={`tel:${branch.phone}`} className="contact-meta-link">
                    {branch.phone}
                  </a>
                </div>
                <div className="contact-meta-row" style={{ marginBottom: "1.5rem" }}>
                  <span className="contact-meta-label">Showroom Hours:</span>
                  <span className="contact-meta-val">{branchHours}</span>
                </div>
                <div className="contact-card-actions">
                  <button
                    type="button"
                    className="consult-primary-btn"
                    onClick={() => openAppointmentModal({ branchId: branch.branch_id })}
                  >
                    <span>Book {branch.short_name || branch.name} Viewing</span>
                  </button>
                  <button
                    type="button"
                    className="gallery-btn-secondary"
                    onClick={() => setActiveTab(branch.branch_id)}
                  >
                    View on Map
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Google Map Section */}
        <div className="contact-map-card">
          <div className="contact-map-header">
            <h3 className="contact-map-title">Live Map: {currentBranch.name}</h3>
            <div className="footer-branch-tabs" style={{ margin: 0 }}>
              {activeBranchList.map((b) => (
                <button
                  key={b.branch_id}
                  type="button"
                  className={`footer-branch-tab ${activeTab === b.branch_id ? "active" : ""}`}
                  onClick={() => setActiveTab(b.branch_id)}
                >
                  {b.short_name || b.name}
                </button>
              ))}
            </div>
          </div>

          <div className="map-embed-wrapper-modern" style={{ height: "400px" }}>
            <iframe
              src={currentBranch.embed_map || "https://maps.google.com"}
              loading="lazy"
              title={`DREAM CAR HOUSE Location - ${currentBranch.name}`}
              allowFullScreen
            />
          </div>

          <div className="contact-map-footer">
            <span className="contact-map-addr-text">{currentBranch.address}</span>
            {currentBranch.map_link && (
              <a
                href={currentBranch.map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="map-directions-btn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>Get Live Directions</span>
              </a>
            )}
          </div>
        </div>

        {/* Global WhatsApp & Hotline Direct Contact Banner */}
        <div className="contact-banner-card">
          <div className="contact-banner-info">
            <h3 className="contact-banner-title">Connect with Corporate VIP Concierge</h3>
            <p className="contact-banner-desc">
              Official Hotline: <strong>{corporateHotline}</strong> • Email: <strong>{corporateEmail}</strong>
            </p>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="consult-whatsapp-btn"
            style={{ padding: "0.85rem 1.75rem" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1 .587 1.78.893 2.806.893 3.182 0 5.768-2.586 5.768-5.766.001-3.181-2.585-5.776-5.768-5.776zm3.435 8.163c-.144.404-.836.774-1.17.822-.311.045-.71.07-2.13-.518-1.815-.751-2.986-2.59-3.077-2.711-.091-.121-.739-.984-.739-1.877 0-.893.469-1.332.636-1.514.167-.182.365-.228.487-.228.122 0 .243.002.35.007.112.005.263-.042.412.315.152.365.518 1.265.564 1.356.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.284.814 1.466.905.182.091.289.076.395-.045.106-.121.456-.531.577-.713.121-.182.243-.152.41-.091.167.061 1.062.5 1.244.591.182.091.304.136.35.212.045.076.045.44-.099.844zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.957-1.399C8.414 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Dedicated Showroom Sales Representatives / Advisors */}
        {salesReps && salesReps.length > 0 && (
          <div className="contact-advisors-section" style={{ marginTop: "2rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <span className="car-badge-pill pill-brandnew" style={{ fontSize: "0.72rem", letterSpacing: "0.15em" }}>
                DIRECT SHOWROOM ADVISORY
              </span>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ffffff", marginTop: "0.4rem" }}>
                Dedicated Showroom Sales Advisors
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                Connect directly with our dedicated client representatives for private viewings and instant pricing assistance.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              {salesReps.map((rep, idx) => {
                const repPhoneClean = rep.phone_number.replace(/[^0-9]/g, "");
                const repWaUrl = `https://wa.me/${repPhoneClean}?text=${encodeURIComponent(
                  `Hello ${rep.name}, I am reaching out from DREAM CAR HOUSE website regarding a vehicle consultation.`
                )}`;
                return (
                  <div
                    key={rep.id || idx}
                    style={{
                      background: "rgba(18, 22, 30, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      padding: "1.25rem 1.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#ffffff" }}>{rep.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: 600, marginTop: "2px" }}>
                        Senior Client Advisor
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>
                        Direct: {rep.phone_number}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <a
                        href={`tel:${repPhoneClean}`}
                        title={`Call ${rep.name}`}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          textDecoration: "none",
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </a>
                      <a
                        href={repWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`WhatsApp ${rep.name}`}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          background: "#25D366",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          textDecoration: "none",
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1 .587 1.78.893 2.806.893 3.182 0 5.768-2.586 5.768-5.766.001-3.181-2.585-5.776-5.768-5.776zm3.435 8.163c-.144.404-.836.774-1.17.822-.311.045-.71.07-2.13-.518-1.815-.751-2.986-2.59-3.077-2.711-.091-.121-.739-.984-.739-1.877 0-.893.469-1.332.636-1.514.167-.182.365-.228.487-.228.122 0 .243.002.35.007.112.005.263-.042.412.315.152.365.518 1.265.564 1.356.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.284.814 1.466.905.182.091.289.076.395-.045.106-.121.456-.531.577-.713.121-.182.243-.152.41-.091.167.061 1.062.5 1.244.591.182.091.304.136.35.212.045.076.045.44-.099.844zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.957-1.399C8.414 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Direct Concierge Message Form */}
        <div className="contact-form-card" style={{ marginTop: "2rem", padding: "2.5rem", background: "rgba(18, 22, 30, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#ffffff" }}>
            Send a Confidential Message
          </h3>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            Our VIP sales directors respond promptly to vehicle acquisitions, custom imports, and valuation inquiries.
          </p>

          {submitSuccess ? (
            <div style={{ padding: "1.5rem", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "12px", color: "#10b981" }}>
              <h4 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Inquiry Received Successfully</h4>
              <p style={{ fontSize: "0.9rem" }}>Thank you. A dedicated automotive curator from DREAM CAR HOUSE will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Ahmed"
                  className="filter-search-input"
                  style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
                  Direct Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XX-XXXXXX"
                  className="filter-search-input"
                  style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="filter-search-input"
                  style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
                  Area of Interest
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="filter-select"
                  style={{ width: "100%", padding: "0.75rem 1rem", background: "#0b0f17", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                >
                  <option value="BUYING">Buying a Luxury Vehicle</option>
                  <option value="SELLING">Selling or Trading My Car</option>
                  <option value="AFTER_SALES">After-Sales & Warranty Service</option>
                  <option value="OTHER">Other VIP Corporate Inquiry</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.5rem" }}>
                  Your Message or Vehicle of Interest *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the vehicle you are interested in or any specific inquiry..."
                  style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff", resize: "vertical" }}
                />
              </div>

              {submitError && (
                <div style={{ gridColumn: "1 / -1", color: "#ef4444", fontSize: "0.9rem" }}>
                  {submitError}
                </div>
              )}

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="consult-primary-btn"
                  style={{ padding: "0.85rem 2rem", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  <span>{isSubmitting ? "Submitting..." : "Send Confidential Message"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
