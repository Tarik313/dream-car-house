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
import type { PreferenceSectionItem, InventoryListItem } from "@/lib/types";
import { Save, Layers, CheckCircle2, SlidersHorizontal, Info, Car, X } from "lucide-react";

interface PreferenceClientProps {
  initialData: PreferenceSectionItem;
  inventoryCars?: InventoryListItem[];
  userPermissions?: string[];
}

export function PreferenceClient({
  initialData,
  inventoryCars = [],
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
        featured_vehicle_ids: number[];
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
            : [],
        featured_vehicle_ids: Array.isArray(c.featured_vehicle_ids)
          ? c.featured_vehicle_ids
          : [],
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
    body.append(
      "featured_vehicle_ids",
      JSON.stringify(currentCatForm.featured_vehicle_ids.filter((id) => id > 0).slice(0, 3))
    );

    try {
      const res = await updatePreferenceCategoryAction(activeCategory.id, body);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Category Saved",
          message: `Category '${currentCatForm.label}' and showcase vehicles updated successfully.`,
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

  // Helper to find vehicle by ID
  const getCarById = (id: number) => {
    return inventoryCars.find((c) => c.id === id);
  };

  // Split cars into matching category and others
  const matchingCars = inventoryCars.filter((c) => {
    if (!activeCategory) return true;
    if (activeCategory.category_key === "BRAND_NEW") {
      return c.car_type === "BRAND_NEW";
    }
    if (activeCategory.category_key === "RECONDITIONED") {
      return c.car_type === "RECONDITIONED";
    }
    if (activeCategory.category_key === "PRE_OWNED") {
      return c.car_type === "PRE_OWNED";
    }
    return true;
  });
  const otherCars = inventoryCars.filter((c) => !matchingCars.some((m) => m.id === c.id));

  const handleSlotSelect = (slotIdx: number, val: string) => {
    if (!activeCategory || !currentForm) return;
    const currentIds = [...(currentForm.featured_vehicle_ids || [])];
    while (currentIds.length <= slotIdx) {
      currentIds.push(0);
    }
    const num = parseInt(val, 10);
    currentIds[slotIdx] = isNaN(num) || num <= 0 ? 0 : num;

    setCatForms({
      ...catForms,
      [activeCategory.id]: {
        ...currentForm,
        featured_vehicle_ids: currentIds,
      },
    });
  };

  const handleSlotClear = (slotIdx: number) => {
    handleSlotSelect(slotIdx, "0");
  };

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

      {/* 2. Segment Switcher Tabs & Curated Vehicles Configuration */}
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
          Manage tab labels and curate the 3 vehicles showcased under each category on the homepage.
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

            {/* 3. Curated 3-Car Showcase Allocations */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid #1f2937",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Car size={18} color="#eab308" />
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                    Curated 3-Car Showcase (Homepage Display)
                  </h3>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#9ca3af", background: "#1f2937", padding: "0.2rem 0.6rem", borderRadius: "4px" }}>
                  Exact Order: Left → Center → Right
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                Manually pick which 3 vehicles appear under <strong>{currentForm.label}</strong>. If a slot is left on <em>Auto</em>, the website will automatically showcase the newest vehicle from this category.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                {[0, 1, 2].map((slotIdx) => {
                  const selectedId = currentForm.featured_vehicle_ids[slotIdx] || 0;
                  const selectedCar = getCarById(selectedId);

                  return (
                    <div
                      key={slotIdx}
                      style={{
                        background: "#0d1117",
                        border: selectedId ? "1px solid #3b82f6" : "1px solid #1f2937",
                        borderRadius: "8px",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: selectedId ? "#60a5fa" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Slot 0{slotIdx + 1} {slotIdx === 0 ? "(Featured Left)" : slotIdx === 1 ? "(Featured Center)" : "(Featured Right)"}
                        </span>
                        {selectedId > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSlotClear(slotIdx)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <X size={12} /> Clear
                          </button>
                        )}
                      </div>

                      <select
                        value={selectedId || ""}
                        onChange={(e) => handleSlotSelect(slotIdx, e.target.value)}
                        style={{
                          background: "#161b22",
                          color: "#ffffff",
                          border: "1px solid #30363d",
                          borderRadius: "6px",
                          padding: "0.6rem 0.75rem",
                          fontSize: "0.85rem",
                          width: "100%",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="">• Auto (Show latest published car) •</option>
                        {matchingCars.length > 0 && (
                          <optgroup label={`Matching Category (${activeCategory.label})`}>
                            {matchingCars.map((car) => (
                              <option key={car.id} value={car.id}>
                                {car.name} ({car.year || "N/A"}) - {car.is_call_for_price ? "Call for Price" : car.price ? `${car.price} BDT` : "N/A"}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {otherCars.length > 0 && (
                          <optgroup label="Other Available Vehicles">
                            {otherCars.map((car) => (
                              <option key={car.id} value={car.id}>
                                [{car.car_type || "CAR"}] {car.name} ({car.year || "N/A"})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>

                      {/* Selected Preview Box */}
                      {selectedCar ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "center",
                            background: "rgba(59, 130, 246, 0.08)",
                            padding: "0.6rem",
                            borderRadius: "6px",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          {selectedCar.feature_image ? (
                            <img
                              src={selectedCar.feature_image}
                              alt={selectedCar.name}
                              style={{ width: "50px", height: "38px", objectFit: "cover", borderRadius: "4px" }}
                            />
                          ) : (
                            <div style={{ width: "50px", height: "38px", background: "#1f2937", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Car size={18} color="#6b7280" />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {selectedCar.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#93c5fd" }}>
                              {selectedCar.is_call_for_price ? "Call for Price" : selectedCar.price ? `${selectedCar.price} BDT` : "Published"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.78rem", color: "#6b7280", fontStyle: "italic", padding: "0.25rem 0" }}>
                          No specific car pinned. Auto-selecting latest.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clean Live Info Notice */}
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
                  When visitors click <strong>{currentForm.label}</strong> on the homepage, the website will display your 3 curated showcase cars in exact order (Left → Center → Right).
                  <br />
                  <span style={{ color: "#94a3b8", display: "inline-block", marginTop: "0.35rem" }}>
                    • Any slot set to &quot;Auto&quot; will automatically pull from your newest published inventory.
                  </span>
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" isLoading={savingCategory} disabled={!canChange}>
                <CheckCircle2 size={16} /> Save Tab &amp; Showcase Allocations
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
