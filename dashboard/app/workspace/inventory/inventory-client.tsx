"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { deleteInventoryAction } from "@/app/actions/inventory";
import type { InventoryListItem, BrandItem } from "@/lib/types";

export function InventoryListClient({
  initialInventory,
  totalRows,
  currentPage,
  pageSize,
  brands,
  q,
  status,
  registered,
  currentBrand,
  carType,
}: {
  initialInventory: InventoryListItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  brands: BrandItem[];
  q: string;
  status: string;
  registered: string;
  currentBrand: string;
  carType: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCar, setDeletingCar] = useState<InventoryListItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newQ) params.set("q", newQ);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/workspace/inventory?${params.toString()}`);
  };

  const handleFilterChange = (key: string, val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set(key, val);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/workspace/inventory?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`/workspace/inventory?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deletingCar) return;
    setDeleteSubmitting(true);
    const res = await deleteInventoryAction(deletingCar.id);
    setDeleteSubmitting(false);

    if (res.ok) {
      showToast("Vehicle deleted successfully.", "success");
      setDeleteDialogOpen(false);
      setDeletingCar(null);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to delete vehicle.", "error");
    }
  };

  const brandOptions = brands.map((b) => ({ label: b.name, value: String(b.id) }));

  const columns: ColumnDef<InventoryListItem>[] = [
    {
      id: "name",
      header: "Vehicle Name",
      accessor: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {row.feature_image ? (
            <img
              src={row.feature_image}
              alt={row.name}
              style={{ width: "48px", height: "32px", objectFit: "cover", borderRadius: "2px" }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "32px",
                background: "var(--hover)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "2px",
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
              }}
            >
              No img
            </div>
          )}
          <div>
            <Link
              href={`/workspace/inventory/${row.id}`}
              style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}
            >
              {row.name}
            </Link>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
              {row.year || "Year N/A"} • {row.brand_name} {row.model_generation_name ? `(${row.model_generation_name})` : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price (BDT)",
      accessor: (row) => (
        <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {row.price ? `BDT ${Number(row.price).toLocaleString()}` : "Price on Request"}
        </span>
      ),
    },
    {
      id: "availability",
      header: "Availability",
      accessor: (row) => {
        const tone =
          row.registered === "Available"
            ? "success"
            : row.registered === "Sold"
            ? "neutral"
            : row.registered === "Booked"
            ? "warning"
            : "brand";
        return <Badge tone={tone}>{row.registered}</Badge>;
      },
    },
    {
      id: "status",
      header: "Publication",
      accessor: (row) => {
        const tone =
          row.status === "PUBLISHED"
            ? "success"
            : row.status === "ARCHIVED"
            ? "error"
            : row.status === "UNLISTED"
            ? "neutral"
            : "warning";
        return <Badge tone={tone}>{row.status}</Badge>;
      },
    },
    {
      id: "featured",
      header: "Featured",
      accessor: (row) => (row.is_featured ? <Badge tone="brand">Featured</Badge> : <span className="muted">-</span>),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Link
            href={`/workspace/inventory/${row.id}`}
            className="button button--secondary"
            style={{ padding: "4px 8px", fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <Edit size={12} /> Edit
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setDeletingCar(row);
              setDeleteDialogOpen(true);
            }}
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
        searchPlaceholder="Search vehicles by name, model or slug..."
        filters={[
          {
            key: "brand",
            label: "Brand",
            value: currentBrand,
            options: brandOptions,
          },
          {
            key: "registered",
            label: "Availability",
            value: registered,
            options: [
              { label: "Available", value: "Available" },
              { label: "Sold", value: "Sold" },
              { label: "Booked", value: "Booked" },
              { label: "Pre-Order", value: "Pre-Order" },
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
          {
            key: "car_type",
            label: "Car Type",
            value: carType,
            options: [
              { label: "Reconditioned", value: "RECONDITIONED" },
              { label: "Brand New", value: "BRAND_NEW" },
              { label: "Pre-Owned", value: "PRE_OWNED" },
            ],
          },
        ]}
        onFilterChange={handleFilterChange}
        actions={
          <Link href="/workspace/inventory/new" className="button button--primary" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Plus size={14} /> Add Vehicle
          </Link>
        }
      />

      <DataTable
        data={initialInventory}
        columns={columns}
        identifyingColumnIndex={0}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Vehicle"
        description="Permanently delete this vehicle from inventory."
      >
        <p>Are you sure you want to delete <strong>{deletingCar?.name}</strong>?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteSubmitting}>
            {deleteSubmitting ? "Deleting..." : "Delete Vehicle"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
