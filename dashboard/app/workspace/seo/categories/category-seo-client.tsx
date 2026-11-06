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
  createCategoryPageSEOAction,
  updateCategoryPageSEOAction,
  deleteCategoryPageSEOAction,
} from "@/app/actions/inventory";
import type { CategoryPageSEOItem } from "@/lib/types";

interface CategorySEOClientProps {
  initialItems: CategoryPageSEOItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  visibility: string;
  robots: string;
  userPermissions?: string[];
}

const PAGE_CHOICES = [
  { value: "cars", label: "All Cars (/cars)" },
  { value: "brand-new", label: "Brand New (/cars/brand-new)" },
  { value: "pre-owned", label: "Pre-Owned (/cars/pre-owned)" },
  { value: "brand", label: "Brand Index (/cars/brand)" },
];

const ROBOTS_CHOICES = [
  { value: "index, follow", label: "Index & follow" },
  { value: "index, nofollow", label: "Index & nofollow" },
  { value: "noindex, nofollow", label: "Noindex & nofollow" },
];

const VISIBILITY_CHOICES = [
  { value: "PUBLISHED", label: "Published" },
  { value: "HIDDEN", label: "Hidden" },
];

export function CategorySEOClient({
  initialItems,
  totalRows,
  currentPage,
  pageSize,
  q,
  visibility,
  robots,
  userPermissions = [],
}: CategorySEOClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canAdd =
    userPermissions.includes("*") ||
    userPermissions.includes("seo_config.add_categorypageseo");
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("seo_config.change_categorypageseo");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("seo_config.delete_categorypageseo");

  // State
  const [activeItem, setActiveItem] = useState<CategoryPageSEOItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [page, setPage] = useState("cars");
  const [categoryName, setCategoryName] = useState("");
  const [itemVisibility, setItemVisibility] = useState<"PUBLISHED" | "HIDDEN">("PUBLISHED");
  const [h1Title, setH1Title] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [itemRobots, setItemRobots] = useState("index, follow");
  const [featureImageFile, setFeatureImageFile] = useState<File | null>(null);
  const [featureImageAlt, setFeatureImageAlt] = useState("");
  const [schemaText, setSchemaText] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setPage("cars");
    setCategoryName("");
    setItemVisibility("PUBLISHED");
    setH1Title("");
    setShortDescription("");
    setLongDescription("");
    setTargetKeyword("");
    setMetaTitle("");
    setMetaDescription("");
    setCanonicalUrl("");
    setItemRobots("index, follow");
    setFeatureImageFile(null);
    setFeatureImageAlt("");
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
    router.push(`/workspace/seo/categories?${params.toString()}`);
  }

  function handleOpenCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function handleOpenEdit(item: CategoryPageSEOItem) {
    setActiveItem(item);
    setPage(item.page);
    setCategoryName(item.category_name || "");
    setItemVisibility(item.visibility);
    setH1Title(item.h1_title || "");
    setShortDescription(item.short_description || "");
    setLongDescription(item.long_description || "");
    setTargetKeyword(item.target_keyword || "");
    setMetaTitle(item.meta_title || "");
    setMetaDescription(item.meta_description || "");
    setCanonicalUrl(item.canonical_url || "");
    setItemRobots(item.robots || "index, follow");
    setFeatureImageFile(null);
    setFeatureImageAlt(item.feature_image_alt || "");
    setSchemaText(item.schema_json ? JSON.stringify(item.schema_json, null, 2) : "");
    setFormErrors({});
    setEditOpen(true);
  }

  function handleOpenDetail(item: CategoryPageSEOItem) {
    setActiveItem(item);
    setDetailOpen(true);
  }

  function handleOpenDelete(item: CategoryPageSEOItem) {
    setActiveItem(item);
    setDeleteDialogOpen(true);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    const formData = new FormData();
    formData.append("page", page);
    if (categoryName.trim()) formData.append("category_name", categoryName.trim());
    formData.append("visibility", itemVisibility);
    if (h1Title.trim()) formData.append("h1_title", h1Title.trim());
    if (shortDescription.trim()) formData.append("short_description", shortDescription.trim());
    if (longDescription.trim()) formData.append("long_description", longDescription.trim());
    if (targetKeyword.trim()) formData.append("target_keyword", targetKeyword.trim());
    if (metaTitle.trim()) formData.append("meta_title", metaTitle.trim());
    if (metaDescription.trim()) formData.append("meta_description", metaDescription.trim());
    if (canonicalUrl.trim()) formData.append("canonical_url", canonicalUrl.trim());
    if (itemRobots.trim()) formData.append("robots", itemRobots.trim());
    if (featureImageFile) formData.append("feature_image", featureImageFile);
    if (featureImageAlt.trim()) formData.append("feature_image_alt", featureImageAlt.trim());
    if (schemaText.trim()) formData.append("schema_json", schemaText.trim());

    try {
      const res = await createCategoryPageSEOAction(formData);
      if (!res.ok) {
        showToast(res.error.message || "Failed to create category SEO configuration.", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
      } else {
        showToast(`Category SEO for '${res.data.page_display}' created.`, "success");
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
    formData.append("category_name", categoryName.trim());
    formData.append("visibility", itemVisibility);
    formData.append("h1_title", h1Title.trim());
    formData.append("short_description", shortDescription.trim());
    formData.append("long_description", longDescription.trim());
    formData.append("target_keyword", targetKeyword.trim());
    formData.append("meta_title", metaTitle.trim());
    formData.append("meta_description", metaDescription.trim());
    formData.append("canonical_url", canonicalUrl.trim());
    formData.append("robots", itemRobots.trim());
    if (featureImageFile) formData.append("feature_image", featureImageFile);
    formData.append("feature_image_alt", featureImageAlt.trim());
    formData.append("schema_json", schemaText.trim());

    try {
      const res = await updateCategoryPageSEOAction(activeItem.id, formData);
      if (!res.ok) {
        showToast(res.error.message || "Failed to update category SEO configuration.", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
      } else {
        showToast("Category SEO configuration updated successfully.", "success");
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
      const res = await deleteCategoryPageSEOAction(activeItem.id);
      if (!res.ok) {
        showToast(res.error.message || "Failed to delete item.", "error");
      } else {
        showToast("Category SEO configuration deleted successfully.", "success");
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

  const columns: ColumnDef<CategoryPageSEOItem>[] = [
    {
      id: "page",
      header: "Category Page",
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
          {item.category_name || item.page_display}
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)", fontWeight: 400 }}>
            (/{item.page})
          </span>
        </button>
      ),
    },
    {
      id: "h1_title",
      header: "H1 Main Heading",
      accessor: (item) => (
        <span
          title={item.h1_title || ""}
          style={{
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {item.h1_title || <span style={{ color: "var(--muted)" }}>—</span>}
        </span>
      ),
    },
    {
      id: "meta_title",
      header: "Meta Title",
      accessor: (item) => (
        <span
          title={item.meta_title || ""}
          style={{
            maxWidth: "200px",
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
          {item.robots}
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
            aria-label={`View category SEO for ${item.page_display}`}
          >
            <Eye size={12} /> Detail
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenEdit(item)}
              aria-label={`Edit category SEO for ${item.page_display}`}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(item)}
              aria-label={`Delete category SEO for ${item.page_display}`}
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
            className="button button--ghost"
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
            className="button button--primary"
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
            <Plus size={14} /> New Category SEO
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
          <strong>Listing Pages SEO:</strong> Configures editorial copy (H1, top grid intro, footer long description) and indexing metadata for vehicle catalog and brand index pages. Internal dashboard routes stay permanently protected by <code style={{ fontFamily: "var(--font-mono)" }}>X-Robots-Tag: noindex, nofollow, noarchive</code>.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchValue={q}
        onSearchChange={(newQ) => updateParams({ q: newQ })}
        searchPlaceholder="Search category by heading, title, or keyword..."
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
              { label: "Index & follow", value: "index, follow" },
              { label: "Index & nofollow", value: "index, nofollow" },
              { label: "Noindex & nofollow", value: "noindex, nofollow" },
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
        title="Create Category Page SEO Configuration"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Category Page *" error={formErrors.page} description="One configuration per unique page">
              <Select
                options={PAGE_CHOICES}
                value={page}
                onChange={(e) => setPage(e.target.value)}
              />
            </FormField>

            <FormField label="Category Display Name" error={formErrors.category_name} description="e.g. Brand New Cars">
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Display title"
                maxLength={120}
              />
            </FormField>
          </div>

          <FormField label="Visibility Status *" error={formErrors.visibility} description="Hidden pages return 404 & drop from sitemap">
            <Select
              options={VISIBILITY_CHOICES}
              value={itemVisibility}
              onChange={(e) => setItemVisibility(e.target.value as "PUBLISHED" | "HIDDEN")}
            />
          </FormField>

          {/* On-Page Editorial Copy */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)" }}>On-Page Editorial Copy</h4>
            <FormField label="H1 Title" error={formErrors.h1_title} description="Main heading shown on page (separate from Meta Title)">
              <Input
                value={h1Title}
                onChange={(e) => setH1Title(e.target.value)}
                placeholder="e.g. Explore Verified Vehicles in Bangladesh"
                maxLength={200}
              />
            </FormField>

            <FormField label="Short Description (HTML)" error={formErrors.short_description} description="Shown near top, above vehicle grid">
              <Textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="<p>Short introduction paragraph...</p>"
                rows={3}
              />
            </FormField>

            <FormField label="Long Description (HTML)" error={formErrors.long_description} description="Shown near bottom before footer (collapsed behind toggle when long)">
              <Textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="<p>Detailed SEO content and dealership information...</p>"
                rows={4}
              />
            </FormField>
          </div>

          {/* Search Engine Meta */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)" }}>Search Engine Meta</h4>
            <FormField label="Target Primary Keyword" error={formErrors.target_keyword}>
              <Input
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g. brand new cars bd"
                maxLength={120}
              />
            </FormField>

            <FormField label="Meta Title" error={formErrors.meta_title} description="Max 70 chars">
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. Brand New Cars | Dream Car House Fleet"
                maxLength={70}
              />
            </FormField>

            <FormField label="Meta Description" error={formErrors.meta_description} description="Max 500 chars">
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <FormField label="Canonical URL" error={formErrors.canonical_url}>
                <Input
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://dreamcarhouse.com/inventory/"
                />
              </FormField>

              <FormField label="Indexing Status (Robots)" error={formErrors.robots}>
                <Select
                  options={ROBOTS_CHOICES}
                  value={itemRobots}
                  onChange={(e) => setItemRobots(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Social Feature Image */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)" }}>Social Feature Image (1200×630 px)</h4>
            <FormField label="Feature Image" error={formErrors.feature_image}>
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
          </div>

          {/* Structured Data */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-1) 0", fontSize: "var(--font-size-sm)" }}>Structured Data (JSON-LD)</h4>
            <FormField label="Schema.org JSON Block" error={formErrors.schema_json}>
              <Textarea
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                rows={5}
                style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}
                placeholder='{ "@context": "https://schema.org", "@type": "CollectionPage" }'
              />
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Category SEO"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Category SEO — ${activeItem?.category_name || activeItem?.page_display || page}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Category Page (Immutable Identity)">
              <Input value={activeItem?.page_display || page} readOnly disabled style={{ opacity: 0.7 }} />
            </FormField>

            <FormField label="Category Display Name" error={formErrors.category_name}>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                maxLength={120}
              />
            </FormField>
          </div>

          <FormField label="Visibility Status *" error={formErrors.visibility}>
            <Select
              options={VISIBILITY_CHOICES}
              value={itemVisibility}
              onChange={(e) => setItemVisibility(e.target.value as "PUBLISHED" | "HIDDEN")}
            />
          </FormField>

          {/* On-Page Editorial Copy */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)" }}>On-Page Editorial Copy</h4>
            <FormField label="H1 Title" error={formErrors.h1_title}>
              <Input
                value={h1Title}
                onChange={(e) => setH1Title(e.target.value)}
                maxLength={200}
              />
            </FormField>

            <FormField label="Short Description (HTML)" error={formErrors.short_description}>
              <Textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="Long Description (HTML)" error={formErrors.long_description}>
              <Textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                rows={4}
              />
            </FormField>
          </div>

          {/* Search Engine Meta */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)" }}>Search Engine Meta</h4>
            <FormField label="Target Primary Keyword" error={formErrors.target_keyword}>
              <Input
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                maxLength={120}
              />
            </FormField>

            <FormField label="Meta Title" error={formErrors.meta_title} description="Max 70 chars">
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={70}
              />
            </FormField>

            <FormField label="Meta Description" error={formErrors.meta_description} description="Max 500 chars">
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <FormField label="Canonical URL" error={formErrors.canonical_url}>
                <Input
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                />
              </FormField>

              <FormField label="Indexing Status (Robots)" error={formErrors.robots}>
                <Select
                  options={ROBOTS_CHOICES}
                  value={itemRobots}
                  onChange={(e) => setItemRobots(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Social Feature Image */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)" }}>Social Feature Image</h4>
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
          </div>

          {/* Structured Data */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <h4 style={{ margin: "0 0 var(--space-1) 0", fontSize: "var(--font-size-sm)" }}>Structured Data (JSON-LD)</h4>
            <FormField label="Schema.org JSON Block" error={formErrors.schema_json}>
              <Textarea
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                rows={5}
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
        title={`Category SEO: ${activeItem?.category_name || activeItem?.page_display || ""}`}
      >
        {activeItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ padding: "var(--space-3)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>{activeItem.category_name || activeItem.page_display}</h3>
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
                Listing Page: <code style={{ fontFamily: "var(--font-mono)" }}>/{activeItem.page}</code> | Last Updated (Read-Only): {new Date(activeItem.updated_at).toLocaleString()}
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)", color: "var(--muted)" }}>Editorial Content</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
                <div><strong>H1 Heading:</strong> {activeItem.h1_title || <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Short Intro:</strong> {activeItem.short_description ? <div dangerouslySetInnerHTML={{ __html: activeItem.short_description }} style={{ background: "var(--surface)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} /> : <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Long Footer Description:</strong> {activeItem.long_description ? <div dangerouslySetInnerHTML={{ __html: activeItem.long_description }} style={{ background: "var(--surface)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} /> : <span style={{ color: "var(--muted)" }}>None</span>}</div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)", color: "var(--muted)" }}>Search Meta Tags</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
                <div><strong>Meta Title:</strong> {activeItem.meta_title || <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Meta Description:</strong> {activeItem.meta_description || <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Primary Keyword:</strong> {activeItem.target_keyword || <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Canonical URL:</strong> {activeItem.canonical_url ? <a href={activeItem.canonical_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>{activeItem.canonical_url} <ExternalLink size={10} style={{ display: "inline" }} /></a> : <span style={{ color: "var(--muted)" }}>None</span>}</div>
                <div><strong>Robots Directive:</strong> <code style={{ fontFamily: "var(--font-mono)" }}>{activeItem.robots}</code></div>
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
        title="Confirm Category SEO Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
            Are you sure you want to delete the category SEO configuration for <strong>{activeItem?.category_name || activeItem?.page_display}</strong>?
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
            Warning: The public endpoint <code style={{ fontFamily: "var(--font-mono)" }}>/api/v1/site-config/category-seo/{activeItem?.page}/</code> will return 404 and listing pages will fall back to hardcoded defaults.
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
