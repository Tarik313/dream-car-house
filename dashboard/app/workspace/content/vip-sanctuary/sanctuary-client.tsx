"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import type { VipSanctuarySectionItem, VipSanctuaryPillarData, ShowroomBranchItem } from "@/lib/types";
import { updateVipSanctuarySectionAction } from "@/app/actions/chronicles_sanctuary";

interface SanctuaryClientProps {
  initialData: VipSanctuarySectionItem;
  branches: ShowroomBranchItem[];
  userPermissions: string[];
}

export function SanctuaryClient({ initialData, branches, userPermissions }: SanctuaryClientProps) {
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_vipsanctuarysection") ||
    userPermissions.includes("admin") ||
    userPermissions.length === 0;

  const [sanctuary, setSanctuary] = useState<VipSanctuarySectionItem>(initialData);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [bgImageUrl, setBgImageUrl] = useState(sanctuary.background_image_url || "");
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [eyebrow, setEyebrow] = useState(sanctuary.eyebrow || "KAKRAIL & GULSHAN • DHAKA");
  const [title, setTitle] = useState(sanctuary.title || "Step Into The Realm of Automotive Excellence");
  const [description, setDescription] = useState(sanctuary.description || "");

  // Value Pillars (3)
  const defaultPillars: VipSanctuaryPillarData[] = [
    { title: "100% Certified Provenance", subtitle: "Verified mechanical inspection & auction grades", icon: "shield" },
    { title: "Global Bespoke Sourcing", subtitle: "Direct official imports from UK, DE & Japan", icon: "globe" },
    { title: "White-Glove VIP Advisory", subtitle: "Personalized acquisition & dedicated concierge", icon: "star" },
  ];
  const [pillars, setPillars] = useState<VipSanctuaryPillarData[]>(
    sanctuary.value_pillars && sanctuary.value_pillars.length > 0 ? sanctuary.value_pillars : defaultPillars
  );

  // CTAs
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState(sanctuary.primary_cta_label || "Schedule Private Viewing");
  const [primaryCtaAction, setPrimaryCtaAction] = useState(sanctuary.primary_cta_action || "appointment_modal");
  const [primaryCtaUrl, setPrimaryCtaUrl] = useState(sanctuary.primary_cta_url || "");
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState(sanctuary.secondary_cta_label || "Browse Available Vault →");
  const [secondaryCtaUrl, setSecondaryCtaUrl] = useState(sanctuary.secondary_cta_url || "/inventory");

  // Studio Card
  const [cardBadge, setCardBadge] = useState(sanctuary.card_badge || "FLAGSHIP SHOWROOM");
  const [cardTitle, setCardTitle] = useState(sanctuary.card_title || "DREAM CAR HOUSE Flagship");
  const [cardLivePill, setCardLivePill] = useState(sanctuary.card_live_pill || "OPEN TODAY");
  const [branchId, setBranchId] = useState<number | string>(sanctuary.branch || "");
  const [locationText, setLocationText] = useState(sanctuary.location_text || "");
  const [hoursText, setHoursText] = useState(sanctuary.hours_text || "");
  const [phoneText, setPhoneText] = useState(sanctuary.phone_text || "");
  const [whatsappCtaLabel, setWhatsappCtaLabel] = useState(sanctuary.whatsapp_cta_label || "WhatsApp Concierge");
  const [whatsappUrl, setWhatsappUrl] = useState(sanctuary.whatsapp_url || "");
  const [tourCtaLabel, setTourCtaLabel] = useState(sanctuary.tour_cta_label || "Showroom Tour");
  const [tourVideoTarget, setTourVideoTarget] = useState(sanctuary.tour_video_target || "tour");
  const [isActive, setIsActive] = useState(sanctuary.is_active);

  const handlePillarChange = (idx: number, field: keyof VipSanctuaryPillarData, val: string) => {
    const updated = [...pillars];
    const prev = updated[idx];
    if (prev) {
      updated[idx] = {
        title: field === "title" ? val : prev.title,
        subtitle: field === "subtitle" ? val : prev.subtitle,
        icon: field === "icon" ? val : prev.icon,
      };
      setPillars(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChange) return;

    setStatusMsg(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("eyebrow", eyebrow);
      formData.set("title", title);
      formData.set("description", description);
      formData.set("background_image_url", bgImageUrl);
      formData.set("value_pillars", JSON.stringify(pillars));
      formData.set("primary_cta_label", primaryCtaLabel);
      formData.set("primary_cta_action", primaryCtaAction);
      formData.set("primary_cta_url", primaryCtaUrl);
      formData.set("secondary_cta_label", secondaryCtaLabel);
      formData.set("secondary_cta_url", secondaryCtaUrl);
      formData.set("card_badge", cardBadge);
      formData.set("card_title", cardTitle);
      formData.set("card_live_pill", cardLivePill);
      formData.set("branch", branchId ? String(branchId) : "");
      formData.set("location_text", locationText);
      formData.set("hours_text", hoursText);
      formData.set("phone_text", phoneText);
      formData.set("whatsapp_cta_label", whatsappCtaLabel);
      formData.set("whatsapp_url", whatsappUrl);
      formData.set("tour_cta_label", tourCtaLabel);
      formData.set("tour_video_target", tourVideoTarget);
      formData.set("is_active", isActive ? "true" : "false");

      if (bgFile) {
        formData.set("background_image", bgFile);
      }

      const res = await updateVipSanctuarySectionAction(formData);
      if (res.ok) {
        setSanctuary(res.data);
        setStatusMsg({ type: "success", text: "VIP Sanctuary section updated successfully!" });
      } else {
        setStatusMsg({ type: "error", text: res.error.message || "Failed to save VIP Sanctuary." });
      }
    });
  };

  const currentBg = sanctuary.background_image || sanctuary.background_image_url;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1200px" }}>
      {statusMsg && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            backgroundColor: statusMsg.type === "success" ? "#14532d" : "#7f1d1d",
            color: statusMsg.type === "success" ? "#86efac" : "#fca5a5",
            fontSize: "0.9rem",
          }}
        >
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Section 1: Editorial Invitation & Atmosphere */}
        <div style={{ background: "#18181b", padding: "1.5rem", borderRadius: "8px", border: "1px solid #27272a" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#f4f4f5", marginBottom: "1.25rem" }}>
            1. Atmosphere & Editorial Narrative
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Eyebrow Label</label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Section Title (Gold Span: &quot;Automotive Excellence&quot;)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                required
              />
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Editorial Invitation Story / Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
                required
              />
            </div>

            {/* Background Image */}
            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Background Atmosphere Image</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {currentBg && (
                  <div style={{ width: "100px", height: "60px", position: "relative", borderRadius: "4px", overflow: "hidden", border: "1px solid #3f3f46" }}>
                    <Image src={currentBg} alt="Atmosphere Preview" fill style={{ objectFit: "cover" }} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBgFile(e.target.files?.[0] || null)}
                  style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.4rem" }}
                />
                <input
                  type="url"
                  value={bgImageUrl}
                  onChange={(e) => setBgImageUrl(e.target.value)}
                  placeholder="Or enter image URL: https://..."
                  style={{ flex: 1, background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 3 Value Pillars */}
        <div style={{ background: "#18181b", padding: "1.5rem", borderRadius: "8px", border: "1px solid #27272a" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#f4f4f5", marginBottom: "0.5rem" }}>
            2. Brand Value Pillars (3 Highlights)
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#a1a1aa", margin: "0 0 1.25rem 0" }}>
            Configure the 3 core prestige pillars displayed directly beneath the invitation narrative.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  background: "#09090b",
                  border: "1px solid #27272a",
                  padding: "1rem",
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#d97706" }}>Pillar 0{idx + 1}</span>
                  <select
                    value={pillar.icon}
                    onChange={(e) => handlePillarChange(idx, "icon", e.target.value)}
                    style={{ background: "#18181b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "2px 6px", fontSize: "0.75rem", borderRadius: "4px" }}
                  >
                    <option value="shield">Shield (Provenance)</option>
                    <option value="globe">Globe (Sourcing)</option>
                    <option value="star">Star (Advisory)</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Title</label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => handlePillarChange(idx, "title", e.target.value)}
                    style={{ background: "#18181b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.4rem", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Subtitle / Detail</label>
                  <input
                    type="text"
                    value={pillar.subtitle}
                    onChange={(e) => handlePillarChange(idx, "subtitle", e.target.value)}
                    style={{ background: "#18181b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.4rem", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Primary CTA Label & Action</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={primaryCtaLabel}
                  onChange={(e) => setPrimaryCtaLabel(e.target.value)}
                  placeholder="Schedule Private Viewing"
                  style={{ width: "55%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
                <select
                  value={primaryCtaAction}
                  onChange={(e) => setPrimaryCtaAction(e.target.value)}
                  style={{ width: "45%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                >
                  <option value="appointment_modal">Open Appointment Modal</option>
                  <option value="link">Custom Link URL</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Secondary CTA Label & Destination</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={secondaryCtaLabel}
                  onChange={(e) => setSecondaryCtaLabel(e.target.value)}
                  placeholder="Browse Available Vault →"
                  style={{ width: "60%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
                <input
                  type="text"
                  value={secondaryCtaUrl}
                  onChange={(e) => setSecondaryCtaUrl(e.target.value)}
                  placeholder="/inventory"
                  style={{ width: "40%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Flagship Studio Card */}
        <div style={{ background: "#18181b", padding: "1.5rem", borderRadius: "8px", border: "1px solid #27272a" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#f4f4f5", marginBottom: "0.5rem" }}>
            3. Interactive Flagship Studio Card
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#a1a1aa", margin: "0 0 1.25rem 0" }}>
            Right column card featuring live hours pill, branch location, direct concierge hotline, WhatsApp link, and showroom video tour button.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Card Header Badge & Live Pill</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={cardBadge}
                  onChange={(e) => setCardBadge(e.target.value)}
                  placeholder="FLAGSHIP SHOWROOM"
                  style={{ width: "60%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
                <input
                  type="text"
                  value={cardLivePill}
                  onChange={(e) => setCardLivePill(e.target.value)}
                  placeholder="OPEN TODAY"
                  style={{ width: "40%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Card Studio Title</label>
              <input
                type="text"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                placeholder="DREAM CAR HOUSE Flagship"
                style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
            </div>

            {/* Associated Showroom Branch */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Associated Showroom Branch (Auto-populates if fields empty)</label>
              <select
                value={branchId}
                onChange={(e) => {
                  const val = e.target.value;
                  setBranchId(val);
                  const selectedBranch = branches.find((b) => String(b.id) === String(val));
                  if (selectedBranch) {
                    if (selectedBranch.address) setLocationText(selectedBranch.address);
                    if (selectedBranch.hours) setHoursText(selectedBranch.hours);
                    if (selectedBranch.hotline || selectedBranch.phone) {
                      setPhoneText(selectedBranch.hotline || selectedBranch.phone || "");
                    }
                    if (selectedBranch.name) setCardTitle(selectedBranch.name);
                  }
                }}
                style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              >
                <option value="">None / Custom Override</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.address ? b.address.slice(0, 30) : "Dhaka"})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Direct Hotline</label>
              <input
                type="text"
                value={phoneText}
                onChange={(e) => setPhoneText(e.target.value)}
                placeholder="01615-121312"
                style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Showroom Location Address</label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000"
                style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>VIP Viewing Hours</label>
              <input
                type="text"
                value={hoursText}
                onChange={(e) => setHoursText(e.target.value)}
                placeholder="Daily 10:00 AM – 10:00 PM (Private Viewings by Reservation)"
                style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>WhatsApp Concierge CTA & URL</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={whatsappCtaLabel}
                  onChange={(e) => setWhatsappCtaLabel(e.target.value)}
                  placeholder="WhatsApp Concierge"
                  style={{ width: "45%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
                <input
                  type="text"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder="https://wa.me/..."
                  style={{ width: "55%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Showroom Tour Video Modal Target</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={tourCtaLabel}
                  onChange={(e) => setTourCtaLabel(e.target.value)}
                  placeholder="Showroom Tour"
                  style={{ width: "60%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                />
                <select
                  value={tourVideoTarget}
                  onChange={(e) => setTourVideoTarget(e.target.value)}
                  style={{ width: "40%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
                >
                  <option value="tour">Tour Video Modal</option>
                  <option value="reel">Reel Video Modal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f4f4f5", fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            VIP Sanctuary Section Published & Active
          </label>

          <button
            type="submit"
            disabled={isPending || !canChange}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "0.6rem 1.5rem",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Saving Changes..." : "Save VIP Sanctuary Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
