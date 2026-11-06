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
  Globe,
  Radio,
  Plus,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Clapperboard,
  Users,
  User,
} from "lucide-react";
import {
  createSocialMediaAction,
  updateSocialMediaAction,
  deleteSocialMediaAction,
} from "@/app/actions/inventory";
import type { SocialMediaItem } from "@/lib/types";

interface SocialMediaClientProps {
  initialItems: SocialMediaItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  userPermissions?: string[];
}

export function SocialMediaClient({
  initialItems,
  totalRows,
  currentPage,
  pageSize,
  q,
  userPermissions = [],
}: SocialMediaClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canAdd =
    userPermissions.includes("*") ||
    userPermissions.includes("home.add_socialmedia");
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_socialmedia");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("home.delete_socialmedia");

  // State
  const [activeItem, setActiveItem] = useState<SocialMediaItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
    });
    setFormErrors({});
  };

  function updateParams(newParams: { q?: string; page?: number }) {
    const params = new URLSearchParams(window.location.search);
    if (newParams.q !== undefined) {
      if (newParams.q) params.set("q", newParams.q);
      else params.delete("q");
      params.delete("page");
    }
    if (newParams.page !== undefined) {
      params.set("page", String(newParams.page));
    }
    router.push(`/workspace/content/social-media?${params.toString()}`);
  }

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (item: SocialMediaItem) => {
    setActiveItem(item);
    setFormData({
      facebook: item.facebook || "",
      instagram: item.instagram || "",
      twitter: item.twitter || "",
      youtube: item.youtube || "",
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleOpenDetail = (item: SocialMediaItem) => {
    setActiveItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (item: SocialMediaItem) => {
    setActiveItem(item);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      const res = await createSocialMediaAction({
        facebook: formData.facebook.trim(),
        instagram: formData.instagram.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        youtube: formData.youtube.trim() || undefined,
      });

      if (!res.ok) {
        showToast(res.error.message || "Failed to create social links", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
        return;
      }

      showToast("Social media configuration created successfully", "success");
      setIsCreateOpen(false);
      resetForm();
      router.refresh();
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    setSubmitting(true);
    setFormErrors({});

    try {
      const res = await updateSocialMediaAction(activeItem.id, {
        facebook: formData.facebook.trim(),
        instagram: formData.instagram.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        youtube: formData.youtube.trim() || undefined,
      });

      if (!res.ok) {
        showToast(res.error.message || "Failed to update configuration", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
        return;
      }

      showToast("Social media configuration updated successfully", "success");
      setIsEditOpen(false);
      router.refresh();
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activeItem) return;

    setSubmitting(true);
    try {
      const res = await deleteSocialMediaAction(activeItem.id);
      if (!res.ok) {
        showToast(res.error.message || "Failed to delete configuration", "error");
        return;
      }

      showToast("Configuration deleted successfully", "success");
      setIsDeleteOpen(false);
      setActiveItem(null);
      router.refresh();
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<SocialMediaItem>[] = [
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
      id: "status",
      header: "Public Selection",
      accessor: (item) =>
        item.is_public_active ? (
          <span
            className="badge"
            style={{
              background: "var(--success-bg, rgba(46, 125, 50, 0.15))",
              color: "var(--success, #2e7d32)",
              border: "1px solid var(--success-border, rgba(46, 125, 50, 0.3))",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Radio size={12} className="animate-pulse" /> Active on Website
          </span>
        ) : (
          <span
            className="badge"
            style={{
              background: "var(--surface)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            Historical Record
          </span>
        ),
    },
    {
      id: "facebook",
      header: "Facebook",
      isIdentifying: true,
      accessor: (item) => (
        <a
          href={item.facebook}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--primary)",
            textDecoration: "underline",
            fontSize: "var(--font-size-xs)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            maxWidth: "240px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item.facebook}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.facebook}</span>
          <ExternalLink size={11} style={{ flexShrink: 0 }} />
        </a>
      ),
    },
    {
      id: "instagram",
      header: "Instagram",
      accessor: (item) =>
        item.instagram ? (
          <a
            href={item.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--primary)",
              textDecoration: "underline",
              fontSize: "var(--font-size-xs)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={item.instagram}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.instagram}</span>
            <ExternalLink size={11} style={{ flexShrink: 0 }} />
          </a>
        ) : (
          <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>—</span>
        ),
    },
    {
      id: "twitter",
      header: "Twitter / X",
      accessor: (item) =>
        item.twitter ? (
          <a
            href={item.twitter}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--primary)",
              textDecoration: "underline",
              fontSize: "var(--font-size-xs)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={item.twitter}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.twitter}</span>
            <ExternalLink size={11} style={{ flexShrink: 0 }} />
          </a>
        ) : (
          <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>—</span>
        ),
    },
    {
      id: "youtube",
      header: "YouTube",
      accessor: (item) =>
        item.youtube ? (
          <a
            href={item.youtube}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--primary)",
              textDecoration: "underline",
              fontSize: "var(--font-size-xs)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={item.youtube}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.youtube}</span>
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
            aria-label={`View social config ${item.id}`}
          >
            <Eye size={12} /> View
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenEdit(item)}
              aria-label={`Edit social config ${item.id}`}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(item)}
              aria-label={`Delete social config ${item.id}`}
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
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link
            href="/workspace/content/sliders"
            className="button button--ghost"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Clapperboard size={16} /> Slider Videos
          </Link>
          <Link
            href="/workspace/content/social-media"
            className="button button--primary"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Globe size={16} /> Social Links
          </Link>
          <Link
            href="/workspace/content/social-features"
            className="button button--ghost"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Users size={16} /> Social Features
          </Link>
          <Link
            href="/workspace/content/sales-representatives"
            className="button button--ghost"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
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
            <Plus size={16} /> New Social Media Config
          </Button>
        )}
      </div>

      {/* Info notice about selection rule */}
      <div
        style={{
          padding: "var(--space-3)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-muted)",
        }}
      >
        <strong>Public Selection Behavior:</strong> The public website social links API (<code>GET /api/v1/home/sm/</code>) strictly selects the <strong>newest created record</strong> (<code>SocialMedia.objects.last()</code>). Creating a new configuration automatically updates the public footer links, while existing records remain for history and auditing.
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchValue={q}
        onSearchChange={(newQ) => updateParams({ q: newQ })}
        searchPlaceholder="Search URLs (facebook, instagram, twitter, youtube)..."
      />

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={initialItems}
        identifyingColumnIndex={2}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => updateParams({ page })}
      />

      {/* Detail Slide-over Drawer */}
      <Drawer
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeItem ? `Social Media Config #${activeItem.id}` : "Configuration Details"}
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
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Public API Status
                </span>
                <div style={{ marginTop: "4px" }}>
                  {activeItem.is_public_active ? (
                    <span
                      className="badge"
                      style={{
                        background: "var(--success-bg, rgba(46, 125, 50, 0.15))",
                        color: "var(--success, #2e7d32)",
                        border: "1px solid var(--success-border, rgba(46, 125, 50, 0.3))",
                        padding: "3px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "var(--font-size-xs)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Radio size={12} className="animate-pulse" /> Active on Public Website
                    </span>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        background: "var(--surface)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        padding: "3px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "var(--font-size-xs)",
                      }}
                    >
                      Historical Record (Superseded)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Facebook URL
                </span>
                <p style={{ margin: "2px 0 0 0", wordBreak: "break-all" }}>
                  <a
                    href={activeItem.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--primary)", textDecoration: "underline" }}
                  >
                    {activeItem.facebook} <ExternalLink size={12} style={{ display: "inline" }} />
                  </a>
                </p>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Instagram URL
                </span>
                <p style={{ margin: "2px 0 0 0", wordBreak: "break-all" }}>
                  {activeItem.instagram ? (
                    <a
                      href={activeItem.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", textDecoration: "underline" }}
                    >
                      {activeItem.instagram} <ExternalLink size={12} style={{ display: "inline" }} />
                    </a>
                  ) : (
                    <span className="muted">Not configured</span>
                  )}
                </p>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Twitter / X URL
                </span>
                <p style={{ margin: "2px 0 0 0", wordBreak: "break-all" }}>
                  {activeItem.twitter ? (
                    <a
                      href={activeItem.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", textDecoration: "underline" }}
                    >
                      {activeItem.twitter} <ExternalLink size={12} style={{ display: "inline" }} />
                    </a>
                  ) : (
                    <span className="muted">Not configured</span>
                  )}
                </p>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  YouTube URL
                </span>
                <p style={{ margin: "2px 0 0 0", wordBreak: "break-all" }}>
                  {activeItem.youtube ? (
                    <a
                      href={activeItem.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", textDecoration: "underline" }}
                    >
                      {activeItem.youtube} <ExternalLink size={12} style={{ display: "inline" }} />
                    </a>
                  ) : (
                    <span className="muted">Not configured</span>
                  )}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
              {canChange && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEdit(activeItem);
                  }}
                >
                  <Edit size={12} /> Edit Configuration
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Slide-over Drawer */}
      <Drawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Social Media Configuration"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <p className="muted" style={{ fontSize: "var(--font-size-xs)", margin: "0 0 var(--space-2) 0" }}>
            Add new social URLs. Creating this configuration makes it the newest record, thereby serving it immediately on the public website footer.
          </p>

          <FormField label="Facebook URL" required error={formErrors.facebook}>
            <Input
              type="url"
              placeholder="https://facebook.com/dreamcarhouse"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              required
              disabled={submitting}
            />
          </FormField>

          <FormField label="Instagram URL (Optional)" error={formErrors.instagram}>
            <Input
              type="url"
              placeholder="https://instagram.com/dreamcarhouse"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Twitter / X URL (Optional)" error={formErrors.twitter}>
            <Input
              type="url"
              placeholder="https://twitter.com/dreamcarhouse"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              disabled={submitting}
            />
          </FormField>

          <FormField label="YouTube URL (Optional)" error={formErrors.youtube}>
            <Input
              type="url"
              placeholder="https://youtube.com/@dreamcarhouse"
              value={formData.youtube}
              onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              disabled={submitting}
            />
          </FormField>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Configuration"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Slide-over Drawer */}
      <Drawer
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Social Media Config #${activeItem?.id || ""}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <FormField label="Facebook URL" required error={formErrors.facebook}>
            <Input
              type="url"
              placeholder="https://facebook.com/dreamcarhouse"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              required
              disabled={submitting}
            />
          </FormField>

          <FormField label="Instagram URL (Optional)" error={formErrors.instagram}>
            <Input
              type="url"
              placeholder="https://instagram.com/dreamcarhouse"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Twitter / X URL (Optional)" error={formErrors.twitter}>
            <Input
              type="url"
              placeholder="https://twitter.com/dreamcarhouse"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              disabled={submitting}
            />
          </FormField>

          <FormField label="YouTube URL (Optional)" error={formErrors.youtube}>
            <Input
              type="url"
              placeholder="https://youtube.com/@dreamcarhouse"
              value={formData.youtube}
              onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              disabled={submitting}
            />
          </FormField>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} disabled={submitting}>
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
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Configuration Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: "0 0 var(--space-2) 0", fontWeight: 500 }}>
                Are you sure you want to delete social media configuration #{activeItem?.id}?
              </p>
              {activeItem?.is_public_active && (
                <p style={{ margin: "var(--space-2) 0 0 0", color: "var(--danger)", fontSize: "var(--font-size-xs)", fontWeight: 500 }}>
                  ⚠️ This configuration is currently served on the public website! Deleting it will fall back to the preceding record, or leave the public endpoint empty if no other records exist.
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSubmit}
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
