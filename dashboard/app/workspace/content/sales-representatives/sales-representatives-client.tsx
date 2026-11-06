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
  User,
  Plus,
  Eye,
  Edit,
  Trash2,
  Phone,
  AlertTriangle,
  Clapperboard,
  Globe,
  Users,
} from "lucide-react";
import {
  createSalesRepresentativeAction,
  updateSalesRepresentativeAction,
  deleteSalesRepresentativeAction,
} from "@/app/actions/inventory";
import type { SalesRepresentativeItem } from "@/lib/types";

interface SalesRepresentativesClientProps {
  initialItems: SalesRepresentativeItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  status: string;
  userPermissions?: string[];
}

export function SalesRepresentativesClient({
  initialItems,
  totalRows,
  currentPage,
  pageSize,
  q,
  status,
  userPermissions = [],
}: SalesRepresentativesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canAdd =
    userPermissions.includes("*") ||
    userPermissions.includes("home.add_salesrepresentative");
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_salesrepresentative");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("home.delete_salesrepresentative");

  // State
  const [activeItem, setActiveItem] = useState<SalesRepresentativeItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [itemStatus, setItemStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setName("");
    setPhoneNumber("");
    setItemStatus("PUBLISHED");
    setFormErrors({});
  }

  function updateParams(newParams: { q?: string; status?: string; page?: number }) {
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
    if (newParams.page !== undefined) {
      params.set("page", String(newParams.page));
    }
    router.push(`/workspace/content/sales-representatives?${params.toString()}`);
  }

  function handleOpenCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function handleOpenEdit(item: SalesRepresentativeItem) {
    setActiveItem(item);
    setName(item.name);
    setPhoneNumber(item.phone_number);
    setItemStatus(item.status);
    setFormErrors({});
    setEditOpen(true);
  }

  function handleOpenDetail(item: SalesRepresentativeItem) {
    setActiveItem(item);
    setDetailOpen(true);
  }

  function handleOpenDelete(item: SalesRepresentativeItem) {
    setActiveItem(item);
    setDeleteDialogOpen(true);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      const res = await createSalesRepresentativeAction({
        name: name.trim(),
        phone_number: phoneNumber.trim(),
        status: itemStatus,
      });

      if (!res.ok) {
        showToast(res.error.message || "Failed to create sales representative.", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
      } else {
        showToast(`Sales representative '${res.data.name}' created.`, "success");
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

    try {
      const res = await updateSalesRepresentativeAction(activeItem.id, {
        name: name.trim(),
        phone_number: phoneNumber.trim(),
        status: itemStatus,
      });

      if (!res.ok) {
        showToast(res.error.message || "Failed to update representative.", "error");
        if (res.error.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.error.fieldErrors)) {
            mapped[k] = Array.isArray(v) ? String(v[0] || "") : String(v || "");
          }
          setFormErrors(mapped);
        }
      } else {
        showToast(`Representative '${res.data.name}' updated.`, "success");
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
      const res = await deleteSalesRepresentativeAction(activeItem.id);
      if (!res.ok) {
        showToast(res.error.message || "Failed to delete representative.", "error");
      } else {
        showToast("Sales representative deleted successfully.", "success");
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

  const columns: ColumnDef<SalesRepresentativeItem>[] = [
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
      id: "name",
      header: "Representative Name",
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
          }}
        >
          {item.name}
        </button>
      ),
    },
    {
      id: "phone",
      header: "Phone Number",
      accessor: (item) => (
        <a
          href={`tel:${item.phone_number}`}
          style={{
            color: "var(--primary)",
            textDecoration: "underline",
            fontSize: "var(--font-size-xs)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Phone size={11} /> {item.phone_number}
        </a>
      ),
    },
    {
      id: "status",
      header: "Publication Status",
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
      id: "actions",
      header: "Actions",
      accessor: (item) => (
        <div style={{ display: "flex", gap: "var(--space-1)", justifyContent: "flex-end" }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDetail(item)}
            aria-label={`View representative ${item.name}`}
          >
            <Eye size={12} /> View
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenEdit(item)}
              aria-label={`Edit representative ${item.name}`}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(item)}
              aria-label={`Delete representative ${item.name}`}
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
            className="button button--ghost"
            style={{ fontSize: "var(--font-size-sm)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            <Users size={16} /> Social Features
          </Link>
          <Link
            href="/workspace/content/sales-representatives"
            className="button button--primary"
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
            <Plus size={16} /> New Sales Representative
          </Button>
        )}
      </div>

      {/* Info notice about public contract */}
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
        <strong>Publication Behavior:</strong> The public website sales directory API (<code>GET /api/v1/home/sales-representative/</code>) strictly returns representatives marked as <strong>PUBLISHED</strong>. Draft advisors remain visible only to authorized internal staff.
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchValue={q}
        onSearchChange={(newQ) => updateParams({ q: newQ })}
        searchPlaceholder="Search name or phone number..."
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
        title={activeItem ? activeItem.name : "Representative Details"}
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
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Full Name</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600 }}>{activeItem.name}</p>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Phone Number</span>
                <p style={{ margin: "2px 0 0 0" }}>
                  <a
                    href={`tel:${activeItem.phone_number}`}
                    style={{ color: "var(--primary)", textDecoration: "underline" }}
                  >
                    <Phone size={12} style={{ display: "inline", marginRight: "4px" }} />
                    {activeItem.phone_number}
                  </a>
                </p>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>Status</span>
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
                  <Edit size={12} /> Edit Representative
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
        title="Create Sales Representative"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <FormField label="Representative Name" required error={formErrors.name}>
            <Input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              maxLength={100}
            />
          </FormField>

          <FormField label="Phone Number" required error={formErrors.phone_number}>
            <Input
              type="text"
              placeholder="e.g. +880 1712 345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={submitting}
              maxLength={15}
            />
          </FormField>

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

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Representative"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Slide-over Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Representative #${activeItem?.id || ""}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <FormField label="Representative Name" required error={formErrors.name}>
            <Input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              maxLength={100}
            />
          </FormField>

          <FormField label="Phone Number" required error={formErrors.phone_number}>
            <Input
              type="text"
              placeholder="e.g. +880 1712 345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={submitting}
              maxLength={15}
            />
          </FormField>

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
        title="Confirm Representative Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: "0 0 var(--space-2) 0", fontWeight: 500 }}>
                Are you sure you want to delete this sales representative?
              </p>
              <p className="muted" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                Name: <strong>{activeItem?.name}</strong> ({activeItem?.phone_number})
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
