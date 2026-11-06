"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateSiteSettingsAction } from "@/app/actions/settings";
import type { SiteSettingsItem } from "@/lib/types";
import { Settings, Save, ExternalLink } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const res = await updateSiteSettingsAction(body);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Settings Saved",
          message: "Public business identity and contact details updated successfully.",
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
    <div style={{ padding: "1.5rem", maxWidth: "960px", margin: "0 auto" }}>
      <div
        style={{
          background: "#11141a",
          border: "1px solid #1e2430",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Settings size={20} className="text-amber-500" />
              General Business & Brand Settings
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              Changes take effect immediately on public Header, Footer, and Contact components without rebuild.
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
              fontSize: "0.85rem",
              color: "#38bdf8",
              textDecoration: "none",
            }}
          >
            <span>View Public Website</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Row 1: Business Name & Website */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormField label="Business Name" required error={formErrors.name}>
              <Input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="DREAM CAR HOUSE"
                disabled={!canChange || submitting}
                required
              />
            </FormField>

            <FormField label="Website URL" required error={formErrors.website}>
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

          {/* Row 2: Tagline */}
          <FormField label="Brand Tagline" error={formErrors.tagline}>
            <Input
              name="tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka."
              disabled={!canChange || submitting}
            />
          </FormField>

          {/* Row 3: Hotline, Phone & WhatsApp */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <FormField label="Hotline (Concierge Line)" required error={formErrors.hotline}>
              <Input
                name="hotline"
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                placeholder="01615-121312"
                disabled={!canChange || submitting}
                required
              />
            </FormField>

            <FormField label="Direct Phone" required error={formErrors.phone}>
              <Input
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1615-121312"
                disabled={!canChange || submitting}
                required
              />
            </FormField>

            <FormField label="WhatsApp Number" required error={formErrors.whatsapp}>
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

          {/* Row 4: Email & Opening Hours */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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

            <FormField label="General Opening Hours Text" required error={formErrors.opening_hours_text}>
              <Input
                name="opening_hours_text"
                value={formData.opening_hours_text}
                onChange={(e) => setFormData({ ...formData, opening_hours_text: e.target.value })}
                placeholder="Sat – Thu: 10:00 AM – 9:00 PM"
                disabled={!canChange || submitting}
                required
              />
            </FormField>
          </div>

          {/* Row 5: Primary Address */}
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

          {/* Row 6: Footer Tagline & Copyright */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormField label="Footer Tagline" error={formErrors.footer_tagline}>
              <Input
                name="footer_tagline"
                value={formData.footer_tagline}
                onChange={(e) => setFormData({ ...formData, footer_tagline: e.target.value })}
                placeholder="Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka."
                disabled={!canChange || submitting}
              />
            </FormField>

            <FormField label="Footer Copyright Text" required error={formErrors.footer_copy_text}>
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

          {/* Action Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <Button
              type="submit"
              variant="primary"
              disabled={!canChange || submitting}
              isLoading={submitting}
              leftIcon={<Save size={16} />}
            >
              <span>{submitting ? "Saving Changes..." : "Save Settings"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
