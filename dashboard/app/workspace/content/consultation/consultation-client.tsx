"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { updateConsultationSectionAction } from "@/app/actions/consultation_experience";
import type {
  ConsultationSectionItem,
  SalesRepresentativeItem,
  ConsultationTrustPill,
} from "@/lib/types";
import { Save, MessageSquare, ShieldCheck, UserCheck, Star, Sparkles } from "lucide-react";

interface ConsultationClientProps {
  initialData: ConsultationSectionItem;
  representatives?: SalesRepresentativeItem[];
  userPermissions?: string[];
}

export function ConsultationClient({
  initialData,
  representatives = [],
  userPermissions = [],
}: ConsultationClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_consultationsection");

  const [formData, setFormData] = useState({
    tag: initialData?.tag || "PRIVATE AUTOMOTIVE CONCIERGE",
    heading: initialData?.heading || "Connect to Consult",
    description:
      initialData?.description ||
      "Our dedicated automotive advisors offer bespoke consultations—whether you seek an exclusive allocation, custom reconditioned import, or confidential valuation for your vehicle trade-in.",
    primary_cta_label: initialData?.primary_cta_label || "Book Private Appointment",
    primary_cta_action: initialData?.primary_cta_action || "appointment_modal",
    primary_cta_url: initialData?.primary_cta_url || "",
    whatsapp_cta_label: initialData?.whatsapp_cta_label || "Chat on WhatsApp",
    representative: initialData?.representative ? String(initialData.representative) : "",
    whatsapp_number: initialData?.whatsapp_number || "",
    whatsapp_message:
      initialData?.whatsapp_message ||
      "Hello Dream Car House, I would like to consult regarding a luxury vehicle.",
    status_beacon_text:
      initialData?.status_beacon_text ||
      "Showroom Open Today • Kakrail & Gulshan, Dhaka",
    is_active: initialData?.is_active ?? true,
  });

  const [trustPills, setTrustPills] = useState<ConsultationTrustPill[]>(() => {
    if (Array.isArray(initialData?.trust_pills) && initialData.trust_pills.length >= 3) {
      return initialData.trust_pills.slice(0, 3);
    }
    return [
      { title: "1-on-1 Dedicated Specialist", icon: "specialist" },
      { title: "VIP Handover Lounge Access", icon: "vip" },
      { title: "Confidential Valuation & Quota", icon: "shield" },
    ];
  });

  const [saving, setSaving] = useState(false);

  const handlePillChange = (index: number, field: "title" | "icon", value: string) => {
    setTrustPills((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChange) {
      showToast({ type: "error", title: "Forbidden", message: "You lack permission to update consultation section." });
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("tag", formData.tag);
      fd.append("heading", formData.heading);
      fd.append("description", formData.description);
      fd.append("primary_cta_label", formData.primary_cta_label);
      fd.append("primary_cta_action", formData.primary_cta_action);
      fd.append("primary_cta_url", formData.primary_cta_url);
      fd.append("whatsapp_cta_label", formData.whatsapp_cta_label);
      if (formData.representative) {
        fd.append("representative", formData.representative);
      } else {
        fd.append("representative", "");
      }
      fd.append("whatsapp_number", formData.whatsapp_number);
      fd.append("whatsapp_message", formData.whatsapp_message);
      fd.append("status_beacon_text", formData.status_beacon_text);
      fd.append("is_active", formData.is_active ? "true" : "false");
      fd.append("trust_pills", JSON.stringify(trustPills));

      const res = await updateConsultationSectionAction(fd);
      if (res.ok) {
        showToast({
          type: "success",
          title: "Saved Successfully",
          message: "Consultation section content has been updated.",
        });
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Save Failed",
          message: res.error.message || "Failed to update consultation content.",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Unexpected Error",
        message: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  const actionOptions = [
    { value: "appointment_modal", label: "Open Appointment Modal (Recommended)" },
    { value: "internal_link", label: "Internal Route (/contact, /inventory...)" },
    { value: "external_link", label: "External Website URL" },
  ];

  const repOptions = [
    { value: "", label: "Default: Fallback to Site Hotline & Primary WhatsApp" },
    ...representatives.map((rep) => ({
      value: String(rep.id),
      label: `${rep.name} - ${rep.phone_number || "No Phone"}`,
    })),
  ];

  const iconOptions = [
    { value: "specialist", label: "Dedicated Specialist (User Icon)" },
    { value: "vip", label: "VIP Access (Star / Ribbon Icon)" },
    { value: "shield", label: "Confidentiality (Shield Icon)" },
    { value: "clock", label: "Opening / Fast Response (Clock Icon)" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-16">
      {/* 1. Header & Primary Messaging */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Private Automotive Concierge Copy
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Controls the prominent heading, category badge, and introductory advisory text on the homepage.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Visible on Homepage:</span>
            <Switch
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={!canChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Concierge Pill Tag" description="Top uppercase badge (e.g. PRIVATE AUTOMOTIVE CONCIERGE)">
            <Input
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              placeholder="PRIVATE AUTOMOTIVE CONCIERGE"
              disabled={!canChange}
            />
          </FormField>

          <FormField label="Section Heading" description="Main section heading (e.g. Connect to Consult)">
            <Input
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              placeholder="Connect to Consult"
              required
              disabled={!canChange}
            />
          </FormField>
        </div>

        <FormField label="Advisory Description" description="Descriptive paragraph explaining private consultation benefits">
          <Textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Our dedicated automotive advisors offer bespoke consultations..."
            required
            disabled={!canChange}
          />
        </FormField>
      </div>

      {/* 2. Three Trust Guarantee Pills */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Concierge Trust Pills (3 Badges)
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Displayed directly beneath the advisory description to assure clients of discretion and dedicated expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPills.map((pill, idx) => (
            <div key={idx} className="p-4 border border-border rounded-lg bg-surface-subtle space-y-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Trust Pill 0{idx + 1}
              </span>
              <FormField label="Title">
                <Input
                  value={pill.title}
                  onChange={(e) => handlePillChange(idx, "title", e.target.value)}
                  placeholder={`Pill 0${idx + 1} title`}
                  required
                  disabled={!canChange}
                />
              </FormField>
              <FormField label="Icon Style">
                <Select
                  options={iconOptions}
                  value={pill.icon}
                  onChange={(e) => handlePillChange(idx, "icon", e.target.value)}
                  disabled={!canChange}
                />
              </FormField>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Primary CTA & Appointment Trigger */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Primary Call-to-Action
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            The primary prominent button in the concierge box. By default, opens the high-touch appointment modal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Button Label">
            <Input
              value={formData.primary_cta_label}
              onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
              placeholder="Book Private Appointment"
              required
              disabled={!canChange}
            />
          </FormField>

          <FormField label="Action Type">
            <Select
              options={actionOptions}
              value={formData.primary_cta_action}
              onChange={(e) => setFormData({ ...formData, primary_cta_action: e.target.value })}
              disabled={!canChange}
            />
          </FormField>

          {formData.primary_cta_action !== "appointment_modal" && (
            <FormField label="Target URL / Destination">
              <Input
                value={formData.primary_cta_url}
                onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                placeholder="/contact or https://..."
                required
                disabled={!canChange}
              />
            </FormField>
          )}
        </div>
      </div>

      {/* 4. WhatsApp Direct Routing & Sales Representative */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-accent" />
            WhatsApp Routing & Concierge Availability
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Route inquiries directly to an active sales representative or showroom hotline. Safe fallback prevents broken links.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="WhatsApp Button Label">
            <Input
              value={formData.whatsapp_cta_label}
              onChange={(e) => setFormData({ ...formData, whatsapp_cta_label: e.target.value })}
              placeholder="Chat on WhatsApp"
              required
              disabled={!canChange}
            />
          </FormField>

          <FormField label="Assigned Sales Representative" description="If selected and published, clicks route to this specialist">
            <Select
              options={repOptions}
              value={formData.representative}
              onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
              disabled={!canChange}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Manual WhatsApp Number Override" description="Optional: specific number if representative is unset (e.g. 8801615121312)">
            <Input
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="e.g. 8801615121312"
              disabled={!canChange}
            />
          </FormField>

          <FormField label="Status Beacon Text" description="Green status beacon label (e.g. Showroom Open Today • Kakrail & Gulshan, Dhaka)">
            <Input
              value={formData.status_beacon_text}
              onChange={(e) => setFormData({ ...formData, status_beacon_text: e.target.value })}
              placeholder="Showroom Open Today • Kakrail & Gulshan, Dhaka"
              disabled={!canChange}
            />
          </FormField>
        </div>

        <FormField label="Default WhatsApp Message" description="Pre-filled message when the client opens WhatsApp">
          <Input
            value={formData.whatsapp_message}
            onChange={(e) => setFormData({ ...formData, whatsapp_message: e.target.value })}
            placeholder="Hello Dream Car House, I would like to consult regarding a luxury vehicle."
            disabled={!canChange}
          />
        </FormField>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={!canChange || saving}
          className="flex items-center gap-2 min-w-[140px]"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving Changes..." : "Save Consultation Content"}
        </Button>
      </div>
    </form>
  );
}
