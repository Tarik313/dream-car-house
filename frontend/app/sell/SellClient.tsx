"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { submitSellCarAction, SellCarSubmissionResult } from "@/app/actions/sell";
import { useUI } from "@/lib/UIContext";
import type { PublicSiteSettings } from "@/lib/types";

const POPULAR_BRANDS = [
  "Mercedes-Benz",
  "BMW",
  "Lexus",
  "Toyota",
  "Porsche",
  "Land Rover",
  "Audi",
  "BYD",
];

export default function SellClient({
  settings,
}: {
  settings?: PublicSiteSettings;
} = {}) {
  const { theme } = useUI();
  const isLight = theme === "light";

  const [fullName, setFullName] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [branchPreference, setBranchPreference] = useState("kakrail");
  const [notes, setNotes] = useState("");

  // Vehicle Image Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SellCarSubmissionResult["data"] | null>(null);

  const activeBrandName = brand === "Other" ? customBrand : brand;
  const hotline = settings?.hotline || "01615-121312";
  const brandName = settings?.name || "DREAM CAR HOUSE";

  // Clean up preview object URLs on unmount or change
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Dynamic Theme Colors (Seamless Day/Night Mode)
  const colors = {
    textPrimary: isLight ? "#0f172a" : "#ffffff",
    textSecondary: isLight ? "#475569" : "#9ca3af",
    textMuted: isLight ? "#64748b" : "#6b7280",
    cardBg: isLight ? "#ffffff" : "#0d0f14",
    cardBorder: isLight ? "rgba(148, 163, 184, 0.3)" : "rgba(255, 255, 255, 0.10)",
    cardShadow: isLight
      ? "0 10px 30px -8px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(148, 163, 184, 0.18)"
      : "0 20px 40px rgba(0, 0, 0, 0.5)",
    inputBg: isLight ? "#f8fafc" : "#12151c",
    inputBorder: isLight ? "rgba(148, 163, 184, 0.4)" : "rgba(255, 255, 255, 0.12)",
    inputText: isLight ? "#0f172a" : "#ffffff",
    pillBg: isLight ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.04)",
    pillBorder: isLight ? "rgba(148, 163, 184, 0.3)" : "rgba(255, 255, 255, 0.08)",
    pillText: isLight ? "#334155" : "#9ca3af",
    pillActiveBg: isLight ? "rgba(217, 119, 6, 0.12)" : "rgba(245, 158, 11, 0.2)",
    pillActiveBorder: isLight ? "#d97706" : "#fbbf24",
    pillActiveText: isLight ? "#b45309" : "#fbbf24",
    goldAccent: isLight ? "#b45309" : "#fbbf24",
    divider: isLight ? "rgba(148, 163, 184, 0.2)" : "rgba(255, 255, 255, 0.08)",
    btnSubmitBg: isLight
      ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
      : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  };

  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxPhotos = 10;
    const currentCount = selectedFiles.length;

    if (currentCount >= maxPhotos) {
      setErrorMessage("You can upload a maximum of 10 photos.");
      return;
    }

    const newFiles: File[] = [];
    let formatWarning = false;
    let sizeWarning = false;

    for (const f of fileArray) {
      if (!allowedTypes.includes(f.type.toLowerCase())) {
        formatWarning = true;
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        sizeWarning = true;
        continue;
      }
      if (currentCount + newFiles.length < maxPhotos) {
        newFiles.push(f);
      }
    }

    if (formatWarning) {
      setErrorMessage("Some files were skipped: Only JPG, PNG, and WEBP formats are supported.");
    } else if (sizeWarning) {
      setErrorMessage("Some files were skipped: Each photo must be smaller than 10MB.");
    }

    if (newFiles.length > 0) {
      const combinedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(combinedFiles);

      // Revoke old previews and create new ones
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(newPreviews);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);

    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setErrorMessage(null);

    const finalBrand = activeBrandName.trim();
    if (!finalBrand) {
      setErrorMessage("Please select or enter the vehicle brand.");
      return;
    }

    startTransition(async () => {
      const combinedNotes = [
        branchPreference ? `Preferred Showroom: ${branchPreference.toUpperCase()}` : "",
        notes ? `Client Notes: ${notes}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("phone", phone);
      formData.append("carName", finalBrand);
      formData.append("carModel", model);
      formData.append("carYear", year);
      formData.append("mileage", mileage);
      if (expectedPrice) {
        formData.append("offeredPrice", expectedPrice);
      }
      if (combinedNotes) {
        formData.append("notes", combinedNotes);
      }

      // Attach all selected images
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await submitSellCarAction(formData);

      if (!res.ok) {
        setErrorMessage(res.error || "Failed to submit vehicle valuation. Please verify details.");
      } else if (res.data) {
        setSubmissionResult(res.data);
      }
    });
  };

  const handleBrandPillClick = (b: string) => {
    setBrand(b);
    if (b !== "Other") {
      setCustomBrand("");
    }
  };

  return (
    <div className="inventory-page-wrap max-w-7xl">
      <div style={{ maxWidth: "52rem", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: colors.textMuted, marginBottom: "1.5rem" }}>
          <Link href="/" style={{ color: colors.textMuted, textDecoration: "none" }}>Home</Link>
          <span>›</span>
          <Link href="/inventory" style={{ color: colors.textMuted, textDecoration: "none" }}>Inventory</Link>
          <span>›</span>
          <span style={{ color: colors.goldAccent, fontWeight: 600 }}>Sell / Trade-In</span>
        </div>

        {/* Luxury Header Banner */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: colors.goldAccent,
              background: colors.pillActiveBg,
              border: `1px solid ${colors.pillActiveBorder}`,
              padding: "4px 14px",
              borderRadius: "9999px",
              marginBottom: "1rem",
            }}
          >
            Direct Acquisition & Trade-In Desk
          </span>

          <h1
            style={{
              fontSize: "clamp(1.85rem, 4vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: colors.textPrimary,
              lineHeight: 1.15,
              marginBottom: "0.75rem",
            }}
          >
            Sell Your Luxury Vehicle
          </h1>

          <p
            style={{
              fontSize: "0.98rem",
              color: colors.textSecondary,
              maxWidth: "36rem",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Enjoy transparent valuation, competitive instantaneous acquisition offers, and discreet transaction handling through {brandName}.
          </p>
        </div>

        {/* 3 Step Selling Assurance Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: colors.pillActiveBg,
                color: colors.goldAccent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: colors.textPrimary }}>Submit Specs & Photos</div>
              <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>Details & clear photos</div>
            </div>
          </div>

          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: colors.pillActiveBg,
                color: colors.goldAccent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: colors.textPrimary }}>Certified Appraisal</div>
              <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>Kakrail or Gulshan lounge</div>
            </div>
          </div>

          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: colors.pillActiveBg,
                color: colors.goldAccent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: colors.textPrimary }}>Instant Settlement</div>
              <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>Secure bank wire or trade-in</div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "16px",
            boxShadow: colors.cardShadow,
            padding: "clamp(1.5rem, 3vw, 2.5rem)",
          }}
        >
          {errorMessage && (
            <div
              style={{
                background: isLight ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: isLight ? "#dc2626" : "#fca5a5",
                borderRadius: "8px",
                padding: "0.85rem 1rem",
                marginBottom: "1.5rem",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {!submissionResult ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Brand Selector Pills */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.5rem" }}>
                  Vehicle Make / Brand <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "0.65rem" }}>
                  {POPULAR_BRANDS.map((b) => {
                    const active = brand === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleBrandPillClick(b)}
                        style={{
                          background: active ? colors.pillActiveBg : colors.pillBg,
                          border: `1px solid ${active ? colors.pillActiveBorder : colors.pillBorder}`,
                          color: active ? colors.pillActiveText : colors.pillText,
                          padding: "6px 14px",
                          borderRadius: "9999px",
                          fontSize: "0.82rem",
                          fontWeight: active ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {b}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleBrandPillClick("Other")}
                    style={{
                      background: brand === "Other" ? colors.pillActiveBg : colors.pillBg,
                      border: `1px solid ${brand === "Other" ? colors.pillActiveBorder : colors.pillBorder}`,
                      color: brand === "Other" ? colors.pillActiveText : colors.pillText,
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      fontSize: "0.82rem",
                      fontWeight: brand === "Other" ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Other Brand
                  </button>
                </div>

                {brand === "Other" && (
                  <input
                    type="text"
                    required
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="Enter brand name (e.g. Bentley, Aston Martin, Ferrari)..."
                    className="cars-search-input"
                    style={{
                      width: "100%",
                      background: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />
                )}
              </div>

              {/* Model & Year */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.4rem" }}>
                    Model & Trim / Package <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. S 580 Maybach, LC500, Defender 110"
                    className="cars-search-input"
                    style={{
                      width: "100%",
                      background: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.4rem" }}>
                    Manufacturing Year <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2022"
                    className="cars-search-input"
                    style={{
                      width: "100%",
                      background: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />
                </div>
              </div>

              {/* Mileage & Expected Price */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.4rem" }}>
                    Mileage (km) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="e.g. 18000"
                    className="cars-search-input"
                    style={{
                      width: "100%",
                      background: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.4rem" }}>
                    Expected Asking Price (BDT) <span style={{ color: colors.textMuted, fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    placeholder="e.g. 18500000"
                    className="cars-search-input"
                    style={{
                      width: "100%",
                      background: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />
                </div>
              </div>

              {/* Vehicle Photos Upload Dropzone */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary }}>
                    Vehicle Images <span style={{ color: colors.textMuted, fontWeight: 400 }}>(Optional - Up to 10 photos)</span>
                  </label>
                  <span style={{ fontSize: "0.75rem", color: colors.goldAccent, fontWeight: 600 }}>
                    {selectedFiles.length} / 10 Attached
                  </span>
                </div>

                {/* Upload Trigger Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) {
                      handleFilesSelected(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? colors.goldAccent : colors.cardBorder}`,
                    background: isDragging
                      ? colors.pillActiveBg
                      : isLight
                      ? "rgba(248, 250, 252, 0.7)"
                      : "rgba(18, 21, 28, 0.6)",
                    borderRadius: "10px",
                    padding: "1.25rem 1rem",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    style={{ display: "none" }}
                    onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                  />

                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: colors.pillActiveBg,
                      color: colors.goldAccent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.6rem",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>

                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: colors.textPrimary, marginBottom: "0.25rem" }}>
                    Click or drag & drop vehicle photos here
                  </p>
                  <p style={{ fontSize: "0.76rem", color: colors.textMuted }}>
                    Front, rear, interior, meter cluster • JPG, PNG, WEBP (Max 10MB each)
                  </p>
                </div>

                {/* Previews Grid */}
                {selectedFiles.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                      gap: "0.75rem",
                      marginTop: "1rem",
                    }}
                  >
                    {previewUrls.map((url, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          width: "100%",
                          paddingTop: "100%",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: `1px solid ${colors.cardBorder}`,
                          background: "#000",
                        }}
                      >
                        <Image
                          src={url}
                          alt={`Uploaded preview ${idx + 1}`}
                          fill
                          sizes="100px"
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />

                        {/* File size tag */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "3px",
                            left: "3px",
                            background: "rgba(0, 0, 0, 0.75)",
                            backdropFilter: "blur(4px)",
                            color: "#fff",
                            fontSize: "0.62rem",
                            fontWeight: 600,
                            padding: "1px 4px",
                            borderRadius: "3px",
                          }}
                        >
                          {formatFileSize(selectedFiles[idx]?.size || 0)}
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                          style={{
                            position: "absolute",
                            top: "3px",
                            right: "3px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "rgba(220, 38, 38, 0.9)",
                            color: "#ffffff",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            lineHeight: 1,
                            transition: "transform 0.15s ease",
                          }}
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Name & Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", borderTop: `1px solid ${colors.divider}`, paddingTop: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.4rem" }}>
                    Your Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chowdhury Rahman"
                    className="cars-search-input"
                    style={{
                      width: "100%",
                      background: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.4rem" }}>
                    Phone Number / WhatsApp <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01711-XXXXXX"
                    className="cars-search-input"
                    style={{
                      width: "100%",
                      background: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />
                </div>
              </div>

              {/* Showroom Branch Preference */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.4rem" }}>
                  Preferred Valuation Location
                </label>
                <select
                  value={branchPreference}
                  onChange={(e) => setBranchPreference(e.target.value)}
                  className="filter-select"
                  style={{
                    width: "100%",
                    background: colors.inputBg,
                    color: colors.inputText,
                    borderColor: colors.inputBorder,
                  }}
                >
                  <option value="kakrail">Kakrail Main Flagship Showroom (18, Monsur Ali Soroni)</option>
                  <option value="gulshan">Gulshan Private Lounge (House #07, Road #127, Gulshan Avenue)</option>
                  <option value="residence">Doorstep Private Inspection (Dhaka City)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.4rem" }}>
                  Vehicle Highlights / Condition Notes <span style={{ color: colors.textMuted, fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Single owner, authorized service records, sunroof, pristine interior condition..."
                  className="cars-search-input"
                  style={{
                    width: "100%",
                    resize: "vertical",
                    fontFamily: "inherit",
                    background: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.inputText,
                  }}
                />
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isPending}
                className="hero-pill-btn"
                style={{
                  width: "100%",
                  padding: "0.95rem 1.5rem",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: isPending ? "not-allowed" : "pointer",
                  background: colors.btnSubmitBg,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)",
                  transition: "all 0.25s ease",
                  marginTop: "0.5rem",
                }}
              >
                {isPending ? "Submitting Vehicle Details..." : "Submit Vehicle Details →"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem", fontSize: "0.8rem", color: colors.textMuted }}>
                <span>🔒 100% Confidential Valuation</span>
                <span>Direct Hotline: <strong style={{ color: colors.textPrimary }}>{hotline}</strong></span>
              </div>
            </form>
          ) : (
            /* SUCCESS CONFIRMATION */
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: isLight ? "rgba(22, 163, 74, 0.12)" : "rgba(34, 197, 94, 0.15)",
                  border: isLight ? "1px solid rgba(22, 163, 74, 0.35)" : "1px solid rgba(34, 197, 94, 0.4)",
                  color: isLight ? "#16a34a" : "#4ade80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: colors.textPrimary, marginBottom: "0.5rem" }}>
                Valuation Details Received
              </h3>

              <p style={{ color: colors.textSecondary, fontSize: "0.92rem", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto 1.5rem" }}>
                Thank you, <strong>{fullName}</strong>. Your {year} {activeBrandName} {model} has been securely logged for valuation (Ref #{submissionResult.id || "DCH-VAL"}).
                {selectedFiles.length > 0 && ` (${selectedFiles.length} photos uploaded)`}
              </p>

              {submissionResult.waUrl && (
                <a
                  href={submissionResult.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="consult-whatsapp-btn"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "0.85rem 1.5rem",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1 .587 1.78.893 2.806.893 3.182 0 5.768-2.586 5.768-5.766.001-3.181-2.585-5.776-5.768-5.776zm3.435 8.163c-.144.404-.836.774-1.17.822-.311.045-.71.07-2.13-.518-1.815-.751-2.986-2.59-3.077-2.711-.091-.121-.739-.984-.739-1.877 0-.893.469-1.332.636-1.514.167-.182.365-.228.487-.228.122 0 .243.002.35.007.112.005.263-.042.412.315.152.365.518 1.265.564 1.356.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.284.814 1.466.905.182.091.289.076.395-.045.106-.121.456-.531.577-.713.121-.182.243-.152.41-.091.167.061 1.062.5 1.244.591.182.091.304.136.35.212.045.076.045.44-.099.844zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.957-1.399C8.414 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  <span>Connect with Valuation Team on WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  setSubmissionResult(null);
                  setFullName("");
                  setBrand("");
                  setCustomBrand("");
                  setModel("");
                  setYear("");
                  setMileage("");
                  setExpectedPrice("");
                  setPhone("");
                  setNotes("");
                  setSelectedFiles([]);
                  previewUrls.forEach((url) => URL.revokeObjectURL(url));
                  setPreviewUrls([]);
                }}
                style={{
                  background: "transparent",
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textSecondary,
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "all 0.2s ease",
                }}
              >
                ← Submit Another Vehicle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
