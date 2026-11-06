"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import {
  updateExperienceSectionAction,
  updateExperiencePillarAction,
} from "@/app/actions/consultation_experience";
import type { ExperienceSectionItem, ExperiencePillarItem } from "@/lib/types";
import { Save, Layers, Upload, Image as ImageIcon, Video, ShieldCheck } from "lucide-react";

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
    title: initialData?.title || "Experience Beyond Ordinary",
    subtitle:
      initialData?.subtitle ||
      "Dhaka's benchmark in high-luxury automotive delivery, certified diagnostic inspection, and bespoke global procurement.",
    video_cta_label: initialData?.video_cta_label || "Watch Showroom Reel",
    video_target: initialData?.video_target || "reel",
    is_active: initialData?.is_active ?? true,
  });

  const pillars = initialData?.pillars || [];
  const [activePillarIndex, setActivePillarIndex] = useState<number>(0);

  // Forms state for pillars
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
        badge: p.badge || "",
        title: p.title || "",
        description: p.description || "",
        tags: Array.isArray(p.tags) && p.tags.length > 0 ? [...p.tags] : ["", ""],
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
    badge: "",
    title: "",
    description: "",
    tags: ["", ""],
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

  const handleTagChange = (tagIdx: number, val: string) => {
    setPillarForms((prev) => {
      const current = prev[activePillarIndex];
      if (!current) return prev;
      const nextTags = [...current.tags];
      nextTags[tagIdx] = val;
      return {
        ...prev,
        [activePillarIndex]: {
          ...current,
          tags: nextTags,
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
      fd.append("subtitle", sectionData.subtitle);
      fd.append("video_cta_label", sectionData.video_cta_label);
      fd.append("video_target", sectionData.video_target);
      fd.append("is_active", sectionData.is_active ? "true" : "false");

      const res = await updateExperienceSectionAction(fd);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Section Updated",
          message: "Experience section header content saved successfully.",
        });
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: res.error.message || "Failed to update experience header.",
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
      showToast({ type: "error", title: "Forbidden", message: "You lack permission to modify experience pillars." });
      return;
    }

    const form = pillarForms[activePillarIndex];
    if (!form || !form.id) {
      showToast({ type: "error", title: "Error", message: "Pillar ID not found." });
      return;
    }

    setSavingPillar(true);
    try {
      const fd = new FormData();
      fd.append("pillar_number", form.pillar_number);
      fd.append("badge", form.badge);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("tags", JSON.stringify(form.tags.filter((t) => t.trim().length > 0)));
      fd.append("is_active", form.is_active ? "true" : "false");

      if (form.imageFile) {
        fd.append("image", form.imageFile);
      }

      const res = await updateExperiencePillarAction(form.id, fd);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Pillar Saved",
          message: `Pillar ${form.pillar_number} (${form.title}) updated successfully.`,
        });
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: res.error.message || "Failed to update pillar.",
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
      {/* 1. Experience Header Configuration */}
      <form onSubmit={handleSaveSection} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent" />
              Experience Section Header & Video Trigger
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Controls the title, intro subtitle, and interactive video reel CTA atop the 3 atelier pillars.
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
              placeholder="Experience Beyond Ordinary"
              required
              disabled={!canChange}
            />
          </FormField>

          <FormField label="Video CTA Button Label">
            <Input
              value={sectionData.video_cta_label}
              onChange={(e) => setSectionData({ ...sectionData, video_cta_label: e.target.value })}
              placeholder="Watch Showroom Reel"
              required
              disabled={!canChange}
            />
          </FormField>
        </div>

        <FormField label="Section Subtitle" description="Introductory copy under the title">
          <Textarea
            rows={2}
            value={sectionData.subtitle}
            onChange={(e) => setSectionData({ ...sectionData, subtitle: e.target.value })}
            placeholder="Dhaka's benchmark in high-luxury automotive delivery..."
            disabled={!canChange}
          />
        </FormField>

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

      {/* 2. Three Architectural Delivery Pillars */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Architectural Atelier Pillars (3 Key Experience Tenets)
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Dhaka's hallmark automotive sanctuary tenets: Private VIP Vault, Certified 150-Point Audit, and Global Bespoke Concierge.
          </p>
        </div>

        {/* Pillar Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {pillars.map((pillar, idx) => {
            const num = pillar.pillar_number || `0${idx + 1}`;
            const isActive = activePillarIndex === idx;
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
                Pillar {num}: {pillar.title || `Pillar ${num}`}
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Editor Form */}
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Pillar Index (2-digit)" description="e.g. 01, 02, 03">
              <Input
                value={currentPillar.pillar_number}
                onChange={(e) => handlePillarFieldChange("pillar_number", e.target.value)}
                placeholder="01"
                required
                disabled={!canChange}
              />
            </FormField>

            <FormField label="Pillar Category Badge" description="e.g. PRIVATE SANCTUARY, PRECISION AUDIT">
              <Input
                value={currentPillar.badge}
                onChange={(e) => handlePillarFieldChange("badge", e.target.value)}
                placeholder="PRIVATE SANCTUARY"
                required
                disabled={!canChange}
              />
            </FormField>

            <FormField label="Pillar Title" description="e.g. The VIP Delivery Vault">
              <Input
                value={currentPillar.title}
                onChange={(e) => handlePillarFieldChange("title", e.target.value)}
                placeholder="The VIP Delivery Vault"
                required
                disabled={!canChange}
              />
            </FormField>
          </div>

          <FormField label="Pillar Description" description="Elaborates on the experience standard">
            <Textarea
              rows={3}
              value={currentPillar.description}
              onChange={(e) => handlePillarFieldChange("description", e.target.value)}
              placeholder="An exclusive private handover suite..."
              required
              disabled={!canChange}
            />
          </FormField>

          {/* Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Feature Tag 1">
              <Input
                value={currentPillar.tags[0] || ""}
                onChange={(e) => handleTagChange(0, e.target.value)}
                placeholder="e.g. Soundproof Suite"
                disabled={!canChange}
              />
            </FormField>

            <FormField label="Feature Tag 2">
              <Input
                value={currentPillar.tags[1] || ""}
                onChange={(e) => handleTagChange(1, e.target.value)}
                placeholder="e.g. Ceremonial Reveal"
                disabled={!canChange}
              />
            </FormField>
          </div>

          {/* Media Image */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-primary block">
              Pillar Card Background Media Image
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 border border-border rounded-xl bg-surface-subtle">
              <div className="w-48 h-32 rounded-lg overflow-hidden border border-border bg-surface flex-shrink-0 relative">
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
                  Recommended size: 1000×667px (or 600×400px aspect ratio). Supports JPG, PNG, WEBP up to 10MB.
                </p>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-surface text-sm font-medium hover:bg-surface-hover cursor-pointer transition">
                    <Upload className="w-4 h-4 text-text-muted" />
                    <span>Upload New Image</span>
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

          {/* Save Pillar Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="button"
              onClick={handleSavePillar}
              disabled={!canChange || savingPillar}
              className="flex items-center gap-2 min-w-[150px]"
            >
              <Save className="w-4 h-4" />
              {savingPillar ? "Saving Pillar..." : `Save Pillar ${currentPillar.pillar_number}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
