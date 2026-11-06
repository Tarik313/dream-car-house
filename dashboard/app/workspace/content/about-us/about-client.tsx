"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs } from "@/components/ui/Tabs";
import { Upload } from "@/components/ui/Upload";
import { useToast } from "@/components/ui/Toast";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { updateAboutSectionAction } from "@/app/actions/about";
import type { AboutSectionItem, ShowroomBranchItem, AboutStatItem, AboutPillarItem } from "@/lib/types";

interface AboutClientProps {
  initialData: AboutSectionItem;
  branches: ShowroomBranchItem[];
  userPermissions?: string[];
}

export function AboutClient({
  initialData,
  userPermissions = [],
}: AboutClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("hero");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Dynamic Lists for Stats and Pillars
  const [statsList, setStatsList] = useState<AboutStatItem[]>(
    Array.isArray(initialData.stats) && initialData.stats.length > 0
      ? initialData.stats
      : [
          { number: "15+", label: "Years of Motoring Trust" },
          { number: "150+", label: "Point Diagnostic Audit" },
          { number: "100%", label: "Verified Global Provenance" },
          { number: "2", label: "Dhaka Flagship Showrooms" },
        ]
  );

  const [pillarsList, setPillarsList] = useState<AboutPillarItem[]>(
    Array.isArray(initialData.pillars) && initialData.pillars.length > 0
      ? initialData.pillars
      : [
          {
            title: "Direct Global Import",
            description: "Exclusive relationships with premier authorized dealerships in Stuttgart, Tokyo, and London facilitate direct, turnkey container importation with verified manifests.",
            icon: "globe",
          },
          {
            title: "150+ Point Diagnostic Audit",
            description: "Every vehicle undergoes exhaustive computerized diagnostic scans, chassis laser measurements, high-voltage battery audits, and genuine BRTA paper verifications.",
            icon: "check",
          },
          {
            title: "Private Handover Vault",
            description: "An exclusive soundproof delivery sanctuary featuring theatrical automotive unveilings, champagne reception, and confidential documentation management.",
            icon: "vault",
          },
          {
            title: "White-Glove Concierge",
            description: "Lifetime vehicle documentation support, tailored financing advisory, genuine factory parts procurement, and guaranteed priority buy-back valuations.",
            icon: "concierge",
          },
        ]
  );

  const handleStatChange = (index: number, key: keyof AboutStatItem, val: string) => {
    const updated = [...statsList];
    const current = updated[index];
    if (current) {
      updated[index] = { ...current, [key]: val };
      setStatsList(updated);
    }
  };

  const handleAddStat = () => {
    if (statsList.length >= 6) {
      showToast("Maximum of 6 key metrics allowed.", "error");
      return;
    }
    setStatsList([...statsList, { number: "100%", label: "New Trust Metric" }]);
  };

  const handleRemoveStat = (index: number) => {
    if (statsList.length <= 1) {
      showToast("At least 1 metric is required.", "error");
      return;
    }
    setStatsList(statsList.filter((_, idx) => idx !== index));
  };

  const handlePillarChange = (index: number, key: keyof AboutPillarItem, val: string) => {
    const updated = [...pillarsList];
    const current = updated[index];
    if (current) {
      updated[index] = { ...current, [key]: val };
      setPillarsList(updated);
    }
  };

  const handleAddPillar = () => {
    if (pillarsList.length >= 8) {
      showToast("Maximum of 8 distinction pillars allowed.", "error");
      return;
    }
    setPillarsList([
      ...pillarsList,
      { title: "Distinction Pillar", description: "Pillar description detailing client assurance.", icon: "check" },
    ]);
  };

  const handleRemovePillar = (index: number) => {
    if (pillarsList.length <= 1) {
      showToast("At least 1 pillar is required.", "error");
      return;
    }
    setPillarsList(pillarsList.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    const activeInput = form.elements.namedItem("is_active") as HTMLInputElement | null;
    formData.set("is_active", activeInput?.checked ? "true" : "false");

    formData.set("stats", JSON.stringify(statsList));
    formData.set("pillars", JSON.stringify(pillarsList));

    const res = await updateAboutSectionAction(formData);
    setSubmitting(false);

    if (res.ok) {
      showToast("About Us content saved successfully.", "success");
      router.refresh();
    } else {
      if (res.error.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.error.fieldErrors)) {
          flat[k] = Array.isArray(v) ? (v[0] ?? "") : String(v);
        }
        setFieldErrors(flat);
      }
      showToast(res.error.message || "Failed to update About Us content.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <a
          href="https://dreamcarhouse.com/about/"
          target="_blank"
          rel="noopener noreferrer"
          className="button button--secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
          title="View Live About Us Page on Website"
        >
          <ExternalLink size={16} /> View Live Page
        </a>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "hero", label: "Hero & Trust Stats" },
          { id: "heritage", label: "Heritage Story & Quote" },
          { id: "reel", label: "Cinematic Reel & Tour" },
          { id: "pillars", label: "4 Distinction Pillars" },
          { id: "cta", label: "VIP Consultation CTA" },
        ]}
      />

      {/* Tab 1: Hero & Trust Stats */}
      {activeTab === "hero" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="Hero Badge / Pill" error={fieldErrors.hero_badge}>
            <Input name="hero_badge" defaultValue={initialData.hero_badge || ""} placeholder="e.g. THE DREAM CAR HOUSE STORY" />
          </FormField>

          <FormField label="Hero Main Title" error={fieldErrors.hero_title} required>
            <Input name="hero_title" defaultValue={initialData.hero_title || ""} placeholder="Where Automotive Passion Meets Unrivaled Luxury" required />
          </FormField>

          <FormField label="Hero Subtitle" error={fieldErrors.hero_subtitle}>
            <Textarea name="hero_subtitle" defaultValue={initialData.hero_subtitle || ""} rows={3} />
          </FormField>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)", marginTop: "var(--space-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "var(--font-size-md)", color: "var(--text)" }}>Key Trust Metrics (Stats Grid)</h4>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>Displays in the 4-column trust counters on the About Us page.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddStat}>
                <Plus size={14} /> Add Metric
              </Button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-3)" }}>
              {statsList.map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "var(--space-3)",
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--muted)" }}>Metric #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(idx)}
                      style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", padding: "2px" }}
                      title="Remove Metric"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "var(--font-size-xs)", marginBottom: "4px", color: "var(--muted)" }}>Metric Number / Value</label>
                    <Input
                      value={stat.number}
                      onChange={(e) => handleStatChange(idx, "number", e.target.value)}
                      placeholder="e.g. 15+, 150+, 100%"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "var(--font-size-xs)", marginBottom: "4px", color: "var(--muted)" }}>Label Description</label>
                    <Input
                      value={stat.label}
                      onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                      placeholder="e.g. Years of Motoring Trust"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Heritage Story & Quote */}
      {activeTab === "heritage" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="Story Eyebrow" error={fieldErrors.story_eyebrow}>
            <Input name="story_eyebrow" defaultValue={initialData.story_eyebrow || ""} placeholder="OUR HERITAGE & PHILOSOPHY" />
          </FormField>

          <FormField label="Story Section Title" error={fieldErrors.story_title} required>
            <Input name="story_title" defaultValue={initialData.story_title || ""} placeholder="An Uncompromising Pursuit of Automotive Perfection" required />
          </FormField>

          <FormField label="Story Content - Paragraph 1" error={fieldErrors.story_content_p1}>
            <Textarea name="story_content_p1" defaultValue={initialData.story_content_p1 || ""} rows={4} />
          </FormField>

          <FormField label="Story Content - Paragraph 2" error={fieldErrors.story_content_p2}>
            <Textarea name="story_content_p2" defaultValue={initialData.story_content_p2 || ""} rows={4} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Foundational Quote" error={fieldErrors.quote_text}>
              <Textarea name="quote_text" defaultValue={initialData.quote_text || ""} rows={3} />
            </FormField>
            <FormField label="Quote Attribution / Author" error={fieldErrors.quote_author}>
              <Input name="quote_author" defaultValue={initialData.quote_author || ""} placeholder="DREAM CAR HOUSE Directorate" />
            </FormField>
          </div>
        </div>
      )}

      {/* Tab 3: Cinematic Reel & Tour */}
      {activeTab === "reel" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Reel Card Title" error={fieldErrors.reel_title}>
              <Input name="reel_title" defaultValue={initialData.reel_title || ""} placeholder="Flagship Automotive Showcase" />
            </FormField>
            <FormField label="Duration Pill" error={fieldErrors.reel_duration}>
              <Input name="reel_duration" defaultValue={initialData.reel_duration || ""} placeholder="4K REEL • 01:45" />
            </FormField>
          </div>

          <FormField label="Showroom Reel Video Target" error={fieldErrors.reel_video_target} description="Pass 'reel' to open built-in cinema modal or provide external video URL.">
            <Input name="reel_video_target" defaultValue={initialData.reel_video_target || "reel"} placeholder="reel" />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Full Tour CTA Button Label" error={fieldErrors.tour_cta_label}>
              <Input name="tour_cta_label" defaultValue={initialData.tour_cta_label || ""} placeholder="Watch Full Showroom Tour (02:30)" />
            </FormField>
            <FormField label="Tour Video Target" error={fieldErrors.tour_video_target} description="Pass 'tour' to open built-in tour video or provide external video URL.">
              <Input name="tour_video_target" defaultValue={initialData.tour_video_target || "tour"} placeholder="tour" />
            </FormField>
          </div>

          <FormField label="Reel Poster Image" error={fieldErrors.reel_image} description="Recommended: 1600x900 px. Upload new image or leave blank to keep existing.">
            {(initialData.reel_image_display || initialData.reel_image_url) && (
              <div style={{ marginBottom: "var(--space-2)" }}>
                <img
                  src={initialData.reel_image_display || initialData.reel_image_url}
                  alt={initialData.reel_title}
                  style={{ maxHeight: "140px", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
                />
              </div>
            )}
            <Upload name="reel_image" accept="image/*" />
          </FormField>

          <FormField label="Reel Poster Remote URL Fallback" error={fieldErrors.reel_image_url}>
            <Input name="reel_image_url" defaultValue={initialData.reel_image_url || ""} />
          </FormField>
        </div>
      )}

      {/* Tab 4: 4 Distinction Pillars */}
      {activeTab === "pillars" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-3)" }}>
            <FormField label="Pillars Eyebrow" error={fieldErrors.pillars_eyebrow}>
              <Input name="pillars_eyebrow" defaultValue={initialData.pillars_eyebrow || ""} placeholder="THE FOUR PILLARS" />
            </FormField>
            <FormField label="Pillars Main Heading" error={fieldErrors.pillars_title} required>
              <Input name="pillars_title" defaultValue={initialData.pillars_title || ""} placeholder="Why Connoisseurs Choose DREAM CAR HOUSE" required />
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "var(--font-size-md)", color: "var(--text)" }}>Distinction Pillars Grid</h4>
              <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>Displays in the 4-column distinction cards.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddPillar}>
              <Plus size={14} /> Add Pillar
            </Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-3)" }}>
            {pillarsList.map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  padding: "var(--space-3)",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--muted)" }}>Pillar #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePillar(idx)}
                    style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", padding: "2px" }}
                    title="Remove Pillar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "var(--font-size-xs)", marginBottom: "4px", color: "var(--muted)" }}>Pillar Title</label>
                  <Input
                    value={pillar.title}
                    onChange={(e) => handlePillarChange(idx, "title", e.target.value)}
                    placeholder="e.g. Direct Global Import"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "var(--font-size-xs)", marginBottom: "4px", color: "var(--muted)" }}>Icon Key</label>
                  <Input
                    value={pillar.icon || "check"}
                    onChange={(e) => handlePillarChange(idx, "icon", e.target.value)}
                    placeholder="globe, check, vault, concierge"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "var(--font-size-xs)", marginBottom: "4px", color: "var(--muted)" }}>Description</label>
                  <Textarea
                    value={pillar.description}
                    onChange={(e) => handlePillarChange(idx, "description", e.target.value)}
                    rows={3}
                    placeholder="Describe this distinction pillar..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: VIP Consultation CTA */}
      {activeTab === "cta" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="CTA Title" error={fieldErrors.cta_title} required>
            <Input name="cta_title" defaultValue={initialData.cta_title || ""} placeholder="Experience The Difference in Person" required />
          </FormField>

          <FormField label="CTA Description" error={fieldErrors.cta_description}>
            <Textarea name="cta_description" defaultValue={initialData.cta_description || ""} rows={3} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Primary Button Label" error={fieldErrors.cta_primary_label}>
              <Input name="cta_primary_label" defaultValue={initialData.cta_primary_label || ""} placeholder="Explore Current Inventory" />
            </FormField>
            <FormField label="Secondary Button Label" error={fieldErrors.cta_secondary_label}>
              <Input name="cta_secondary_label" defaultValue={initialData.cta_secondary_label || ""} placeholder="Schedule Showroom Tour" />
            </FormField>
            <FormField label="WhatsApp Button Label" error={fieldErrors.cta_whatsapp_label}>
              <Input name="cta_whatsapp_label" defaultValue={initialData.cta_whatsapp_label || ""} placeholder="Inquire on WhatsApp" />
            </FormField>
          </div>

          <FormField label="Publish Status">
            <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", marginTop: "var(--space-2)" }}>
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={initialData.is_active !== false}
                style={{ width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}>
                Active / Published on Website
              </span>
            </label>
          </FormField>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
