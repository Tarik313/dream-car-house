"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Upload } from "@/components/ui/Upload";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { updateBrandAction } from "@/app/actions/inventory";
import type { BrandItem } from "@/lib/types";

export function BrandEditClient({ brand }: { brand: BrandItem }) {
  const router = useRouter();
  const { showToast } = useToast();

  const brandSlug = (brand.slug || brand.name || "").toLowerCase().replace(/[\s_]+/g, "-");
  const liveUrl = `https://dreamcarhouse.com/cars/brand/${brandSlug}/`;

  const [activeTab, setActiveTab] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [schemaText, setSchemaText] = useState(
    brand.schema_json ? JSON.stringify(brand.schema_json, null, 2) : ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    const runwayInput = form.elements.namedItem("is_in_runway") as HTMLInputElement | null;
    formData.set("is_in_runway", runwayInput?.checked ? "true" : "false");

    // If schemaText exists, validate client-side before sending
    if (schemaText.trim()) {
      try {
        JSON.parse(schemaText);
        formData.set("schema_json", schemaText);
      } catch {
        setSubmitting(false);
        setFieldErrors({ schema_json: "Invalid JSON-LD format. Please correct JSON syntax." });
        showToast("Invalid JSON syntax in Structured Data.", "error");
        return;
      }
    } else {
      formData.set("schema_json", "");
    }

    const res = await updateBrandAction(brand.id, formData);
    setSubmitting(false);

    if (res.ok) {
      showToast("Brand saved successfully.", "success");
      router.refresh();
    } else {
      if (res.error.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.error.fieldErrors)) {
          flat[k] = Array.isArray(v) ? (v[0] ?? "") : String(v);
        }
        setFieldErrors(flat);
      }
      showToast(res.error.message || "Failed to update brand.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Link href="/workspace/brands" className="button button--secondary" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            <ArrowLeft size={16} /> Back to Brands
          </Link>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button--secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
            title="View Brand Listing on Dream Car House Website"
          >
            <ExternalLink size={16} /> View Live Page
          </a>
        </div>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "general", label: "General & Media" },
          { id: "content", label: "On-Page Content" },
          { id: "seo", label: "SEO & Structured Data" },
        ]}
      />

      {/* General Tab */}
      {activeTab === "general" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="Brand Name" required error={fieldErrors.name}>
            <Input name="name" defaultValue={brand.name} required />
          </FormField>

          <FormField label="Segment" required error={fieldErrors.segment}>
            <Select
              name="segment"
              options={[
                { label: "Luxury & Performance", value: "LUXURY_PERFORMANCE" },
                { label: "Refined & Versatile", value: "REFINED_VERSATILE" },
                { label: "Electric", value: "ELECTRIC" },
              ]}
              defaultValue={brand.segment}
            />
          </FormField>

          <FormField label="Status" error={fieldErrors.status}>
            <Select
              name="status"
              options={[
                { label: "Published", value: "PUBLISHED" },
                { label: "Unpublished", value: "UNPUBLISHED" },
                { label: "Archived", value: "ARCHIVED" },
                { label: "Unlisted", value: "UNLISTED" },
              ]}
              defaultValue={brand.status}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Display Order" error={fieldErrors.order} description="Sequential ordering in listings and runway">
              <Input type="number" name="order" defaultValue={brand.order ?? 0} />
            </FormField>

            <FormField label="Runway Strip Visibility" error={fieldErrors.is_in_runway} description="Toggle display in homepage Brand Runway">
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: "var(--space-2)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="is_in_runway"
                  defaultChecked={brand.is_in_runway !== false}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}>
                  Show on Homepage Brand Runway
                </span>
              </label>
            </FormField>
          </div>

          <FormField label="Destination URL (CTA Link)" error={fieldErrors.destination_url} description="Custom URL or relative path (e.g. /inventory?brand=BMW). Leave blank for default.">
            <Input name="destination_url" defaultValue={brand.destination_url || ""} placeholder="e.g. /inventory?brand=BMW" />
          </FormField>

          <FormField label="Brand Logo" error={fieldErrors.image} description="SVG, PNG, WEBP, or JPG (max 10MB). Leave blank to keep existing logo.">
            {brand.image && (
              <div style={{ marginBottom: "var(--space-2)", padding: "var(--space-2)", background: "#0f172a", borderRadius: "var(--radius-sm)", display: "inline-block" }}>
                <img src={brand.image} alt={brand.logo_alt || brand.name} style={{ maxHeight: "60px", objectFit: "contain" }} />
              </div>
            )}
            <Upload name="image" accept="image/*,.svg" />
          </FormField>

          <FormField label="Logo Alt Text" error={fieldErrors.logo_alt} description="Accessible description for screen readers and search engines">
            <Input name="logo_alt" defaultValue={brand.logo_alt || ""} placeholder="e.g. BMW luxury marque" />
          </FormField>

          <FormField label="Listing Footer Text" error={fieldErrors.listing_footer_text} description="Shown below pagination on brand car listing (/cars/brand/<slug>)">
            <Textarea name="listing_footer_text" defaultValue={brand.listing_footer_text || ""} rows={3} />
          </FormField>
        </div>
      )}

      {/* On-Page Content Tab */}
      {activeTab === "content" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="H1 Title" error={fieldErrors.h1_title} description="Heading shown at the top of the brand listing page">
            <Input name="h1_title" defaultValue={brand.h1_title || ""} placeholder="e.g. Mercedes-Benz Cars in Bangladesh" />
          </FormField>

          <FormField label="Short Description (HTML)" error={fieldErrors.short_description} description="Shown near top above car grid">
            <Textarea name="short_description" defaultValue={brand.short_description || ""} rows={4} />
          </FormField>

          <FormField label="Long Description (HTML)" error={fieldErrors.long_description} description="Shown near bottom before footer with 'See more'">
            <Textarea name="long_description" defaultValue={brand.long_description || ""} rows={6} />
          </FormField>
        </div>
      )}

      {/* SEO & Structured Data Tab */}
      {activeTab === "seo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="Target Primary Keyword" error={fieldErrors.target_keyword}>
            <Input name="target_keyword" defaultValue={brand.target_keyword || ""} placeholder="e.g. toyota cars bd" />
          </FormField>

          <FormField label="Meta Title" error={fieldErrors.meta_title} description="Max 70 characters">
            <Input name="meta_title" defaultValue={brand.meta_title || ""} placeholder="Tab title" maxLength={70} />
          </FormField>

          <FormField label="Meta Description" error={fieldErrors.meta_description} description="Max 500 characters">
            <Textarea name="meta_description" defaultValue={brand.meta_description || ""} rows={3} maxLength={500} />
          </FormField>

          <FormField label="Canonical URL" error={fieldErrors.canonical_url}>
            <Input name="canonical_url" defaultValue={brand.canonical_url || ""} placeholder="https://dreamcarhouse.com/cars/brand/toyota/" />
          </FormField>

          <FormField label="Search Engine Robots" error={fieldErrors.robots}>
            <Select
              name="robots"
              options={[
                { label: "Index & follow", value: "index, follow" },
                { label: "Index & nofollow", value: "index, nofollow" },
                { label: "Noindex & nofollow", value: "noindex, nofollow" },
              ]}
              defaultValue={brand.robots}
            />
          </FormField>

          <FormField label="Social Feature Image" error={fieldErrors.feature_image} description="Recommended: 1200x630 px. Leave blank to keep existing.">
            {brand.feature_image && (
              <div style={{ marginBottom: "var(--space-2)" }}>
                <img src={brand.feature_image} alt={brand.name} style={{ maxHeight: "100px", objectFit: "cover" }} />
              </div>
            )}
            <Upload name="feature_image" accept="image/*" />
          </FormField>

          <FormField label="Feature Image ALT Text" error={fieldErrors.feature_image_alt}>
            <Input name="feature_image_alt" defaultValue={brand.feature_image_alt || ""} />
          </FormField>

          <FormField label="JSON-LD Structured Data" error={fieldErrors.schema_json} description="Valid Schema.org JSON object">
            <Textarea
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              rows={8}
              style={{ fontFamily: "monospace", fontSize: "var(--font-size-xs)" }}
              placeholder='{ "@context": "https://schema.org", "@type": "Brand", "name": "Brand Name" }'
            />
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
