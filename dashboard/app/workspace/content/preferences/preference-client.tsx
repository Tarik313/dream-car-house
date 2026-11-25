"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  updatePreferenceSectionAction,
  updatePreferenceCategoryAction,
} from "@/app/actions/preference";
import type { PreferenceSectionItem } from "@/lib/types";
import { Save, Layers, CheckCircle2, SlidersHorizontal, Info } from "lucide-react";

interface PreferenceClientProps {
  initialData: PreferenceSectionItem;
  userPermissions?: string[];
}

export function PreferenceClient({
  initialData,
  userPermissions = [],
}: PreferenceClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_preferencesection") ||
    userPermissions.includes("home.change_preferencecategory");

  // Section fields state
  const [sectionData, setSectionData] = useState({
    heading: initialData?.heading || "Choose per your preference",
    badge: initialData?.badge || "CURATED INVENTORY",
    subtext: initialData?.subtext || "Toggle between factory-fresh zero mileage units and certified showroom pre-owned vehicles.",
  });

  // Active Category selection
  const categories = initialData?.categories || [];
  const [activeCatId, setActiveCatId] = useState<number>(
    categories[0]?.id || 1
  );

  const activeCategory =
    categories.find((c) => c.id === activeCatId) || categories[0];

  // Category state map (preserves backend model fields to maintain API compatibility)
  const [catForms, setCatForms] = useState<
    Record<
      number,
      {
        label: string;
        badge: string;
        subtext: string;
        cta_text: string;
        cta_url: string;
        highlights: { title: string; description: string }[];
        imageFile: File | null;
        imagePreview: string | null;
      }
    >
  >(() => {
    const map: Record<number, any> = {};
    for (const c of categories) {
      map[c.id] = {
        label: c.label || "",
        badge: c.badge || "",
        subtext: c.subtext || "",
        cta_text: c.cta_text || "/inventory",
        cta_url: c.cta_url || "/inventory",
        highlights:
          Array.isArray(c.highlights) && c.highlights.length > 0
            ? c.highlights
            : [
                { title: "Zero Mileage Import", description: "Direct container delivery" },
                { title: "Diagnostic Verified", description: "150+ point inspection" },
                { title: "VIP Registration", description: "White-glove handover" },
              ],
        imageFile: null,
        imagePreview: c.image_url || c.image || null,
      };
    }
    return map;
  });

  const [savingSection, setSavingSection] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  const handleSectionSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChange) {
      showToast({
        type: "error",
        title: "Permission Denied",
        message: "You do not have permission to modify this section.",
      });
      return;
    }

    setSavingSection(true);
    const body = new FormData();
    body.append("heading", sectionData.heading);
    body.append("badge", sectionData.badge);
    body.append("subtext", sectionData.subtext);

    try {
      const res = await updatePreferenceSectionAction(body);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Section Saved",
          message: "Preference section heading updated.",
        });
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: res.error?.message || "Could not save section header.",
        });
      }
    } catch (err: unknown) {
      showToast({
        type: "error",
        title: "Network Error",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSavingSection(false);
    }
  };

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;
    if (!canChange) {
      showToast({
        type: "error",
        title: "Permission Denied",
        message: "You do not have permission to modify categories.",
      });
      return;
    }

    const currentCatForm = catForms[activeCategory.id];
    if (!currentCatForm) return;

    setSavingCategory(true);
    const body = new FormData();
    body.append("label", currentCatForm.label);
    body.append("badge", currentCatForm.badge);
    body.append("subtext", currentCatForm.subtext);
    body.append("cta_text", currentCatForm.cta_text || "Explore All");
    body.append("cta_url", currentCatForm.cta_url || "/inventory");
    body.append("highlights", JSON.stringify(currentCatForm.highlights));

    try {
      const res = await updatePreferenceCategoryAction(activeCategory.id, body);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Category Saved",
          message: `Tab label '${currentCatForm.label}' updated successfully.`,
        });
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: res.error?.message || "Could not save category.",
        });
      }
    } catch (err: unknown) {
      showToast({
        type: "error",
        title: "Network Error",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSavingCategory(false);
    }
  };

  const currentForm = activeCategory ? catForms[activeCategory.id] : null;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem 0" }}>
      {/* 1. Section Global Heading */}
      <div
        style={{
          background: "var(--card-bg, #11141a)",
          border: "1px solid var(--border-color, #1f2937)",
          borderRadius: "10px",
          padding: "1.75rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Layers size={20} color="#22c55e" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Preference Showcase Heading
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
          Controls the main section heading shown above the vehicle segment switcher on the homepage.
        </p>

        <form onSubmit={handleSectionSave}>
          <div style={{ marginBottom: "1.25rem" }}>
            <FormField label="Main Section Heading *">
              <Input
                value={sectionData.heading}
                onChange={(e) => setSectionData({ ...sectionData, heading: e.target.value })}
                placeholder="Choose per your preference"
                required
              />
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" isLoading={savingSection} disabled={!canChange}>
              <Save size={16} /> Save Section Heading
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Segment Switcher Tabs Configuration */}
      <div
        style={{
          background: "var(--card-bg, #11141a)",
          border: "1px solid var(--border-color, #1f2937)",
          borderRadius: "10px",
          padding: "1.75rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <SlidersHorizontal size={20} color="#38bdf8" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Segment Switcher Tabs (Brand New, Reconditioned, Pre-Owned)
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
          Manage the tab labels shown on the homepage segment controller.
        </p>

        {/* Category Picker Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.75rem", borderBottom: "1px solid #1f2937", paddingBottom: "1rem" }}>
          {categories.map((cat) => {
            const isActive = cat.id === activeCatId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCatId(cat.id)}
                style={{
                  background: isActive ? "#ffffff" : "#1f2937",
                  color: isActive ? "#000000" : "#d1d5db",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.6rem 1.25rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>{catForms[cat.id]?.label || cat.label}</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase" }}>
                  ({cat.category_key})
                </span>
              </button>
            );
          })}
        </div>

        {activeCategory && currentForm && (
          <form onSubmit={handleCategorySave}>
            <div style={{ marginBottom: "1.5rem" }}>
              <FormField label="Tab Display Label *" description="The text displayed on this tab button on the homepage.">
                <Input
                  value={currentForm.label}
                  onChange={(e) =>
                    setCatForms({
                      ...catForms,
                      [activeCategory.id]: { ...currentForm, label: e.target.value },
                    })
                  }
                  required
                />
              </FormField>
            </div>

            {/* Clean Live Info Notice (Explains why legacy cards are removed) */}
            <div
              style={{
                background: "rgba(56, 189, 248, 0.06)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "8px",
                padding: "1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <Info size={22} color="#38bdf8" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#ffffff", margin: "0 0 0.35rem 0" }}>
                  Live Luxury Showcase Behavior
                </h4>
                <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: 0, lineHeight: 1.6 }}>
                  When visitors click <strong>{currentForm.label}</strong> on the homepage, the website automatically displays the top 3 live cars from that category in your <strong>Inventory</strong>, complete with photo cards, live stock count, and direct links.
                  <br />
                  <span style={{ color: "#94a3b8", display: "inline-block", marginTop: "0.35rem" }}>
                    • Legacy 3 guarantee text cards and banner image uploads have been retired from this dashboard view to ensure 100% parity with your clean live UI.
                  </span>
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" isLoading={savingCategory} disabled={!canChange}>
                <CheckCircle2 size={16} /> Save Tab Label
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
