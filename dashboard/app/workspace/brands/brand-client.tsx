"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Drawer } from "@/components/ui/Drawer";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Upload } from "@/components/ui/Upload";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Edit, AlertTriangle } from "lucide-react";
import { createBrandAction, deleteBrandAction, getBrandCascadeImpactAction } from "@/app/actions/inventory";
import type { BrandItem, BrandCascadeImpact } from "@/lib/types";

export function BrandListClient({
  initialBrands,
  totalRows,
  currentPage,
  pageSize,
  q,
  status,
  segment,
}: {
  initialBrands: BrandItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  status: string;
  segment: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  // Deletion cascade state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactData, setImpactData] = useState<BrandCascadeImpact | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newQ) params.set("q", newQ);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/workspace/brands?${params.toString()}`);
  };

  const handleFilterChange = (key: string, val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set(key, val);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/workspace/brands?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`/workspace/brands?${params.toString()}`);
  };

  const openDeleteDialog = async (brand: BrandItem) => {
    setDeletingBrand(brand);
    setDeleteDialogOpen(true);
    setImpactLoading(true);
    setDeleteConfirmed(false);
    setImpactData(null);

    const res = await getBrandCascadeImpactAction(brand.id);
    setImpactLoading(false);
    if (res.ok) {
      setImpactData(res.data);
    } else {
      showToast(res.error.message || "Failed to inspect deletion cascade.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;

    if (impactData?.blocked || (impactData?.inventory_count && impactData.inventory_count > 0)) {
      showToast(
        impactData.block_reason || "Deletion is blocked because this brand has dependent vehicles.",
        "error"
      );
      return;
    }

    if (impactData?.has_cascades && !deleteConfirmed) {
      showToast("Explicit confirmation is required to delete cascading model generation records.", "error");
      return;
    }

    setDeleteSubmitting(true);
    const res = await deleteBrandAction(deletingBrand.id, deleteConfirmed);
    setDeleteSubmitting(false);

    if (res.ok) {
      showToast(`Brand '${deletingBrand.name}' deleted successfully.`, "success");
      setDeleteDialogOpen(false);
      setDeletingBrand(null);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to delete brand.", "error");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    const runwayInput = form.elements.namedItem("is_in_runway") as HTMLInputElement | null;
    formData.set("is_in_runway", runwayInput?.checked ? "true" : "false");

    const res = await createBrandAction(formData);
    setCreateSubmitting(false);

    if (res.ok) {
      showToast("Brand created successfully.", "success");
      setCreateOpen(false);
      router.refresh();
    } else {
      if (res.error.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.error.fieldErrors)) {
          flat[k] = Array.isArray(v) ? (v[0] ?? "") : String(v);
        }
        setCreateErrors(flat);
      }
      showToast(res.error.message || "Failed to create brand.", "error");
    }
  };

  const columns: ColumnDef<BrandItem>[] = [
    {
      id: "name",
      header: "Brand Name",
      accessor: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {row.image && (
            <img
              src={row.image}
              alt={row.name}
              style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "2px" }}
            />
          )}
          <Link
            href={`/workspace/brands/${row.id}`}
            style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}
          >
            {row.name}
          </Link>
        </div>
      ),
    },
    {
      id: "segment",
      header: "Segment",
      accessor: (row) => {
        const labels: Record<string, string> = {
          LUXURY_PERFORMANCE: "Luxury & Performance",
          REFINED_VERSATILE: "Refined & Versatile",
          ELECTRIC: "Electric",
        };
        return <Badge tone="neutral">{labels[row.segment] || row.segment}</Badge>;
      },
    },
    {
      id: "order",
      header: "Order",
      accessor: (row) => (
        <span style={{ fontWeight: 600, color: "var(--text)" }}>
          #{row.order ?? 0}
        </span>
      ),
    },
    {
      id: "runway",
      header: "Runway",
      accessor: (row) => (
        <Badge tone={row.is_in_runway !== false ? "success" : "neutral"}>
          {row.is_in_runway !== false ? "Visible" : "Hidden"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <Badge tone={row.status === "PUBLISHED" ? "success" : row.status === "ARCHIVED" ? "error" : "warning"}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: "seo",
      header: "SEO Meta",
      accessor: (row) => (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
          {row.meta_title || "Default title"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Link href={`/workspace/brands/${row.id}`} className="button button--secondary" style={{ padding: "4px 8px", fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Edit size={12} /> Edit
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => openDeleteDialog(row)}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <Trash2 size={12} /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <FilterBar
        searchValue={q}
        onSearchChange={handleSearch}
        searchPlaceholder="Search brands by name or segment..."
        filters={[
          {
            key: "segment",
            label: "Segment",
            value: segment,
            options: [
              { label: "Luxury & Performance", value: "LUXURY_PERFORMANCE" },
              { label: "Refined & Versatile", value: "REFINED_VERSATILE" },
              { label: "Electric", value: "ELECTRIC" },
            ],
          },
          {
            key: "status",
            label: "Status",
            value: status,
            options: [
              { label: "Published", value: "PUBLISHED" },
              { label: "Unpublished", value: "UNPUBLISHED" },
              { label: "Archived", value: "ARCHIVED" },
              { label: "Unlisted", value: "UNLISTED" },
            ],
          },
        ]}
        onFilterChange={handleFilterChange}
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Plus size={14} /> New Brand
          </Button>
        }
      />

      <DataTable
        data={initialBrands}
        columns={columns}
        identifyingColumnIndex={0}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Create Brand Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New Brand"
        position="right"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <FormField label="Brand Name" required error={createErrors.name}>
            <Input name="name" required placeholder="e.g. Porsche" />
          </FormField>

          <FormField label="Segment" required error={createErrors.segment}>
            <Select
              name="segment"
              options={[
                { label: "Luxury & Performance", value: "LUXURY_PERFORMANCE" },
                { label: "Refined & Versatile", value: "REFINED_VERSATILE" },
                { label: "Electric", value: "ELECTRIC" },
              ]}
              defaultValue="REFINED_VERSATILE"
            />
          </FormField>

          <FormField label="Status" error={createErrors.status}>
            <Select
              name="status"
              options={[
                { label: "Published", value: "PUBLISHED" },
                { label: "Unpublished", value: "UNPUBLISHED" },
                { label: "Archived", value: "ARCHIVED" },
                { label: "Unlisted", value: "UNLISTED" },
              ]}
              defaultValue="PUBLISHED"
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <FormField label="Display Order" error={createErrors.order}>
              <Input type="number" name="order" defaultValue={0} />
            </FormField>

            <FormField label="Runway Strip Visibility" error={createErrors.is_in_runway}>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: "var(--space-2)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="is_in_runway"
                  defaultChecked={true}
                  style={{ width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "var(--font-size-sm)" }}>Show in Runway</span>
              </label>
            </FormField>
          </div>

          <FormField label="Destination URL (Optional)" error={createErrors.destination_url} description="Defaults to /inventory?brand=<name>">
            <Input name="destination_url" placeholder="e.g. /inventory?brand=BMW" />
          </FormField>

          <FormField label="Brand Logo" required error={createErrors.image} description="SVG, PNG, WEBP or JPG (max 10MB)">
            <Upload name="image" accept="image/*,.svg" required />
          </FormField>

          <FormField label="Logo Alt Text" error={createErrors.logo_alt} description="Defaults to brand name">
            <Input name="logo_alt" placeholder="e.g. BMW luxury marque" />
          </FormField>

          <FormField label="Meta Title" error={createErrors.meta_title}>
            <Input name="meta_title" placeholder="Shown in tab (max 70 chars)" />
          </FormField>

          <FormField label="Meta Description" error={createErrors.meta_description}>
            <Textarea name="meta_description" placeholder="Search snippet (max 500 chars)" />
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createSubmitting}>
              {createSubmitting ? "Creating..." : "Save Brand"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Delete / Cascade Inspection Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Brand Deletion"
        description="Verify cascade impact before deleting brand reference record."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <p>Are you sure you want to delete brand <strong>{deletingBrand?.name}</strong>?</p>

          {impactLoading ? (
            <p className="muted">Inspecting relationship cascade impact...</p>
          ) : impactData ? (
            <div
              style={{
                padding: "var(--space-3)",
                background: impactData.blocked
                  ? "var(--error-surface, #ffebee)"
                  : impactData.has_cascades
                  ? "var(--warning-surface, #fff8e1)"
                  : "var(--hover)",
                border: impactData.blocked
                  ? "1px solid var(--danger)"
                  : impactData.has_cascades
                  ? "1px solid var(--warning, #ffb300)"
                  : "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <h4 style={{ margin: "0 0 var(--space-2) 0", color: impactData.blocked ? "var(--danger)" : "inherit" }}>
                {impactData.blocked ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={16} /> Deletion Blocked
                  </span>
                ) : impactData.has_cascades ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={16} /> Cascade Impact Warning
                  </span>
                ) : (
                  "Safe to Delete"
                )}
              </h4>

              {impactData.blocked ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--danger)", fontWeight: 500 }}>
                    {impactData.block_reason || `This brand is currently linked to ${impactData.inventory_count} vehicle(s). Deletion that would remove vehicles is blocked in this phase.`}
                  </p>
                  <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                    To delete this brand, please reassign or delete the associated inventory vehicles first.
                  </p>
                </div>
              ) : (
                <>
                  <p style={{ margin: "0 0 var(--space-1) 0", fontSize: "var(--font-size-sm)" }}>
                    - Associated Inventory Vehicles: <strong>{impactData.inventory_count}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                    - Associated Model Generations: <strong>{impactData.model_generation_count}</strong> {impactData.model_generation_count > 0 ? "(will be CASCADE DELETED)" : ""}
                  </p>

                  {impactData.has_cascades && (
                    <div style={{ marginTop: "var(--space-3)" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--font-size-sm)", color: "var(--danger)" }}>
                        <input
                          type="checkbox"
                          checked={deleteConfirmed}
                          onChange={(e) => setDeleteConfirmed(e.target.checked)}
                        />
                        I understand this permanently deletes {impactData.model_generation_count} model generation(s).
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
              {impactData?.blocked ? "Close" : "Cancel"}
            </Button>
            {!impactData?.blocked && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteSubmitting || (impactData?.has_cascades && !deleteConfirmed)}
              >
                {deleteSubmitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
