"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Upload } from "@/components/ui/Upload";
import { useToast } from "@/components/ui/Toast";
import { updateSiteSettingsAction } from "@/app/actions/settings";
import type { SiteSettingsItem } from "@/lib/types";
import {
  Building2,
  Sun,
  Moon,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  ExternalLink,
  Globe,
  Sparkles,
  Info,
  RotateCcw,
  Smartphone,
} from "lucide-react";

interface SiteSettingsClientProps {
  initialSettings: SiteSettingsItem;
  userPermissions?: string[];
}

export function SiteSettingsClient({
  initialSettings,
  userPermissions = [],
}: SiteSettingsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_sitesettings");

  const [formData, setFormData] = useState({
    name: initialSettings.name || "",
    tagline: initialSettings.tagline || "",
    hotline: initialSettings.hotline || "",
    phone: initialSettings.phone || "",
    email: initialSettings.email || "",
    whatsapp: initialSettings.whatsapp || "",
    website: initialSettings.website || "",
    primary_address: initialSettings.primary_address || "",
    opening_hours_text: initialSettings.opening_hours_text || "",
    footer_tagline: initialSettings.footer_tagline || "",
    footer_copy_text: initialSettings.footer_copy_text || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [clearFavicon, setClearFavicon] = useState(false);
  const [clearLogoIcon, setClearLogoIcon] = useState(false);
  const [clearLogoIconLight, setClearLogoIconLight] = useState(false);
  const [clearLogoFooter, setClearLogoFooter] = useState(false);
  const [clearLogoFooterLight, setClearLogoFooterLight] = useState(false);

  const activeFaviconSrc = clearFavicon
    ? "/favicon.ico"
    : initialSettings.favicon || "/favicon.ico";

  const activeMobileIconDark = clearLogoIcon
    ? initialSettings.logo || "/assets/dch-logo.webp"
    : initialSettings.logo_icon || initialSettings.logo || "/assets/dch-logo.webp";

  const activeMobileIconLight = clearLogoIconLight
    ? initialSettings.logo_light || initialSettings.logo || "/assets/dch-logo.webp"
    : initialSettings.logo_icon_light || initialSettings.logo_icon || initialSettings.logo_light || initialSettings.logo || "/assets/dch-logo.webp";

  const activeFooterDark = clearLogoFooter
    ? initialSettings.logo || "/assets/dch-logo.webp"
    : initialSettings.logo_footer || initialSettings.logo || "/assets/dch-logo.webp";

  const activeFooterLight = clearLogoFooterLight
    ? initialSettings.logo_light || initialSettings.logo || "/assets/dch-logo.webp"
    : initialSettings.logo_footer_light || initialSettings.logo_light || initialSettings.logo_footer || initialSettings.logo || "/assets/dch-logo.webp";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canChange) {
      showToast({
        type: "error",
        title: "Permission Denied",
        message: "You do not have permission to modify site settings.",
      });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    const body = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      body.append(k, v);
    });

    const logoNightInput = e.currentTarget.querySelector('input[name="logo"]') as HTMLInputElement;
    if (logoNightInput?.files?.[0]) {
      body.append("logo", logoNightInput.files[0]);
    }

    const logoDayInput = e.currentTarget.querySelector('input[name="logo_light"]') as HTMLInputElement;
    if (logoDayInput?.files?.[0]) {
      body.append("logo_light", logoDayInput.files[0]);
    }

    const faviconInput = e.currentTarget.querySelector('input[name="favicon"]') as HTMLInputElement;
    if (faviconInput?.files?.[0]) {
      body.append("favicon", faviconInput.files[0]);
    } else if (clearFavicon) {
      body.append("clear_favicon", "true");
    }

    const logoIconInput = e.currentTarget.querySelector('input[name="logo_icon"]') as HTMLInputElement;
    if (logoIconInput?.files?.[0]) {
      body.append("logo_icon", logoIconInput.files[0]);
    } else if (clearLogoIcon) {
      body.append("clear_logo_icon", "true");
    }

    const logoIconLightInput = e.currentTarget.querySelector('input[name="logo_icon_light"]') as HTMLInputElement;
    if (logoIconLightInput?.files?.[0]) {
      body.append("logo_icon_light", logoIconLightInput.files[0]);
    } else if (clearLogoIconLight) {
      body.append("clear_logo_icon_light", "true");
    }

    const logoFooterInput = e.currentTarget.querySelector('input[name="logo_footer"]') as HTMLInputElement;
    if (logoFooterInput?.files?.[0]) {
      body.append("logo_footer", logoFooterInput.files[0]);
    } else if (clearLogoFooter) {
      body.append("clear_logo_footer", "true");
    }

    const logoFooterLightInput = e.currentTarget.querySelector('input[name="logo_footer_light"]') as HTMLInputElement;
    if (logoFooterLightInput?.files?.[0]) {
      body.append("logo_footer_light", logoFooterLightInput.files[0]);
    } else if (clearLogoFooterLight) {
      body.append("clear_logo_footer_light", "true");
    }

    try {
      const res = await updateSiteSettingsAction(body);
      if (res.ok) {
        setClearFavicon(false);
        setClearLogoIcon(false);
        setClearLogoIconLight(false);
        setClearLogoFooter(false);
        setClearLogoFooterLight(false);
        showToast({
          type: "success",
          title: "Settings Saved",
          message: "Public business identity, contact details, header logos, footer logos, and tab icon updated successfully.",
        });
        router.refresh();
      } else {
        const errorMsg = res.error?.message || "Failed to update site settings.";
        showToast({
          type: "error",
          title: "Update Failed",
          message: errorMsg,
        });
        if (res.error?.details && typeof res.error.details === "object") {
          setFormErrors(res.error.details as Record<string, string>);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast({
        type: "error",
        title: "Network Error",
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Top Banner Card */}
      <div
        style={{
          background: "var(--surface-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "8px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 size={20} style={{ color: "var(--brand-primary)" }} />
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Showroom Identity & Brand Configuration
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px",
                background: "var(--tab-active-bg)",
                color: "var(--tab-active-text)",
              }}
            >
              Live Site Settings
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Updates apply instantly to public Header, Day/Night Modes, Navigation Drawer, Footer, and Contact Modals.
          </p>
        </div>

        <a
          href={formData.website || "http://127.0.0.1:3000"}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "12px",
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: "4px",
            background: "var(--surface-secondary)",
            border: "1px solid var(--border-default)",
            color: "var(--action-primary)",
            textDecoration: "none",
          }}
        >
          <span>View Public Showroom</span>
          <ExternalLink size={13} />
        </a>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* ========================================================================= */}
        {/* Section 1: Day & Night Mode Brand Logos */}
        {/* ========================================================================= */}
        <div
          style={{
            background: "var(--surface-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Sparkles size={18} style={{ color: "var(--warning)" }} />
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              Brand Logos (Day & Night Mode Adaptive)
            </h3>
          </div>
          <p style={{ margin: "0 0 1.25rem 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Dream Car House features an adaptive Day/Night Luxury Orb switcher. Provide optimized logos for both light and dark backgrounds.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {/* 1. Night Mode Logo (Dark Theme / Default) */}
            <div
              style={{
                border: "1px solid var(--border-default)",
                borderRadius: "6px",
                padding: "1.25rem",
                background: "var(--surface-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                  <Moon size={15} style={{ color: "#f59e0b" }} />
                  Night Mode Logo (Default)
                </span>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: "4px", background: "#0f172a", color: "#f8fafc" }}>
                  Dark Theme
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
                Shown on dark backgrounds, Night Mode header, and showroom footer.
              </p>

              {/* Preview Panel (Dark Background) */}
              <div
                style={{
                  background: "#090d16",
                  border: "1px solid #1e293b",
                  borderRadius: "6px",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "75px",
                }}
              >
                {initialSettings.logo ? (
                  <img
                    src={initialSettings.logo}
                    alt="Active Night Mode Logo"
                    style={{ maxHeight: "55px", maxWidth: "240px", objectFit: "contain" }}
                  />
                ) : (
                  <img
                    src="/assets/dch-logo.webp"
                    alt="Default Showroom Logo"
                    style={{ maxHeight: "55px", maxWidth: "240px", objectFit: "contain" }}
                  />
                )}
              </div>

              <FormField label="Upload New Night Mode Logo" error={formErrors.logo} description="Transparent PNG, WebP or SVG (max 10MB). Light/gold artwork recommended.">
                <Upload name="logo" accept="image/*,.svg" disabled={!canChange || submitting} />
              </FormField>
            </div>

            {/* 2. Day Mode Logo (Light Theme) */}
            <div
              style={{
                border: "1px solid var(--border-default)",
                borderRadius: "6px",
                padding: "1.25rem",
                background: "var(--surface-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                  <Sun size={15} style={{ color: "#ea580c" }} />
                  Day Mode Logo
                </span>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: "4px", background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1" }}>
                  Light Theme
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
                Shown on white/light backgrounds when a visitor toggles Day Mode.
              </p>

              {/* Preview Panel (Light Background) */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "75px",
                }}
              >
                {initialSettings.logo_light ? (
                  <img
                    src={initialSettings.logo_light}
                    alt="Active Day Mode Logo"
                    style={{ maxHeight: "55px", maxWidth: "240px", objectFit: "contain" }}
                  />
                ) : initialSettings.logo ? (
                  <img
                    src={initialSettings.logo}
                    alt="Active Night Mode Logo (Fallback)"
                    style={{ maxHeight: "55px", maxWidth: "240px", objectFit: "contain" }}
                  />
                ) : (
                  <img
                    src="/assets/dch-logo.webp"
                    alt="Default Showroom Logo"
                    style={{ maxHeight: "55px", maxWidth: "240px", objectFit: "contain" }}
                  />
                )}
              </div>

              <FormField label="Upload New Day Mode Logo" error={formErrors.logo_light} description="Transparent PNG, WebP or SVG (max 10MB). Dark/metallic artwork recommended.">
                <Upload name="logo_light" accept="image/*,.svg" disabled={!canChange || submitting} />
              </FormField>
            </div>
          </div>

          {/* 2. Mobile Compact Brand Icons (Day & Night Mode Adaptive for < 768px) */}
          <div
            style={{
              marginTop: "1.25rem",
              border: "1px solid var(--border-default)",
              borderRadius: "6px",
              padding: "1.25rem",
              background: "var(--surface-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                <Smartphone size={15} style={{ color: "var(--action-primary)" }} />
                Mobile Header Icons (Compact Adaptive for Screens &lt; 768px)
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: initialSettings.logo_icon || initialSettings.logo_icon_light ? "rgba(34, 197, 94, 0.12)" : "var(--surface-primary)",
                  color: initialSettings.logo_icon || initialSettings.logo_icon_light ? "#16a34a" : "var(--text-muted)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {initialSettings.logo_icon || initialSettings.logo_icon_light ? "Mobile Icons Set" : "Desktop Logo Fallback"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
              Shown centered in the mobile navigation bar instead of the wide horizontal logo. Square transparent SVG/PNG emblem or monogram recommended (e.g. 48x48 or 120x120).
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
              {/* Mobile Night Mode Icon */}
              <div
                style={{
                  border: "1px solid var(--border-default)",
                  borderRadius: "6px",
                  padding: "1rem",
                  background: "var(--surface-primary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, fontSize: "12px", color: "var(--text-primary)" }}>
                    <Moon size={14} style={{ color: "#f59e0b" }} />
                    Night Mode Mobile Icon
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "1px 5px", borderRadius: "3px", background: "#0f172a", color: "#f8fafc" }}>
                    Dark Mobile
                  </span>
                </div>

                {/* Mobile Header Dark Mockup */}
                <div
                  style={{
                    background: "#090d16",
                    border: "1px solid #1e293b",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: "56px",
                  }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "1px solid #334155", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8" }}>
                    ⚙
                  </div>
                  <img
                    src={activeMobileIconDark}
                    alt="Active Mobile Night Mode Icon"
                    style={{ maxHeight: "36px", maxWidth: "60px", objectFit: "contain" }}
                  />
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#1e293b", border: "1px solid #f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#f59e0b" }}>
                    🌙
                  </div>
                </div>

                <FormField
                  label="Upload Night Mode Mobile Icon"
                  error={formErrors.logo_icon}
                  description="Transparent SVG or PNG (max 5MB). Light/white/gold mark."
                >
                  <Upload
                    name="logo_icon"
                    accept=".ico,.png,.svg,.webp,.jpg,.jpeg,image/*"
                    maxSizeBytes={5 * 1024 * 1024}
                    onFilesSelected={(files) => {
                      if (files.length > 0) setClearLogoIcon(false);
                    }}
                    disabled={!canChange || submitting}
                  />
                </FormField>

                {initialSettings.logo_icon && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "-0.25rem" }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!canChange || submitting}
                      onClick={() => setClearLogoIcon((prev) => !prev)}
                    >
                      <RotateCcw size={13} />
                      <span>{clearLogoIcon ? "Keep Custom Mobile Icon" : "Reset to Desktop Fallback"}</span>
                    </Button>
                    {clearLogoIcon && (
                      <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 600 }}>
                        Will reset on Save
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Day Mode Icon */}
              <div
                style={{
                  border: "1px solid var(--border-default)",
                  borderRadius: "6px",
                  padding: "1rem",
                  background: "var(--surface-primary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, fontSize: "12px", color: "var(--text-primary)" }}>
                    <Sun size={14} style={{ color: "#ea580c" }} />
                    Day Mode Mobile Icon
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "1px 5px", borderRadius: "3px", background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1" }}>
                    Light Mobile
                  </span>
                </div>

                {/* Mobile Header Light Mockup */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: "56px",
                  }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#64748b" }}>
                    ⚙
                  </div>
                  <img
                    src={activeMobileIconLight}
                    alt="Active Mobile Day Mode Icon"
                    style={{ maxHeight: "36px", maxWidth: "60px", objectFit: "contain" }}
                  />
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#f8fafc", border: "1px solid #ea580c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#ea580c" }}>
                    ☀️
                  </div>
                </div>

                <FormField
                  label="Upload Day Mode Mobile Icon"
                  error={formErrors.logo_icon_light}
                  description="Transparent SVG or PNG (max 5MB). Dark/metallic mark."
                >
                  <Upload
                    name="logo_icon_light"
                    accept=".ico,.png,.svg,.webp,.jpg,.jpeg,image/*"
                    maxSizeBytes={5 * 1024 * 1024}
                    onFilesSelected={(files) => {
                      if (files.length > 0) setClearLogoIconLight(false);
                    }}
                    disabled={!canChange || submitting}
                  />
                </FormField>

                {initialSettings.logo_icon_light && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "-0.25rem" }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!canChange || submitting}
                      onClick={() => setClearLogoIconLight((prev) => !prev)}
                    >
                      <RotateCcw size={13} />
                      <span>{clearLogoIconLight ? "Keep Custom Mobile Icon" : "Reset to Desktop Fallback"}</span>
                    </Button>
                    {clearLogoIconLight && (
                      <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 600 }}>
                        Will reset on Save
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Showroom Footer Logos (Day & Night Mode Adaptive) */}
          <div
            style={{
              marginTop: "1.25rem",
              border: "1px solid var(--border-default)",
              borderRadius: "6px",
              padding: "1.25rem",
              background: "var(--surface-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                <Building2 size={15} style={{ color: "var(--action-primary)" }} />
                Showroom Footer Logos (Day & Night Mode Adaptive)
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: initialSettings.logo_footer || initialSettings.logo_footer_light ? "rgba(34, 197, 94, 0.12)" : "var(--surface-primary)",
                  color: initialSettings.logo_footer || initialSettings.logo_footer_light ? "#16a34a" : "var(--text-muted)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {initialSettings.logo_footer || initialSettings.logo_footer_light ? "Custom Footer Logos Set" : "Header Logo Fallback"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
              Displayed in the showroom footer. In Day Mode, the footer switches to brushed platinum/light background; in Night Mode, it is obsidian black. Falls back to Header logos if left empty.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
              {/* Footer Night Mode Logo */}
              <div
                style={{
                  border: "1px solid var(--border-default)",
                  borderRadius: "6px",
                  padding: "1rem",
                  background: "var(--surface-primary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, fontSize: "12px", color: "var(--text-primary)" }}>
                    <Moon size={14} style={{ color: "#f59e0b" }} />
                    Night Mode Footer Logo
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "1px 5px", borderRadius: "3px", background: "#0f172a", color: "#f8fafc" }}>
                    Dark Footer
                  </span>
                </div>

                {/* Footer Dark Preview */}
                <div
                  style={{
                    background: "#090d16",
                    border: "1px solid #1e293b",
                    borderRadius: "6px",
                    padding: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "65px",
                  }}
                >
                  <img
                    src={activeFooterDark}
                    alt="Active Night Mode Footer Logo"
                    style={{ maxHeight: "48px", maxWidth: "220px", objectFit: "contain" }}
                  />
                </div>

                <FormField
                  label="Upload Night Mode Footer Logo"
                  error={formErrors.logo_footer}
                  description="Transparent PNG, WebP or SVG (max 10MB). Light/white/gold artwork."
                >
                  <Upload
                    name="logo_footer"
                    accept="image/*,.svg"
                    disabled={!canChange || submitting}
                    onFilesSelected={(files) => {
                      if (files.length > 0) setClearLogoFooter(false);
                    }}
                  />
                </FormField>

                {initialSettings.logo_footer && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "-0.25rem" }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!canChange || submitting}
                      onClick={() => setClearLogoFooter((prev) => !prev)}
                    >
                      <RotateCcw size={13} />
                      <span>{clearLogoFooter ? "Keep Custom Footer Logo" : "Reset to Header Fallback"}</span>
                    </Button>
                    {clearLogoFooter && (
                      <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 600 }}>
                        Will reset on Save
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Day Mode Logo */}
              <div
                style={{
                  border: "1px solid var(--border-default)",
                  borderRadius: "6px",
                  padding: "1rem",
                  background: "var(--surface-primary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, fontSize: "12px", color: "var(--text-primary)" }}>
                    <Sun size={14} style={{ color: "#ea580c" }} />
                    Day Mode Footer Logo
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "1px 5px", borderRadius: "3px", background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1" }}>
                    Light Footer
                  </span>
                </div>

                {/* Footer Light Preview */}
                <div
                  style={{
                    background: "linear-gradient(180deg, #dce3eb 0%, #ccd7e2 100%)",
                    border: "1px solid rgba(148, 163, 184, 0.45)",
                    borderRadius: "6px",
                    padding: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "65px",
                  }}
                >
                  <img
                    src={activeFooterLight}
                    alt="Active Day Mode Footer Logo"
                    style={{ maxHeight: "48px", maxWidth: "220px", objectFit: "contain" }}
                  />
                </div>

                <FormField
                  label="Upload Day Mode Footer Logo"
                  error={formErrors.logo_footer_light}
                  description="Transparent PNG, WebP or SVG (max 10MB). Dark/metallic artwork."
                >
                  <Upload
                    name="logo_footer_light"
                    accept="image/*,.svg"
                    disabled={!canChange || submitting}
                    onFilesSelected={(files) => {
                      if (files.length > 0) setClearLogoFooterLight(false);
                    }}
                  />
                </FormField>

                {initialSettings.logo_footer_light && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "-0.25rem" }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!canChange || submitting}
                      onClick={() => setClearLogoFooterLight((prev) => !prev)}
                    >
                      <RotateCcw size={13} />
                      <span>{clearLogoFooterLight ? "Keep Custom Footer Logo" : "Reset to Header Fallback"}</span>
                    </Button>
                    {clearLogoFooterLight && (
                      <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 600 }}>
                        Will reset on Save
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Browser Tab Icon (Favicon) */}
          <div
            style={{
              marginTop: "1.25rem",
              border: "1px solid var(--border-default)",
              borderRadius: "6px",
              padding: "1.25rem",
              background: "var(--surface-secondary)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
              alignItems: "start",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                  <Globe size={15} style={{ color: "var(--action-primary)" }} />
                  Browser Tab Icon (Favicon)
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: initialSettings.favicon && !clearFavicon ? "rgba(245, 158, 11, 0.14)" : "var(--surface-primary)",
                    color: initialSettings.favicon && !clearFavicon ? "#d97706" : "var(--text-muted)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  {initialSettings.favicon && !clearFavicon ? "Custom Active" : "Default Fallback"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
                Displayed in browser tabs, bookmarks, and mobile shortcuts across the public website and dashboard.
              </p>

              {/* Browser Tab Mockups (Dark + Light Chrome) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", minWidth: 0 }}>
                    <img
                      src={activeFaviconSrc}
                      alt="Browser Tab Icon Dark Preview"
                      style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formData.name || "DREAM CAR HOUSE"}
                    </span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#94a3b8", flexShrink: 0 }}>Dark Tab</span>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", minWidth: 0 }}>
                    <img
                      src={activeFaviconSrc}
                      alt="Browser Tab Icon Light Preview"
                      style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formData.name || "DREAM CAR HOUSE"}
                    </span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#64748b", flexShrink: 0 }}>Light Tab</span>
                </div>
              </div>

              {initialSettings.favicon && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!canChange || submitting}
                    onClick={() => setClearFavicon((prev) => !prev)}
                  >
                    <RotateCcw size={13} />
                    <span>{clearFavicon ? "Keep Current Custom Icon" : "Reset to Default Icon"}</span>
                  </Button>
                  {clearFavicon && (
                    <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 600 }}>
                      Will reset when you click Save
                    </span>
                  )}
                </div>
              )}
            </div>

            <FormField
              label="Upload New Browser Tab Icon"
              error={formErrors.favicon}
              description="Square ICO, PNG, SVG, WebP, or JPG (max 5MB; recommended 64x64 or 512x512). Click Save below after selecting."
            >
              <Upload
                name="favicon"
                accept=".ico,.png,.svg,.webp,.jpg,.jpeg,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp,image/jpeg"
                maxSizeBytes={5 * 1024 * 1024}
                onFilesSelected={(files) => {
                  if (files.length > 0) setClearFavicon(false);
                }}
                disabled={!canChange || submitting}
              />
            </FormField>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Section 2: Showroom Brand & Business Information */}
        {/* ========================================================================= */}
        <div
          style={{
            background: "var(--surface-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Globe size={18} style={{ color: "var(--action-primary)" }} />
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              Business Name & Digital Presence
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormField label="Showroom / Business Name" required error={formErrors.name}>
              <Input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="DREAM CAR HOUSE"
                disabled={!canChange || submitting}
                required
              />
            </FormField>

            <FormField label="Official Website URL" required error={formErrors.website}>
              <Input
                name="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://dreamcarhouse.com"
                disabled={!canChange || submitting}
                required
              />
            </FormField>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <FormField label="Hero Tagline (Brand Philosophy)" error={formErrors.tagline} description="Displayed on showroom hero banners and metadata previews.">
              <Input
                name="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka."
                disabled={!canChange || submitting}
              />
            </FormField>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Section 3: Concierge & Contact Lines */}
        {/* ========================================================================= */}
        <div
          style={{
            background: "var(--surface-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Phone size={18} style={{ color: "var(--success)" }} />
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              Concierge, Phone & WhatsApp Hotlines
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <FormField label="Hotline (Priority Line)" required error={formErrors.hotline}>
              <Input
                name="hotline"
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                placeholder="01615-121312"
                disabled={!canChange || submitting}
                required
              />
            </FormField>

            <FormField label="Direct Showroom Phone" required error={formErrors.phone}>
              <Input
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1615-121312"
                disabled={!canChange || submitting}
                required
              />
            </FormField>

            <FormField label="WhatsApp Concierge Number" required error={formErrors.whatsapp}>
              <Input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+8801615121312"
                disabled={!canChange || submitting}
                required
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <FormField label="Official Contact Email" required error={formErrors.email}>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="dreamcarhouse101@gmail.com"
                disabled={!canChange || submitting}
                required
              />
            </FormField>

            <FormField label="General Showroom Operating Hours" required error={formErrors.opening_hours_text}>
              <Input
                name="opening_hours_text"
                value={formData.opening_hours_text}
                onChange={(e) => setFormData({ ...formData, opening_hours_text: e.target.value })}
                placeholder="Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)"
                disabled={!canChange || submitting}
                required
              />
            </FormField>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Section 4: Address, Showroom & Footer Details */}
        {/* ========================================================================= */}
        <div
          style={{
            background: "var(--surface-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <MapPin size={18} style={{ color: "var(--danger)" }} />
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              Physical Showroom Address & Legal Footer Copy
            </h3>
          </div>

          <FormField label="Primary Showroom Address" required error={formErrors.primary_address}>
            <Input
              name="primary_address"
              value={formData.primary_address}
              onChange={(e) => setFormData({ ...formData, primary_address: e.target.value })}
              placeholder="18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka - 1000"
              disabled={!canChange || submitting}
              required
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <FormField label="Footer Tagline" error={formErrors.footer_tagline}>
              <Input
                name="footer_tagline"
                value={formData.footer_tagline}
                onChange={(e) => setFormData({ ...formData, footer_tagline: e.target.value })}
                placeholder="Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka."
                disabled={!canChange || submitting}
              />
            </FormField>

            <FormField label="Footer Copyright Notice" required error={formErrors.footer_copy_text}>
              <Input
                name="footer_copy_text"
                value={formData.footer_copy_text}
                onChange={(e) => setFormData({ ...formData, footer_copy_text: e.target.value })}
                placeholder="© 2026 DREAM CAR HOUSE. All rights reserved."
                disabled={!canChange || submitting}
                required
              />
            </FormField>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Bottom Actions Bar */}
        {/* ========================================================================= */}
        <div
          style={{
            background: "var(--surface-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Info size={14} />
            Instant ISR revalidation triggers across frontend upon saving.
          </span>

          <Button
            type="submit"
            variant="primary"
            disabled={!canChange || submitting}
            isLoading={submitting}
            leftIcon={<Save size={16} />}
          >
            <span>{submitting ? "Saving All Settings..." : "Save Business Settings"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
