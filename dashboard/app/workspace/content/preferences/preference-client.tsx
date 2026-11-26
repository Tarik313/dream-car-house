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
import { Save, Layers, CheckCircle2, SlidersHorizontal, Info, Car, X, Sparkles, MapPin, ExternalLink } from "lucide-react";

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

            {/* 3. Curated 3-Car Showcase Cards */}
            <div className="bg-surface-secondary/40 border border-border rounded-xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Car className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Curated 3-Car Showcase Cards
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Exact Homepage Layout: <strong>Slot 01 (Left)</strong> → <strong>Slot 02 (Center)</strong> → <strong>Slot 03 (Right)</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-text-muted bg-surface px-2.5 py-1 rounded-md border border-border">
                    Active Tab: <strong className="text-text-primary">{currentForm.label}</strong>
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Choose custom showcase vehicles for each position. If a slot is set to <strong>Auto</strong>, the homepage automatically displays the latest available vehicle from this category.
              </p>

              {/* 3 Interactive Showcase Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {[0, 1, 2].map((slotIdx) => {
                  const selectedId = currentForm.featured_vehicle_ids[slotIdx] || 0;
                  const selectedCar = getCarById(selectedId);
                  const isPinned = selectedId > 0 && !!selectedCar;
                  const autoFallbackCar = matchingCars[slotIdx] || matchingCars[0] || null;
                  const displayCar = selectedCar || autoFallbackCar;

                  return (
                    <div
                      key={slotIdx}
                      className={`bg-surface border rounded-xl overflow-hidden flex flex-col transition-all duration-150 ${
                        isPinned
                          ? "border-action-primary ring-1 ring-action-primary/30"
                          : "border-border hover:border-text-muted/40"
                      }`}
                      style={{ boxShadow: "none" }}
                    >
                      {/* Card Top Banner / Meta Header */}
                      <div className="px-4 py-2.5 bg-surface-secondary/70 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-text-primary text-white px-2 py-0.5 rounded">
                            Slot 0{slotIdx + 1}
                          </span>
                          <span className="text-xs font-semibold text-text-primary">
                            {slotIdx === 0 ? "Left Position" : slotIdx === 1 ? "Center Highlight" : "Right Position"}
                          </span>
                        </div>

                        {isPinned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} className="text-emerald-600" /> Pinned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Sparkles size={11} className="text-amber-600" /> Auto Live
                          </span>
                        )}
                      </div>

                      {/* Vehicle Visual Showcase Box (Photo + Specs Overlays) */}
                      <div className="relative aspect-[16/10] bg-surface-secondary overflow-hidden border-b border-border">
                        {displayCar?.feature_image ? (
                          <img
                            src={displayCar.feature_image}
                            alt={displayCar.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-muted">
                            <Car size={32} className="opacity-40" />
                            <span className="text-xs">No image available</span>
                          </div>
                        )}

                        {/* Top Badge Overlay */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                            {displayCar?.car_type || activeCategory.category_key}
                          </span>
                          {displayCar?.year && (
                            <span className="text-[10px] font-semibold bg-white/95 backdrop-blur-sm text-text-primary px-1.5 py-0.5 rounded">
                              {displayCar.year}
                            </span>
                          )}
                        </div>

                        {/* Auto indicator pill overlay */}
                        {!isPinned && displayCar && (
                          <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
                            <span className="text-[10px] font-medium bg-amber-500/95 text-white px-2 py-0.5 rounded">
                              Live Auto-Preview
                            </span>
                          </div>
                        )}

                        {/* Branch overlay if available */}
                        {displayCar?.branch_name && (
                          <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                            <span className="text-[10px] font-medium bg-black/60 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded flex items-center gap-1">
                              <MapPin size={10} /> {displayCar.branch_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Vehicle Presentation Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className="text-sm font-bold text-text-primary leading-tight line-clamp-1"
                              title={displayCar?.name || "No vehicle assigned"}
                            >
                              {displayCar?.name || "No vehicle available in category"}
                            </h4>
                            {displayCar?.slug && (
                              <a
                                href={`/workspace/inventory/${displayCar.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-text-muted hover:text-action-primary shrink-0 transition-colors p-0.5"
                                title="Open in Inventory Workspace"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>

                          {/* Price and Specs Summary */}
                          <div className="mt-1.5 flex items-baseline justify-between gap-2">
                            <div className="text-sm font-bold text-action-primary">
                              {displayCar
                                ? displayCar.is_call_for_price
                                  ? "Call for Price"
                                  : displayCar.price
                                  ? `${displayCar.price} BDT`
                                  : "Price on Request"
                                : "—"}
                            </div>
                            {displayCar?.fuel_type && (
                              <span className="text-[11px] text-text-muted capitalize">
                                {displayCar.fuel_type.toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dropdown Selector Controller */}
                        <div className="pt-2.5 border-t border-border/70 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                              Change Car:
                            </label>
                            {selectedId > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSlotClear(slotIdx)}
                                className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none p-0"
                              >
                                <X size={12} /> Reset to Auto
                              </button>
                            )}
                          </div>

                          <select
                            value={selectedId || ""}
                            onChange={(e) => handleSlotSelect(slotIdx, e.target.value)}
                            className="w-full bg-surface text-text-primary border border-border rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary cursor-pointer transition-colors"
                          >
                            <option value="">✨ Auto (Display latest {activeCategory.label})</option>
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
                        </div>
                      </div>
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
