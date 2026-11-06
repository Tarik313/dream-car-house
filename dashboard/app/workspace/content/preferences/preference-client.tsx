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
import type { PreferenceSectionItem, PreferenceCategoryItem } from "@/lib/types";
import { Save, Layers, Upload, Image as ImageIcon } from "lucide-react";

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

  // Category state map
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
        cta_text: c.cta_text || "",
        cta_url: c.cta_url || "",
        highlights:
          Array.isArray(c.highlights) && c.highlights.length > 0
            ? c.highlights.map((h) => ({
                title: h.title || "",
                description: h.description || "",
              }))
            : [
                { title: "", description: "" },
                { title: "", description: "" },
                { title: "", description: "" },
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
          message: "Preference section header and subtext updated.",
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
    body.append("cta_text", currentCatForm.cta_text);
    body.append("cta_url", currentCatForm.cta_url);
    body.append("highlights", JSON.stringify(currentCatForm.highlights));

    if (currentCatForm.imageFile) {
      body.append("image", currentCatForm.imageFile);
    }

    try {
      const res = await updatePreferenceCategoryAction(activeCategory.id, body);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Category Saved",
          message: `Category '${currentCatForm.label}' updated successfully.`,
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
      {/* Section Global Settings */}
      <div
        style={{
          background: "var(--card-bg, #11141a)",
          border: "1px solid var(--border-color, #1f2937)",
          borderRadius: "10px",
          padding: "1.75rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <Layers size={20} color="#22c55e" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Section Heading & Context
          </h2>
        </div>

        <form onSubmit={handleSectionSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
            <FormField label="Badge Tag">
              <Input
                value={sectionData.badge}
                onChange={(e) => setSectionData({ ...sectionData, badge: e.target.value })}
                placeholder="CURATED INVENTORY"
              />
            </FormField>
            <FormField label="Main Section Heading *">
              <Input
                value={sectionData.heading}
                onChange={(e) => setSectionData({ ...sectionData, heading: e.target.value })}
                placeholder="Choose per your preference"
                required
              />
            </FormField>
          </div>

          <FormField label="Subtext Description">
            <Input
              value={sectionData.subtext}
              onChange={(e) => setSectionData({ ...sectionData, subtext: e.target.value })}
              placeholder="Toggle between factory-fresh zero mileage units and certified showroom pre-owned vehicles."
            />
          </FormField>

          <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" isLoading={savingSection} disabled={!canChange}>
              <Save size={16} /> Save Section Header
            </Button>
          </div>
        </form>
      </div>

      {/* Category Tabs & Editor */}
      <div
        style={{
          background: "var(--card-bg, #11141a)",
          border: "1px solid var(--border-color, #1f2937)",
          borderRadius: "10px",
          padding: "1.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Preference Categories Configuration
          </h2>
        </div>

        {/* Category Picker Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", borderBottom: "1px solid #1f2937", paddingBottom: "0.75rem" }}>
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
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {cat.label} ({cat.category_key})
              </button>
            );
          })}
        </div>

        {activeCategory && currentForm && (
          <form onSubmit={handleCategorySave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <FormField label="Category Label *">
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

              <FormField label="Category Badge (Optional)">
                <Input
                  value={currentForm.badge}
                  onChange={(e) =>
                    setCatForms({
                      ...catForms,
                      [activeCategory.id]: { ...currentForm, badge: e.target.value },
                    })
                  }
                  placeholder="e.g. ZERO METER"
                />
              </FormField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <FormField label="Call to Action Text *">
                <Input
                  value={currentForm.cta_text}
                  onChange={(e) =>
                    setCatForms({
                      ...catForms,
                      [activeCategory.id]: { ...currentForm, cta_text: e.target.value },
                    })
                  }
                  required
                />
              </FormField>

              <FormField label="CTA Destination URL *">
                <Input
                  value={currentForm.cta_url}
                  onChange={(e) =>
                    setCatForms({
                      ...catForms,
                      [activeCategory.id]: { ...currentForm, cta_url: e.target.value },
                    })
                  }
                  required
                />
              </FormField>
            </div>

            {/* Category Banner Image Upload */}
            <div style={{ marginBottom: "2rem", padding: "1.25rem", background: "#0a0c10", borderRadius: "8px", border: "1px dashed #374151" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem" }}>
                Category Banner / Showcase Image (Optional)
              </label>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "1rem" }}>
                Upload a showcase banner for this category (jpg, jpeg, png, webp up to 10MB).
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                {currentForm.imagePreview ? (
                  <div style={{ width: "160px", height: "90px", borderRadius: "6px", overflow: "hidden", border: "1px solid #374151", position: "relative" }}>
                    <img src={currentForm.imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ width: "160px", height: "90px", borderRadius: "6px", background: "#11141a", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                    <ImageIcon size={24} />
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    id={`cat-file-${activeCategory.id}`}
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert("File size exceeds 10MB limit.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          setCatForms({
                            ...catForms,
                            [activeCategory.id]: {
                              ...currentForm,
                              imageFile: file,
                              imagePreview: re.target?.result as string,
                            },
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => document.getElementById(`cat-file-${activeCategory.id}`)?.click()}
                  >
                    <Upload size={16} /> Choose Image
                  </Button>
                  {currentForm.imageFile && (
                    <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem", color: "#22c55e" }}>
                      {currentForm.imageFile.name} ready to save
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Highlights Editor (3 Cards) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem" }}>
                Trust / Guarantee Highlights (3 Cards)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                {currentForm.highlights.map((h, idx) => (
                  <div key={idx} style={{ background: "#0a0c10", border: "1px solid #1f2937", borderRadius: "8px", padding: "1rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>
                      CARD 0{idx + 1}
                    </span>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Title</label>
                      <Input
                        value={h.title}
                        onChange={(e) => {
                          const nextH = [...currentForm.highlights];
                          nextH[idx] = { title: e.target.value, description: nextH[idx]?.description ?? "" };
                          setCatForms({
                            ...catForms,
                            [activeCategory.id]: { ...currentForm, highlights: nextH },
                          });
                        }}
                        placeholder="Highlight Title"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Description</label>
                      <Input
                        value={h.description}
                        onChange={(e) => {
                          const nextH = [...currentForm.highlights];
                          nextH[idx] = { title: nextH[idx]?.title ?? "", description: e.target.value };
                          setCatForms({
                            ...catForms,
                            [activeCategory.id]: { ...currentForm, highlights: nextH },
                          });
                        }}
                        placeholder="Short description snippet"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <Button type="submit" isLoading={savingCategory} disabled={!canChange}>
                <Save size={16} /> Save Category Details
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
