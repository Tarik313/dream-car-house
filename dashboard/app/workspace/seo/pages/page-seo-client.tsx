"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Drawer } from "@/components/ui/Drawer";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import {
  Search,
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  createSEOConfigAction,
  updateSEOConfigAction,
  deleteSEOConfigAction,
} from "@/app/actions/inventory";
import type { SEOConfigItem } from "@/lib/types";

interface PageSEOClientProps {
  initialItems: SEOConfigItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  visibility: string;
  robots: string;
  userPermissions?: string[];
}

const PAGE_CHOICES = [
  { value: "home", label: "Home (/)" },
  { value: "gallery", label: "Gallery (/gallery)" },
  { value: "about", label: "About Us (/about)" },
  { value: "sell", label: "Sell Your Car (/sell)" },
  { value: "byd-cars", label: "BYD (/byd-cars)" },
  { value: "contact", label: "Contact Us (/contact)" },
];

const ROBOTS_CHOICES = [
  { value: "index, follow", label: "index, follow" },
  { value: "noindex, follow", label: "noindex, follow" },
  { value: "index, nofollow", label: "index, nofollow" },
  { value: "noindex, nofollow", label: "noindex, nofollow" },
];

const VISIBILITY_CHOICES = [
  { value: "PUBLISHED", label: "Published" },
  { value: "HIDDEN", label: "Hidden" },
];

const OG_TYPE_CHOICES = [
  { value: "website", label: "website" },
  { value: "article", label: "article" },
];

const TWITTER_CARD_CHOICES = [
  { value: "summary_large_image", label: "summary_large_image" },
  { value: "summary", label: "summary" },
];

export function PageSEOClient({
  initialItems,
  totalRows,
  currentPage,
  pageSize,
  q,
  visibility,
  robots,
  userPermissions = [],
}: PageSEOClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canAdd =
    userPermissions.includes("*") ||
    userPermissions.includes("seo_config.add_seoconfig");
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("seo_config.change_seoconfig");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("seo_config.delete_seoconfig");

  // State
  const [activeItem, setActiveItem] = useState<SEOConfigItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [page, setPage] = useState("home");
  const [itemVisibility, setItemVisibility] = useState<"PUBLISHED" | "HIDDEN">("PUBLISHED");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [itemRobots, setItemRobots] = useState("index, follow");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [featureImageFile, setFeatureImageFile] = useState<File | null>(null);
  const [featureImageAlt, setFeatureImageAlt] = useState("");

  // Social & overrides
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogType, setOgType] = useState("website");
  const [ogSiteName, setOgSiteName] = useState("Dream Car House");
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);

  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [twitterTitle, setTwitterTitle] = useState("");
  const [twitterDescription, setTwitterDescription] = useState("");
  const [twitterImageFile, setTwitterImageFile] = useState<File | null>(null);

  const [schemaText, setSchemaText] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setPage("home");
    setItemVisibility("PUBLISHED");
    setTargetKeyword("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setItemRobots("index, follow");
    setCanonicalUrl("");
    setFeatureImageFile(null);
    setFeatureImageAlt("");
    setOgTitle("");
    setOgDescription("");
    setOgType("website");
    setOgSiteName("Dream Car House");
    setOgImageFile(null);
    setTwitterCard("summary_large_image");
    setTwitterTitle("");
    setTwitterDescription("");
    setTwitterImageFile(null);
    setSchemaText("");
    setFormErrors({});
  }

  function updateParams(newParams: { q?: string; visibility?: string; robots?: string; page?: number }) {
    const params = new URLSearchParams(window.location.search);
    if (newParams.q !== undefined) {
      if (newParams.q) params.set("q", newParams.q);
      else params.delete("q");
      params.delete("page");
    }
    if (newParams.visibility !== undefined) {
      if (newParams.visibility) params.set("visibility", newParams.visibility);
      else params.delete("visibility");
      params.delete("page");
    }
    if (newParams.robots !== undefined) {
      if (newParams.robots) params.set("robots", newParams.robots);
      else params.delete("robots");
      params.delete("page");
    }
    if (newParams.page !== undefined) {
      params.set("page", String(newParams.page));
    }
    router.push(`/workspace/seo/pages?${params.toString()}`);
  }

  function handleOpenCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function handleOpenEdit(item: SEOConfigItem) {
    setActiveItem(item);
    setPage(item.page);
    setItemVisibility(item.visibility);
    setTargetKeyword(item.target_keyword || "");
    setMetaTitle(item.meta_title || "");
    setMetaDescription(item.meta_description || "");
    setMetaKeywords(item.meta_keywords || "");
    setItemRobots(item.robots || "index, follow");
    setCanonicalUrl(item.canonical_url || "");
    setFeatureImageFile(null);
    setFeatureImageAlt(item.feature_image_alt || "");

    setOgTitle(item.og_title || "");
    setOgDescription(item.og_description || "");
    setOgType(item.og_type || "website");
    setOgSiteName(item.og_site_name || "Dream Car House");
    setOgImageFile(null);

    setTwitterCard(item.twitter_card || "summary_large_image");
    setTwitterTitle(item.twitter_title || "");
    setTwitterDescription(item.twitter_description || "");
    setTwitterImageFile(null);

    setSchemaText(item.schema_json ? JSON.stringify(item.schema_json, null, 2) : "");
    setFormErrors({});
    setEditOpen(true);
  }

  function handleOpenDetail(item: SEOConfigItem) {
    setActiveItem(item);
    setDetailOpen(true);
  }

  function handleOpenDelete(item: SEOConfigItem) {
    setActiveItem(item);
    setDeleteDialogOpen(true);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    const formData = new FormData();
    formData.append("page", page);
    formData.append("visibility", itemVisibility);
    if (targetKeyword.trim()) formData.append("target_keyword", targetKeyword.trim());
    if (metaTitle.trim()) formData.append("meta_title", metaTitle.trim());
    if (metaDescription.trim()) formData.append("meta_description", metaDescription.trim());
    if (metaKeywords.trim()) formData.append("meta_keywords", metaKeywords.trim());
    if (itemRobots.trim()) formData.append("robots", itemRobots.trim());
    if (canonicalUrl.trim()) formData.append("canonical_url", canonicalUrl.trim());
    if (featureImageFile) formData.append("feature_image", featureImageFile);
    if (featureImageAlt.trim()) formData.append("feature_image_alt", featureImageAlt.trim());

    if (ogTitle.trim()) formData.append("og_title", ogTitle.trim());
    if (ogDescription.trim()) formData.append("og_description", ogDescription.trim());
    if (ogType.trim()) formData.append("og_type", ogType.trim());
    if (ogSiteName.trim()) formData.append("og_site_name", ogSiteName.trim());
    if (ogImageFile) formData.append("og_image", ogImageFile);

    if (twitterCard.trim()) formData.append("twitter_card", twitterCard.trim());
    if (twitterTitle.trim()) formData.append("twitter_title", twitterTitle.trim());
    if (twitterDescription.trim()) formData.append("twitter_description", twitterDescription.trim());
    if (twitterImageFile) formData.append("twitter_image", twitterImageFile);

    if (schemaText.trim()) {
      try {
        JSON.parse(schemaText.trim());
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Invalid JSON syntax";
        setFormErrors({ schema_json: `Invalid JSON format: ${msg}` });
        setSubmitting(false);
        return;
      }
      formData.append("schema_json", schemaText.trim());
    }

    try {
      const res = await createSEOConfigAction(formData);
      if (!res.ok) {
        showToast(res.error.message || "Failed to create SEO configuration.", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
      } else {
        showToast(`SEO config for '${res.data.page_display}' created.`, "success");
        setCreateOpen(false);
        resetForm();
        router.refresh();
      }
    } catch {
      showToast("An unexpected error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeItem) return;

    setSubmitting(true);
    setFormErrors({});

    const formData = new FormData();
    formData.append("page", page);
    formData.append("visibility", itemVisibility);
    formData.append("target_keyword", targetKeyword.trim());
    formData.append("meta_title", metaTitle.trim());
    formData.append("meta_description", metaDescription.trim());
    formData.append("meta_keywords", metaKeywords.trim());
    formData.append("robots", itemRobots.trim());
    formData.append("canonical_url", canonicalUrl.trim());
    if (featureImageFile) formData.append("feature_image", featureImageFile);
    formData.append("feature_image_alt", featureImageAlt.trim());

    formData.append("og_title", ogTitle.trim());
    formData.append("og_description", ogDescription.trim());
    formData.append("og_type", ogType.trim());
    formData.append("og_site_name", ogSiteName.trim());
    if (ogImageFile) formData.append("og_image", ogImageFile);

    formData.append("twitter_card", twitterCard.trim());
    formData.append("twitter_title", twitterTitle.trim());
    formData.append("twitter_description", twitterDescription.trim());
    if (twitterImageFile) formData.append("twitter_image", twitterImageFile);

    if (schemaText.trim()) {
      try {
        JSON.parse(schemaText.trim());
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Invalid JSON syntax";
        setFormErrors({ schema_json: `Invalid JSON format: ${msg}` });
        setSubmitting(false);
        return;
      }
      formData.append("schema_json", schemaText.trim());
    } else {
      formData.append("schema_json", "");
    }

    try {
      const res = await updateSEOConfigAction(activeItem.id, formData);
      if (!res.ok) {
        showToast(res.error.message || "Failed to update SEO configuration.", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
      } else {
        showToast(`SEO configuration updated successfully.`, "success");
        setEditOpen(false);
        setActiveItem(res.data);
        router.refresh();
      }
    } catch {
      showToast("An unexpected error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!activeItem) return;

    setSubmitting(true);
    try {
      const res = await deleteSEOConfigAction(activeItem.id);
      if (!res.ok) {
        showToast(res.error.message || "Failed to delete item.", "error");
      } else {
        showToast("SEO configuration deleted successfully.", "success");
        setDeleteDialogOpen(false);
        setActiveItem(null);
        router.refresh();
      }
    } catch {
      showToast("An unexpected error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const columns: ColumnDef<SEOConfigItem>[] = [
    {
      id: "page",
      header: "Page",
      isIdentifying: true,
      sortable: true,
      accessor: (item) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(item)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            fontWeight: 600,
            color: "var(--text)",
            cursor: "pointer",
            textAlign: "left",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
          }}
        >
          {item.page_display}
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)", fontWeight: 400 }}>
            (/{item.page})
          </span>
        </button>
      ),
    },
    {
      id: "meta_title",
      header: "Meta Title",
      accessor: (item) => (
        <span
          title={item.meta_title || ""}
          style={{
            maxWidth: "240px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {item.meta_title || <span style={{ color: "var(--muted)" }}>—</span>}
        </span>
      ),
    },
    {
      id: "robots",
      header: "Robots Policy",
      accessor: (item) => (
        <span
          className="badge"
          style={{
            background: item.robots?.includes("noindex") ? "var(--warning-bg, #fff3e0)" : "var(--surface)",
            color: item.robots?.includes("noindex") ? "var(--warning, #e65100)" : "var(--text)",
            border: "1px solid var(--border)",
            fontSize: "var(--font-size-xs)",
            padding: "2px 6px",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {item.robots || "index, follow"}
        </span>
      ),
    },
    {
      id: "visibility",
      header: "Visibility",
      accessor: (item) => (
        <span
          className="badge"
          style={{
            background: item.visibility === "PUBLISHED" ? "var(--success-bg, rgba(46, 125, 50, 0.15))" : "var(--danger-bg, rgba(211, 47, 47, 0.15))",
            color: item.visibility === "PUBLISHED" ? "var(--success, #2e7d32)" : "var(--danger, #d32f2f)",
            border: `1px solid ${item.visibility === "PUBLISHED" ? "var(--success-border, rgba(46, 125, 50, 0.3))" : "var(--danger-border, rgba(211, 47, 47, 0.3))"}`,
            fontSize: "var(--font-size-xs)",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 500,
          }}
        >
          {item.visibility}
        </span>
      ),
    },
    {
      id: "updated_at",
      header: "Last Updated (Read-Only)",
      accessor: (item) => (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>
          {new Date(item.updated_at).toLocaleString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (item) => (
        <div style={{ display: "flex", gap: "var(--space-1)", justifyContent: "flex-end" }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDetail(item)}
            aria-label={`View SEO config for ${item.page_display}`}
          >
            <Eye size={12} /> Detail
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenEdit(item)}
              aria-label={`Edit SEO config for ${item.page_display}`}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(item)}
              aria-label={`Delete SEO config for ${item.page_display}`}
            >
              <Trash2 size={12} /> Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Navigation Tab Bar for SEO Modules */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "var(--space-2)",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link
            href="/workspace/seo/pages"
            className="button button--primary"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Search size={16} /> General Pages SEO
          </Link>
          <Link
            href="/workspace/seo/categories"
            className="button button--ghost"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <FileText size={16} /> Category Pages SEO
          </Link>
          <Link
            href="/workspace/brands"
            className="button button--ghost"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
            title="Manage individual brand landing page SEO, H1 headings, and dossiers"
          >
            🏷️ Brand Pages SEO
          </Link>
        </div>

        {canAdd && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}
          >
            <Plus size={14} /> New Page SEO
          </Button>
        )}
      </div>

      {/* Indexing Policy Advisory Banner */}
      <div
        style={{
          padding: "var(--space-3)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        <AlertTriangle size={18} style={{ color: "var(--accent)" }} />
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text)" }}>
          <strong>Indexing & Privacy Notice:</strong> Settings configured here control the public website (<code style={{ fontFamily: "var(--font-mono)" }}>dreamcarhouse.com</code>). All internal dashboard routes remain permanently protected by <code style={{ fontFamily: "var(--font-mono)" }}>X-Robots-Tag: noindex, nofollow, noarchive</code> and are completely excluded from indexing.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchValue={q}
        onSearchChange={(newQ) => updateParams({ q: newQ })}
        searchPlaceholder="Search by page, title, or keyword..."
        filters={[
          {
            key: "visibility",
            label: "Visibility",
            value: visibility,
            options: [
              { label: "All Visibilities", value: "" },
              { label: "Published", value: "PUBLISHED" },
              { label: "Hidden", value: "HIDDEN" },
            ],
          },
          {
            key: "robots",
            label: "Robots",
            value: robots,
            options: [
              { label: "All Robots Policies", value: "" },
              { label: "index, follow", value: "index, follow" },
              { label: "noindex, follow", value: "noindex, follow" },
              { label: "index, nofollow", value: "index, nofollow" },
              { label: "noindex, nofollow", value: "noindex, nofollow" },
            ],
          },
        ]}
        onFilterChange={(key, val) => updateParams({ [key]: val })}
      />

      {/* Responsive Data Table */}
      <div style={{ overflowX: "auto" }}>
        <DataTable
          columns={columns}
          data={initialItems}
          identifyingColumnIndex={0}
          totalRows={totalRows}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(newPage: number) => updateParams({ page: newPage })}
        />
      </div>

      {/* Create Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create General Page SEO Configuration"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Target Page *" error={formErrors.page} description="One configuration per unique page">
              <Select
                options={PAGE_CHOICES}
                value={page}
                onChange={(e) => setPage(e.target.value)}
              />
            </FormField>

            <FormField label="Visibility Status *" error={formErrors.visibility} description="Hidden pages return 404 & drop from sitemap">
              <Select
                options={VISIBILITY_CHOICES}
                value={itemVisibility}
                onChange={(e) => setItemVisibility(e.target.value as "PUBLISHED" | "HIDDEN")}
              />
            </FormField>
          </div>

          <FormField label="Target Primary Keyword" error={formErrors.target_keyword} description="Primary keyword this page is optimised for">
            <Input
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="e.g. luxury cars bangladesh"
              maxLength={120}
            />
          </FormField>

          <FormField label="Meta Title" error={formErrors.meta_title} description="Browser tab & search results snippet (max 70 chars)">
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="e.g. Luxury & Exotic Cars in Bangladesh | Dream Car House"
              maxLength={70}
            />
          </FormField>

          <FormField label="Meta Description" error={formErrors.meta_description} description="Search results description (max 500 chars)">
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief description for search engines..."
              rows={3}
              maxLength={500}
            />
          </FormField>

          <FormField label="Meta Keywords" error={formErrors.meta_keywords} description="Comma-separated keywords (optional)">
            <Input
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="e.g. exotic cars, dhaka dealership, luxury suvs"
              maxLength={500}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Robots Policy" error={formErrors.robots}>
              <Select
                options={ROBOTS_CHOICES}
                value={itemRobots}
                onChange={(e) => setItemRobots(e.target.value)}
              />
            </FormField>

            <FormField label="Canonical URL" error={formErrors.canonical_url} description="Must start with http:// or https://">
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://dreamcarhouse.com/"
              />
            </FormField>
          </div>

          {/* Social Feature Image */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)" }}>Social Sharing Images (1200×630 px)</h4>
            <FormField label="Feature Image (OG/Twitter default)" error={formErrors.feature_image}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFeatureImageFile(e.target.files?.[0] || null)}
                style={{ fontSize: "var(--font-size-xs)" }}
              />
            </FormField>
            <FormField label="Feature Image Alt Text" error={formErrors.feature_image_alt}>
              <Input
                value={featureImageAlt}
                onChange={(e) => setFeatureImageAlt(e.target.value)}
                placeholder="Descriptive alt text for screen readers"
                maxLength={200}
              />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <FormField label="Open Graph Type" error={formErrors.og_type}>
                <Select
                  options={OG_TYPE_CHOICES}
                  value={ogType}
                  onChange={(e) => setOgType(e.target.value)}
                />
              </FormField>
              <FormField label="Twitter Card Type" error={formErrors.twitter_card}>
                <Select
                  options={TWITTER_CARD_CHOICES}
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* JSON-LD Schema */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-1) 0", fontSize: "var(--font-size-sm)" }}>Structured Data (JSON-LD)</h4>
            <FormField label="Schema.org JSON Block (Optional)" error={formErrors.schema_json} description="Optional custom schema.org structured data. Leave empty if not needed.">
              <Textarea
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                rows={6}
                style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}
                placeholder='{ "@context": "https://schema.org", "@type": "AutoDealer", "name": "Dream Car House" }'
              />
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save SEO Configuration"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit SEO Configuration — ${activeItem?.page_display || page}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Target Page (Immutable Identity)" description="Page slug cannot be reassigned">
              <Input value={activeItem?.page_display || page} readOnly disabled style={{ opacity: 0.7 }} />
            </FormField>

            <FormField label="Visibility Status *" error={formErrors.visibility}>
              <Select
                options={VISIBILITY_CHOICES}
                value={itemVisibility}
                onChange={(e) => setItemVisibility(e.target.value as "PUBLISHED" | "HIDDEN")}
              />
            </FormField>
          </div>

          <FormField label="Target Primary Keyword" error={formErrors.target_keyword}>
            <Input
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="e.g. luxury cars bangladesh"
              maxLength={120}
            />
          </FormField>

          <FormField label="Meta Title" error={formErrors.meta_title} description="Browser tab & search results snippet (max 70 chars)">
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="e.g. Luxury & Exotic Cars in Bangladesh | Dream Car House"
              maxLength={70}
            />
          </FormField>

          <FormField label="Meta Description" error={formErrors.meta_description} description="Search results description (max 500 chars)">
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </FormField>

          <FormField label="Meta Keywords" error={formErrors.meta_keywords}>
            <Input
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="Comma-separated keywords"
              maxLength={500}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Robots Policy" error={formErrors.robots}>
              <Select
                options={ROBOTS_CHOICES}
                value={itemRobots}
                onChange={(e) => setItemRobots(e.target.value)}
              />
            </FormField>

            <FormField label="Canonical URL" error={formErrors.canonical_url}>
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://dreamcarhouse.com/"
              />
            </FormField>
          </div>

          {/* Social Feature Image */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)" }}>Social Sharing Images</h4>
            {activeItem?.feature_image && !featureImageFile && (
              <div style={{ marginBottom: "var(--space-2)" }}>
                <img
                  src={activeItem.feature_image}
                  alt={activeItem.feature_image_alt || "Feature image"}
                  style={{ maxHeight: "80px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
                />
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>Current image retained if no new file is chosen.</div>
              </div>
            )}
            <FormField label="Replace Feature Image" error={formErrors.feature_image}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFeatureImageFile(e.target.files?.[0] || null)}
                style={{ fontSize: "var(--font-size-xs)" }}
              />
            </FormField>
            <FormField label="Feature Image Alt Text" error={formErrors.feature_image_alt}>
              <Input
                value={featureImageAlt}
                onChange={(e) => setFeatureImageAlt(e.target.value)}
                maxLength={200}
              />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <FormField label="Open Graph Type" error={formErrors.og_type}>
                <Select
                  options={OG_TYPE_CHOICES}
                  value={ogType}
                  onChange={(e) => setOgType(e.target.value)}
                />
              </FormField>
              <FormField label="Twitter Card Type" error={formErrors.twitter_card}>
                <Select
                  options={TWITTER_CARD_CHOICES}
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Structured Data */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-1) 0", fontSize: "var(--font-size-sm)" }}>Structured Data (JSON-LD)</h4>
            <FormField label="Schema.org JSON Block (Optional)" error={formErrors.schema_json} description="Optional custom schema.org structured data. Leave empty if not needed.">
              <Textarea
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                rows={6}
                style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}
              />
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`SEO Configuration: ${activeItem?.page_display || ""}`}
      >
        {activeItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ padding: "var(--space-3)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>{activeItem.page_display}</h3>
                <span
                  className="badge"
                  style={{
                    background: activeItem.visibility === "PUBLISHED" ? "var(--success-bg, rgba(46, 125, 50, 0.15))" : "var(--danger-bg, rgba(211, 47, 47, 0.15))",
                    color: activeItem.visibility === "PUBLISHED" ? "var(--success, #2e7d32)" : "var(--danger, #d32f2f)",
                    border: `1px solid ${activeItem.visibility === "PUBLISHED" ? "var(--success-border, rgba(46, 125, 50, 0.3))" : "var(--danger-border, rgba(211, 47, 47, 0.3))"}`,
                    fontSize: "var(--font-size-xs)",
                    padding: "2px 8px",
                  }}
                >
                  {activeItem.visibility}
                </span>
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>
                Slug: <code style={{ fontFamily: "var(--font-mono)" }}>/{activeItem.page}</code> | Last Updated (Read-Only): {new Date(activeItem.updated_at).toLocaleString()}
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)", color: "var(--muted)" }}>HTML Meta Tags</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
                <div><strong>Meta Title:</strong> {activeItem.meta_title || <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Meta Description:</strong> {activeItem.meta_description || <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Primary Keyword:</strong> {activeItem.target_keyword || <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Meta Keywords:</strong> {activeItem.meta_keywords || <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Canonical URL:</strong> {activeItem.canonical_url ? <a href={activeItem.canonical_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>{activeItem.canonical_url} <ExternalLink size={10} style={{ display: "inline" }} /></a> : <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Robots Directive:</strong> <code style={{ fontFamily: "var(--font-mono)" }}>{activeItem.robots || "index, follow"}</code></div>
              </div>
            </div>

            {activeItem.feature_image && (
              <div>
                <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)", color: "var(--muted)" }}>Feature Image</h4>
                <img
                  src={activeItem.feature_image}
                  alt={activeItem.feature_image_alt || "Feature image"}
                  style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
                />
                {activeItem.feature_image_alt && (
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)", marginTop: "4px" }}>
                    Alt: {activeItem.feature_image_alt}
                  </div>
                )}
              </div>
            )}

            {activeItem.schema_json && (
              <div>
                <h4 style={{ margin: "0 0 var(--space-1) 0", fontSize: "var(--font-size-sm)", color: "var(--muted)" }}>JSON-LD Schema</h4>
                <pre style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-xs)", overflowX: "auto" }}>
                  {JSON.stringify(activeItem.schema_json, null, 2)}
                </pre>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
              {canChange && (
                <Button variant="secondary" onClick={() => { setDetailOpen(false); handleOpenEdit(activeItem); }}>
                  <Edit size={14} /> Edit Configuration
                </Button>
              )}
              <Button variant="ghost" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm SEO Configuration Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
            Are you sure you want to delete the SEO configuration for <strong>{activeItem?.page_display}</strong>?
          </p>
          <div
            style={{
              padding: "var(--space-2) var(--space-3)",
              background: "var(--danger-bg, rgba(211, 47, 47, 0.1))",
              border: "1px solid var(--danger-border, rgba(211, 47, 47, 0.3))",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
              color: "var(--danger, #d32f2f)",
            }}
          >
            Warning: The public endpoint <code style={{ fontFamily: "var(--font-mono)" }}>/api/v1/site-config/seo/{activeItem?.page}/</code> will return 404 and the page will fall back to hardcoded metadata defaults.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={submitting} onClick={handleDeleteConfirm}>
              {submitting ? "Deleting..." : "Confirm Deletion"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
