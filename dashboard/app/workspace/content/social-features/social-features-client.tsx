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
import { useToast } from "@/components/ui/Toast";
import {
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Clapperboard,
  Globe,
  User,
  Star,
} from "lucide-react";
import {
  createPeopleTalkAction,
  updatePeopleTalkAction,
  deletePeopleTalkAction,
} from "@/app/actions/inventory";
import type { PeopleTalkItem } from "@/lib/types";

interface SocialFeaturesClientProps {
  initialItems: PeopleTalkItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  status: string;
  isFeatured: string;
  userPermissions?: string[];
}

export function SocialFeaturesClient({
  initialItems,
  totalRows,
  currentPage,
  pageSize,
  q,
  status,
  isFeatured,
  userPermissions = [],
}: SocialFeaturesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canAdd =
    userPermissions.includes("*") ||
    userPermissions.includes("home.add_peopletalkaboutus");
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_peopletalkaboutus");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("home.delete_peopletalkaboutus");

  // State
  const [activeItem, setActiveItem] = useState<PeopleTalkItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [itemStatus, setItemStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [featured, setFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setTitle("");
    setUrl("");
    setItemStatus("PUBLISHED");
    setFeatured(false);
    setImageFile(null);
    setFormErrors({});
  }

  function updateParams(newParams: { q?: string; status?: string; is_featured?: string; page?: number }) {
    const params = new URLSearchParams(window.location.search);
    if (newParams.q !== undefined) {
      if (newParams.q) params.set("q", newParams.q);
      else params.delete("q");
      params.delete("page");
    }
    if (newParams.status !== undefined) {
      if (newParams.status) params.set("status", newParams.status);
      else params.delete("status");
      params.delete("page");
    }
    if (newParams.is_featured !== undefined) {
      if (newParams.is_featured) params.set("is_featured", newParams.is_featured);
      else params.delete("is_featured");
      params.delete("page");
    }
    if (newParams.page !== undefined) {
      params.set("page", String(newParams.page));
    }
    router.push(`/workspace/content/social-features?${params.toString()}`);
  }

  function handleOpenCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function handleOpenEdit(item: PeopleTalkItem) {
    setActiveItem(item);
    setTitle(item.title);
    setUrl(item.url || "");
    setItemStatus(item.status);
    setFeatured(item.is_featured);
    setImageFile(null);
    setFormErrors({});
    setEditOpen(true);
  }

  function handleOpenDetail(item: PeopleTalkItem) {
    setActiveItem(item);
    setDetailOpen(true);
  }

  function handleOpenDelete(item: PeopleTalkItem) {
    setActiveItem(item);
    setDeleteDialogOpen(true);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      setFormErrors({ image: "Please select an image file." });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    const formData = new FormData();
    formData.append("title", title.trim());
    if (url.trim()) formData.append("url", url.trim());
    formData.append("status", itemStatus);
    formData.append("is_featured", featured ? "true" : "false");
    formData.append("image", imageFile);

    try {
      const res = await createPeopleTalkAction(formData);
      if (!res.ok) {
        showToast(res.error.message || "Failed to create social feature.", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
      } else {
        showToast(`Social feature '${res.data.title}' created.`, "success");
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
    formData.append("title", title.trim());
    formData.append("url", url.trim());
    formData.append("status", itemStatus);
    formData.append("is_featured", featured ? "true" : "false");
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await updatePeopleTalkAction(activeItem.id, formData);
      if (!res.ok) {
        showToast(res.error.message || "Failed to update social feature.", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
      } else {
        showToast(`Social feature updated successfully.`, "success");
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
      const res = await deletePeopleTalkAction(activeItem.id);
      if (!res.ok) {
        showToast(res.error.message || "Failed to delete item.", "error");
      } else {
        showToast("Social feature deleted successfully.", "success");
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

  const columns: ColumnDef<PeopleTalkItem>[] = [
    {
      id: "id",
      header: "ID",
      sortable: true,
      accessor: (item) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>
          #{item.id}
        </span>
      ),
    },
    {
      id: "title",
      header: "Title / Story",
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
            maxWidth: "260px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item.title}
        >
          {item.title}
        </button>
      ),
    },
    {
      id: "image",
      header: "Media Preview",
      accessor: (item) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "48px",
                height: "36px",
                objectFit: "cover",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            />
          ) : (
            <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>No image</span>
          )}
        </div>
      ),
    },
    {
      id: "featured",
      header: "Featured",
      accessor: (item) =>
        item.is_featured ? (
          <span
            className="badge"
            style={{
              background: "var(--accent-bg, rgba(234, 179, 8, 0.15))",
              color: "var(--accent, #eab308)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Star size={11} fill="currentColor" /> Featured
          </span>
        ) : (
          <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Standard</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (item) => (
        <span
          className="badge"
          style={{
            background:
              item.status === "PUBLISHED"
                ? "var(--success-bg, rgba(46, 125, 50, 0.15))"
                : "var(--surface)",
            color: item.status === "PUBLISHED" ? "var(--success, #2e7d32)" : "var(--text-muted)",
            border: `1px solid ${
              item.status === "PUBLISHED"
                ? "var(--success-border, rgba(46, 125, 50, 0.3))"
                : "var(--border)"
            }`,
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          {item.status}
        </span>
      ),
    },
    {
      id: "url",
      header: "External URL",
      accessor: (item) =>
        item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--primary)",
              textDecoration: "underline",
              fontSize: "var(--font-size-xs)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={item.url}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.url}</span>
            <ExternalLink size={11} style={{ flexShrink: 0 }} />
          </a>
        ) : (
          <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>—</span>
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
            aria-label={`View feature ${item.title}`}
          >
            <Eye size={12} /> View
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenEdit(item)}
              aria-label={`Edit feature ${item.title}`}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(item)}
              aria-label={`Delete feature ${item.title}`}
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
      {/* Content Tabs Header */}
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
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Link
            href="/workspace/content/sliders"
            className="button button--ghost"
            style={{ fontSize: "var(--font-size-sm)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            <Clapperboard size={16} /> Slider Videos
          </Link>
          <Link
            href="/workspace/content/social-media"
            className="button button--ghost"
            style={{ fontSize: "var(--font-size-sm)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            <Globe size={16} /> Social Links
          </Link>
          <Link
            href="/workspace/content/social-features"
            className="button button--primary"
            style={{ fontSize: "var(--font-size-sm)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            <Users size={16} /> Social Features
          </Link>
          <Link
            href="/workspace/content/sales-representatives"
            className="button button--ghost"
            style={{ fontSize: "var(--font-size-sm)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            <User size={16} /> Sales Reps
          </Link>
        </div>

        {canAdd && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}
          >
            <Plus size={16} /> New Social Feature
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchValue={q}
        onSearchChange={(newQ) => updateParams({ q: newQ })}
        searchPlaceholder="Search title or URL..."
        filters={[
          {
            key: "status",
            label: "Status",
            value: status,
            options: [
              { label: "Published", value: "PUBLISHED" },
              { label: "Draft", value: "DRAFT" },
            ],
          },
          {
            key: "is_featured",
            label: "Featured",
            value: isFeatured,
            options: [
              { label: "Featured Only", value: "true" },
              { label: "Standard Only", value: "false" },
            ],
          },
        ]}
        onFilterChange={(key, val) => updateParams({ [key]: val })}
      />

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={initialItems}
        identifyingColumnIndex={1}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => updateParams({ page })}
      />

      {/* Detail Slide-over Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={activeItem ? activeItem.title : "Feature Details"}
      >
        {activeItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Media Image</span>
                {activeItem.image ? (
                  <div style={{ marginTop: "4px" }}>
                    <img
                      src={activeItem.image}
                      alt={activeItem.title}
                      style={{
                        width: "100%",
                        maxHeight: "220px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                ) : (
                  <p className="muted" style={{ margin: "4px 0 0 0", fontSize: "var(--font-size-xs)" }}>No image uploaded.</p>
                )}
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Title</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600 }}>{activeItem.title}</p>
              </div>

              <div style={{ display: "flex", gap: "var(--space-4)" }}>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Publication Status</span>
                  <div style={{ marginTop: "2px" }}>
                    <span
                      className="badge"
                      style={{
                        background:
                          activeItem.status === "PUBLISHED"
                            ? "var(--success-bg, rgba(46, 125, 50, 0.15))"
                            : "var(--surface)",
                        color: activeItem.status === "PUBLISHED" ? "var(--success, #2e7d32)" : "var(--text-muted)",
                        border: `1px solid ${
                          activeItem.status === "PUBLISHED"
                            ? "var(--success-border, rgba(46, 125, 50, 0.3))"
                            : "var(--border)"
                        }`,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "var(--font-size-xs)",
                      }}
                    >
                      {activeItem.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Featured on Site</span>
                  <div style={{ marginTop: "2px" }}>
                    {activeItem.is_featured ? (
                      <span
                        className="badge"
                        style={{
                          background: "var(--accent-bg, rgba(234, 179, 8, 0.15))",
                          color: "var(--accent, #eab308)",
                          border: "1px solid rgba(234, 179, 8, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "var(--font-size-xs)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Star size={11} fill="currentColor" /> Featured
                      </span>
                    ) : (
                      <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>No</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Target URL</span>
                <p style={{ margin: "2px 0 0 0", wordBreak: "break-all" }}>
                  {activeItem.url ? (
                    <a
                      href={activeItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", textDecoration: "underline" }}
                    >
                      {activeItem.url} <ExternalLink size={12} style={{ display: "inline" }} />
                    </a>
                  ) : (
                    <span className="muted">Not configured</span>
                  )}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Created</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "var(--font-size-xs)", fontFamily: "var(--font-mono)" }}>
                    {new Date(activeItem.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Updated</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "var(--font-size-xs)", fontFamily: "var(--font-mono)" }}>
                    {new Date(activeItem.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
              {canChange && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setDetailOpen(false);
                    handleOpenEdit(activeItem);
                  }}
                >
                  <Edit size={12} /> Edit Feature
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Slide-over Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Social Feature"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <FormField label="Title / Caption" required error={formErrors.title}>
            <Input
              type="text"
              placeholder="e.g. Featured in Top Gear Bangladesh"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              maxLength={300}
            />
          </FormField>

          <FormField label="Image File (jpg, jpeg, png, webp)" required error={formErrors.image}>
            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              accept="image/jpeg,image/png,image/webp"
              className="input"
              required
              disabled={submitting}
            />
          </FormField>

          <FormField label="Target URL (Optional)" error={formErrors.url}>
            <Input
              type="url"
              placeholder="https://instagram.com/p/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={submitting}
              maxLength={300}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Status">
              <select
                value={itemStatus}
                onChange={(e) => setItemStatus(e.target.value as "PUBLISHED" | "DRAFT")}
                className="input"
                disabled={submitting}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </FormField>

            <FormField label="Featured">
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", height: "38px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  disabled={submitting}
                />
                <span style={{ fontSize: "var(--font-size-sm)" }}>Feature on site</span>
              </label>
            </FormField>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Feature"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Slide-over Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Social Feature #${activeItem?.id || ""}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <FormField label="Title / Caption" required error={formErrors.title}>
            <Input
              type="text"
              placeholder="e.g. Featured in Top Gear Bangladesh"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              maxLength={300}
            />
          </FormField>

          <FormField label="Replace Image (Optional)" error={formErrors.image}>
            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              accept="image/jpeg,image/png,image/webp"
              className="input"
              disabled={submitting}
            />
            <span className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "4px", display: "block" }}>
              Leave empty to keep existing uploaded image.
            </span>
          </FormField>

          <FormField label="Target URL (Optional)" error={formErrors.url}>
            <Input
              type="url"
              placeholder="https://instagram.com/p/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={submitting}
              maxLength={300}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Status">
              <select
                value={itemStatus}
                onChange={(e) => setItemStatus(e.target.value as "PUBLISHED" | "DRAFT")}
                className="input"
                disabled={submitting}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </FormField>

            <FormField label="Featured">
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", height: "38px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  disabled={submitting}
                />
                <span style={{ fontSize: "var(--font-size-sm)" }}>Feature on site</span>
              </label>
            </FormField>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Feature Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: "0 0 var(--space-2) 0", fontWeight: 500 }}>
                Are you sure you want to delete this social feature?
              </p>
              <p className="muted" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                Title: <strong>{activeItem?.title}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
