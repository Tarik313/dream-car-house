"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";

import { submitAppointmentEnquiryAction } from "@/app/actions/appointment";

export default function AppointmentModal({
  settings,
  branches,
}: {
  settings?: any;
  branches?: any;
} = {}) {
  const { isAppointmentOpen, closeAppointmentModal, appointmentPrefill } = useUI();
  const logoSrc = settings?.logo || "/assets/dch-logo.webp";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("Brand New & Reconditioned Import");
  const [branch, setBranch] = useState("kakrail");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (appointmentPrefill.carName) {
      setNotes(`Interested in ${appointmentPrefill.carName} (${appointmentPrefill.carYear || 2024})`);
    }
    if (appointmentPrefill.branchId) {
      setBranch(appointmentPrefill.branchId);
    }
    setSubmitted(false);
  }, [appointmentPrefill, isAppointmentOpen]);

  if (!isAppointmentOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    submitAppointmentEnquiryAction({
      fullName,
      phone,
      interest,
      branch,
      date,
      notes,
    }).catch(() => {});
  };

  const branchLabel =
    branch === "kakrail"
      ? "Kakrail Branch (18, Shaheed Captain Monsur Ali Soroni)"
      : "Gulshan Branch (House #07, Road #127, Gulshan Avenue)";

  const waAppointmentMsg = encodeURIComponent(
    `Hello DREAM CAR HOUSE Concierge,\n\nI would like to schedule a VIP Private Consultation.\n\n• Name: ${fullName}\n• Phone: ${phone}\n• Interest: ${interest}\n• Showroom Branch: ${branchLabel}\n• Preferred Date: ${date || "Earliest Available"}\n• Notes: ${notes || "General VIP Tour"}`
  );
  const waAppointmentUrl = `https://wa.me/8801615121312?text=${waAppointmentMsg}`;

  return (
    <div className="car-modal-backdrop active" onClick={closeAppointmentModal}>
      <div className="car-modal-box appointment-modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-x"
          onClick={closeAppointmentModal}
          aria-label="Close Consultation Modal"
          title="Close (ESC)"
        >
          &times;
        </button>

        <div className="appointment-modal-head">
          <div style={{ marginBottom: "0.85rem" }}>
            <Image
              src={logoSrc}
              alt="DREAM CAR HOUSE"
              width={1020}
              height={350}
              style={{
                height: "44px",
                width: "auto",
                maxWidth: "220px",
                objectFit: "contain",
              }}
              unoptimized
            />
          </div>
          <span className="consult-pill-tag">VIP SHOWROOM RESERVATION</span>
          <h3 className="appointment-modal-title">Book A Private Consultation</h3>
          <p className="appointment-modal-sub">
            Experience dedicated automotive advisory across our Kakrail and Gulshan showrooms.
          </p>
        </div>

        {!submitted ? (
          <form id="appointment-form" onSubmit={handleSubmit} className="appointment-form-grid">
            <div className="form-group">
              <label htmlFor="appt-name">Full Name *</label>
              <input
                type="text"
                id="appt-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Asif Mahmud"
                className="appt-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="appt-phone">Phone / WhatsApp Number *</label>
              <input
                type="tel"
                id="appt-phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1XXX-XXXXXX"
                className="appt-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="appt-interest">Consultation Interest</label>
              <select
                id="appt-interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="appt-input appt-select"
              >
                <option value="Brand New & Reconditioned Import">Brand New & Reconditioned Import</option>
                <option value="Certified Pre-Owned Selection">Certified Pre-Owned Selection</option>
                <option value="Sell / Trade-In Valuation">Sell / Trade-In Valuation</option>
                <option value="General Showroom VIP Tour">General Showroom VIP Tour</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appt-branch">Showroom Branch</label>
              <select
                id="appt-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="appt-input appt-select"
              >
                <option value="kakrail">Kakrail Branch (18, Shaheed Captain Monsur Ali Soroni)</option>
                <option value="gulshan">Gulshan Branch (House #07, Road #127, Gulshan Avenue)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appt-date">Preferred Date</label>
              <input
                type="date"
                id="appt-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="appt-input"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="appt-notes">Specific Vehicle or Query (Optional)</label>
              <input
                type="text"
                id="appt-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Interested in Mercedes G 580 or Land Cruiser 250"
                className="appt-input"
              />
            </div>

            <div className="form-actions full-width">
              <button
                type="submit"
                className="consult-primary-btn"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <span>Confirm VIP Appointment</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          <div className="suite-success-message" style={{ display: "block", marginTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Appointment Request Prepared!
              </h4>
            </div>

            <p style={{ color: "#d1d5db", fontSize: "0.92rem", lineHeight: "1.6", marginBottom: "1.25rem" }}>
              Thank you, <strong>{fullName}</strong>. Your consultation details for{" "}
              <strong>{branchLabel}</strong> have been recorded in this browser session.
            </p>

            {/* Note on static export integration */}
            <div
              style={{
                background: "rgba(234, 179, 8, 0.1)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                borderRadius: "8px",
                padding: "0.85rem 1rem",
                marginBottom: "1.25rem",
                fontSize: "0.82rem",
                color: "#fef08a",
                lineHeight: "1.5",
              }}
            >
              <strong>Notice:</strong> This site is operating under static build mode. To finalize your instant reservation with zero delay, connect directly with our active VIP concierge on WhatsApp below:
            </div>

            <a
              href={waAppointmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="consult-whatsapp-btn"
              style={{ width: "100%", justifyContent: "center", padding: "0.85rem 1.5rem" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Transmit Reservation via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={closeAppointmentModal}
              style={{
                marginTop: "1rem",
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
