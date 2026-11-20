"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import {
  updateExperienceSectionAction,
  updateExperiencePillarAction,
} from "@/app/actions/consultation_experience";
import type { ExperienceSectionItem, ExperiencePillarItem } from "@/lib/types";
import { Save, Layers, Upload, Image as ImageIcon, MapPin } from "lucide-react";

interface ExperienceClientProps {
  initialData: ExperienceSectionItem;
  userPermissions?: string[];
}

export function ExperienceClient({
  initialData,
  userPermissions = [],
}: ExperienceClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_experiencesection") ||
    userPermissions.includes("home.change_experiencepillar");

  const [sectionData, setSectionData] = useState({
    title: initialData?.title || "Inside Our Showrooms",
    subtitle: initialData?.subtitle || "",
    video_cta_label: initialData?.video_cta_label || "Schedule a Visit",
    video_target: initialData?.video_target || "visit",
    is_active: initialData?.is_active ?? true,
  });

  // Exactly 2 showroom cards: Kakrail & Gulshan
  const rawPillars = initialData?.pillars || [];
  const defaultShowroomFallbacks = [
    {
      id: rawPillars[0]?.id || 1,
      pillar_number: "01",
      badge: "MAIN FLAGSHIP",
      title: rawPillars[0]?.title || "Kakrail Flagship Showroom",
      description: rawPillars[0]?.description || "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka",
      tags: [],
      image: rawPillars[0]?.image || "/assets/dch-night-showroom.webp",
      image_url: rawPillars[0]?.image_url || rawPillars[0]?.image || "/assets/dch-night-showroom.webp",
      is_active: rawPillars[0]?.is_active ?? true,
    },
    {
      id: rawPillars[1]?.id || 2,
      pillar_number: "02",
      badge: "GULSHAN AVENUE",
      title: rawPillars[1]?.title || "Gulshan Avenue Showroom",
      description: rawPillars[1]?.description || "House #07, Road #127, Gulshan Avenue, Dhaka",
      tags: [],
      image: rawPillars[1]?.image || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85",
      image_url: rawPillars[1]?.image_url || rawPillars[1]?.image || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85",
      is_active: rawPillars[1]?.is_active ?? true,
    },
  ];

  const pillars = rawPillars.length >= 2 ? rawPillars.slice(0, 2) : defaultShowroomFallbacks;
  const [activePillarIndex, setActivePillarIndex] = useState<number>(0);

  // Forms state for 2 showrooms
  const [pillarForms, setPillarForms] = useState<
    Record<
      number,
      {
        id: number;
        pillar_number: string;
        badge: string;
        title: string;
        description: string;
        tags: string[];
        image: string;
        image_url: string;
        imageFile: File | null;
        imagePreview: string | null;
        is_active: boolean;
      }
    >
  >(() => {
    const map: Record<number, any> = {};
    pillars.forEach((p, idx) => {
      map[idx] = {
        id: p.id,
        pillar_number: p.pillar_number || String(idx + 1).padStart(2, "0"),
        badge: p.badge || (idx === 0 ? "MAIN FLAGSHIP" : "GULSHAN AVENUE"),
        title: p.title || (idx === 0 ? "Kakrail Flagship Showroom" : "Gulshan Avenue Showroom"),
        description: p.description || (idx === 0 ? "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka" : "House #07, Road #127, Gulshan Avenue, Dhaka"),
        tags: Array.isArray(p.tags) && p.tags.length > 0 ? [...p.tags] : [],
        image: p.image || "",
        image_url: p.image_url || p.image || "",
        imageFile: null,
        imagePreview: null,
        is_active: p.is_active ?? true,
      };
    });
    return map;
  });

  const [savingSection, setSavingSection] = useState(false);
  const [savingPillar, setSavingPillar] = useState(false);

  const currentPillar = pillarForms[activePillarIndex] || {
    id: 0,
    pillar_number: "01",
    badge: "MAIN FLAGSHIP",
    title: "Kakrail Flagship Showroom",
    description: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka",
    tags: [],
    image: "",
    image_url: "",
    imageFile: null,
    imagePreview: null,
    is_active: true,
  };

  const handlePillarFieldChange = (field: string, value: any) => {
    setPillarForms((prev) => {
      const current = prev[activePillarIndex];
      if (!current) return prev;
      return {
        ...prev,
        [activePillarIndex]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPillarForms((prev) => {
      const current = prev[activePillarIndex];
      if (!current) return prev;
      return {
        ...prev,
        [activePillarIndex]: {
          ...current,
          imageFile: file,
          imagePreview: previewUrl,
        },
      };
    });
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChange) {
      showToast({ type: "error", title: "Forbidden", message: "You lack permission to modify experience section." });
      return;
    }

    setSavingSection(true);
    try {
      const fd = new FormData();
      fd.append("title", sectionData.title);
      // Subtitle is removed from UI as requested
      fd.append("subtitle", "");
      fd.append("video_cta_label", sectionData.video_cta_label);
      fd.append("video_target", sectionData.video_target);
      fd.append("is_active", sectionData.is_active ? "true" : "false");

      const res = await updateExperienceSectionAction(fd);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Section Updated",
          message: "Showroom section header saved successfully.",
        });
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: res.error.message || "Failed to update showroom header.",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Unexpected Error",
        message: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setSavingSection(false);
    }
  };

  const handleSavePillar = async () => {
    if (!canChange) {
      showToast({ type: "error", title: "Forbidden", message: "You lack permission to modify showroom cards." });
      return;
    }

    const form = pillarForms[activePillarIndex];
    if (!form || !form.id) {
      showToast({ type: "error", title: "Error", message: "Showroom card ID not found." });
      return;
    }

    setSavingPillar(true);
    try {
      const fd = new FormData();
      fd.append("pillar_number", form.pillar_number || String(activePillarIndex + 1).padStart(2, "0"));
      fd.append("title", form.title);
      // Preserve default values for backend model schema while keeping them hidden from UI
      fd.append("badge", form.badge || (activePillarIndex === 0 ? "MAIN FLAGSHIP" : "GULSHAN AVENUE"));
      fd.append("description", form.description || (activePillarIndex === 0 ? "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka" : "House #07, Road #127, Gulshan Avenue, Dhaka"));
      fd.append("tags", JSON.stringify(form.tags || []));
      fd.append("is_active", form.is_active ? "true" : "false");

      if (form.imageFile) {
        fd.append("image", form.imageFile);
      }

      const res = await updateExperiencePillarAction(form.id, fd);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Showroom Saved",
          message: `Showroom card (${form.title}) updated successfully.`,
        });
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: res.error.message || "Failed to update showroom card.",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Unexpected Error",
        message: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setSavingPillar(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Showrooms Header Configuration */}
      <form onSubmit={handleSaveSection} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent" />
              Showrooms Section Header
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Controls the section heading and the visit scheduling button.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Visible on Homepage:</span>
            <Switch
              checked={sectionData.is_active}
              onChange={(e) => setSectionData({ ...sectionData, is_active: e.target.checked })}
              disabled={!canChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Section Title">
            <Input
              value={sectionData.title}
              onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
              placeholder="Inside Our Showrooms"
              required
              disabled={!canChange}
            />
          </FormField>

          <FormField label="Visit CTA Button Label">
            <Input
              value={sectionData.video_cta_label}
              onChange={(e) => setSectionData({ ...sectionData, video_cta_label: e.target.value })}
              placeholder="Schedule a Visit"
              required
              disabled={!canChange}
            />
          </FormField>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!canChange || savingSection}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {savingSection ? "Saving Header..." : "Save Section Header"}
          </Button>
        </div>
      </form>

      {/* 2. Showroom Showcase Cards (2 Showrooms) */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Showroom Showcase Cards (Kakrail & Gulshan)
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Manage high-resolution photography and showroom naming for the 2 showroom cards. Card text is hidden on the homepage for a pure photographic luxury aesthetic.
          </p>
        </div>

        {/* 2 Showroom Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {pillars.map((pillar, idx) => {
            const num = pillar.pillar_number || `0${idx + 1}`;
            const isActive = activePillarIndex === idx;
            const label = idx === 0 ? "Kakrail Flagship Showroom" : "Gulshan Avenue Showroom";
            return (
              <button
                key={pillar.id || idx}
                type="button"
                onClick={() => setActivePillarIndex(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-surface-subtle text-text-secondary hover:text-text-primary"
                }`}
              >
                Showroom {num}: {pillarForms[idx]?.title || label}
              </button>
            );
          })}
        </div>

        {/* Selected Showroom Editor */}
        <div className="space-y-6 pt-2">
          <FormField label="Showroom Title / Name" description="Used for identification, image accessibility alt text, and visit scheduling modal context.">
            <Input
              value={currentPillar.title}
              onChange={(e) => handlePillarFieldChange("title", e.target.value)}
              placeholder={activePillarIndex === 0 ? "Kakrail Flagship Showroom" : "Gulshan Avenue Showroom"}
              required
              disabled={!canChange}
            />
          </FormField>

          {/* Showroom Media Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-primary block">
              Showroom Photographic Image
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 border border-border rounded-xl bg-surface-subtle">
              <div className="w-56 h-36 rounded-lg overflow-hidden border border-border bg-surface flex-shrink-0 relative">
                {currentPillar.imagePreview || currentPillar.image_url ? (
                  <img
                    src={currentPillar.imagePreview || currentPillar.image_url}
                    alt={currentPillar.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-xs">No media</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 flex-1">
                <p className="text-xs text-text-secondary">
                  Recommended size: 1200×800px (16:10 aspect ratio). Supports high-resolution JPG, PNG, WEBP up to 10MB.
                </p>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-surface text-sm font-medium hover:bg-surface-hover cursor-pointer transition">
                    <Upload className="w-4 h-4 text-text-muted" />
                    <span>Upload New Showroom Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                      disabled={!canChange}
                    />
                  </label>
                  {currentPillar.imagePreview && (
                    <span className="text-xs text-accent">New file staged for save</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Showroom Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="button"
              onClick={handleSavePillar}
              disabled={!canChange || savingPillar}
              className="flex items-center gap-2 min-w-[150px]"
            >
              <Save className="w-4 h-4" />
              {savingPillar ? "Saving Showroom..." : `Save Showroom (${currentPillar.title})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
