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
    <div className="space-y-8 pb-16 max-w-5xl">
      {/* 1. Section Global Heading */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Layers className="w-5 h-5 text-action-primary" />
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Preference Showcase Heading
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Controls the main section heading shown above the vehicle segment switcher on the homepage.
            </p>
          </div>
        </div>

        <form onSubmit={handleSectionSave} className="space-y-4">
          <FormField label="Main Section Heading *">
            <Input
              value={sectionData.heading}
              onChange={(e) => setSectionData({ ...sectionData, heading: e.target.value })}
              placeholder="Choose per your preference"
              required
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={savingSection} disabled={!canChange}>
              <Save size={16} /> Save Section Heading
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Segment Switcher Tabs & Curated Vehicles Configuration */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <SlidersHorizontal className="w-5 h-5 text-action-primary" />
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Segment Switcher Tabs (Brand New, Reconditioned, Pre-Owned)
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Manage tab labels and curate the 3 vehicles showcased under each category on the homepage.
            </p>
          </div>
        </div>

        {/* Category Picker Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {categories.map((cat) => {
            const isActive = cat.id === activeCatId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCatId(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border ${
                  isActive
                    ? "bg-action-primary text-white border-action-primary"
                    : "bg-surface-secondary text-text-secondary hover:text-text-primary border-border"
                }`}
              >
                <span>{catForms[cat.id]?.label || cat.label}</span>
                <span className={`text-xs uppercase ${isActive ? "text-white/80" : "text-text-muted"}`}>
                  ({cat.category_key})
                </span>
              </button>
            );
          })}
        </div>

        {activeCategory && currentForm && (
          <form onSubmit={handleCategorySave} className="space-y-6">
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

            {/* 3. Curated 3-Car Showcase Allocations */}
            <div className="bg-surface-secondary/40 border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-semibold text-text-primary">
                    Curated 3-Car Showcase (Homepage Display)
                  </h3>
                </div>
                <span className="text-xs text-text-muted bg-surface px-2.5 py-1 rounded border border-border">
                  Exact Order: Left → Center → Right
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Manually pick which 3 vehicles appear under <strong>{currentForm.label}</strong>. If a slot is left on <em>Auto</em>, the website will automatically showcase the newest vehicle from this category.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((slotIdx) => {
                  const selectedId = currentForm.featured_vehicle_ids[slotIdx] || 0;
                  const selectedCar = getCarById(selectedId);

                  return (
                    <div
                      key={slotIdx}
                      className={`bg-surface border rounded-lg p-3.5 flex flex-col gap-3 ${
                        selectedId ? "border-action-primary ring-1 ring-action-primary/20" : "border-border"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold uppercase tracking-wider ${selectedId ? "text-action-primary" : "text-text-muted"}`}>
                          Slot 0{slotIdx + 1} {slotIdx === 0 ? "(Left)" : slotIdx === 1 ? "(Center)" : "(Right)"}
                        </span>
                        {selectedId > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSlotClear(slotIdx)}
                            className="text-xs text-danger hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                          >
                            <X size={12} /> Clear
                          </button>
                        )}
                      </div>

                      <select
                        value={selectedId || ""}
                        onChange={(e) => handleSlotSelect(slotIdx, e.target.value)}
                        className="w-full bg-surface text-text-primary border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-action-primary cursor-pointer"
                      >
                        <option value="">• Auto (Latest published car) •</option>
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
                        <div className="flex items-center gap-2.5 bg-action-primary/5 border border-action-primary/20 rounded-md p-2">
                          {selectedCar.feature_image ? (
                            <img
                              src={selectedCar.feature_image}
                              alt={selectedCar.name}
                              className="w-12 h-9 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-9 bg-surface-secondary rounded flex items-center justify-center">
                              <Car size={16} className="text-text-muted" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-text-primary truncate">
                              {selectedCar.name}
                            </div>
                            <div className="text-xs text-action-primary font-medium">
                              {selectedCar.is_call_for_price ? "Call for Price" : selectedCar.price ? `${selectedCar.price} BDT` : "Published"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted italic py-1">
                          No specific car pinned. Auto-selecting latest.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clean Live Info Notice */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-4 flex gap-3 items-start text-blue-950">
              <Info size={20} className="text-action-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">
                  Live Luxury Showcase Behavior
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  When visitors click <strong>{currentForm.label}</strong> on the homepage, the website will display your 3 curated showcase cars in exact order (Left → Center → Right).
                  <br />
                  <span className="text-text-muted inline-block mt-1">
                    • Any slot set to &quot;Auto&quot; will automatically pull from your newest published inventory.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
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
