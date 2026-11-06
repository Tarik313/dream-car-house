"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Drawer } from "@/components/ui/Drawer";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Upload } from "@/components/ui/Upload";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  createStockAction,
  updateStockAction,
  deleteStockAction,
} from "@/app/actions/inventory";
import type { StockItem } from "@/lib/types";

export function StockListClient({
  initialStocks,
  totalRows,
  currentPage,
  pageSize,
  q,
  status,
  userPermissions = [],
}: {
  initialStocks: StockItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  status: string;
  ordering?: string;
  userPermissions?: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const canAdd = userPermissions.includes("*") || userPermissions.includes("inventory.add_stock");
  const canChange = userPermissions.includes("*") || userPermissions.includes("inventory.change_stock");
  const canDelete = userPermissions.includes("*") || userPermissions.includes("inventory.delete_stock");

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createTitle, setCreateTitle] = useState("");
  const [createStatus, setCreateStatus] = useState("PUBLISHED");

  // Edit state
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("PUBLISHED");

  // Detail state
  const [detailItem, setDetailItem] = useState<StockItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStock, setDeletingStock] = useState<StockItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newQ) params.set("q", newQ);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/workspace/stocks?${params.toString()}`);
  };

  const handleFilterChange = (key: string, val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set(key, val);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/workspace/stocks?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`/workspace/stocks?${params.toString()}`);
  };

  const openCreateDrawer = () => {
    setCreateErrors({});
    setCreateTitle("");
    setCreateStatus("PUBLISHED");
    setCreateOpen(true);
  };

  const openEditDrawer = (item: StockItem) => {
    setEditErrors({});
    setEditItem(item);
    setEditTitle(item.title || "");
    setEditStatus(item.status);
    setEditOpen(true);
  };

  const openDetailDrawer = (item: StockItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateErrors({});

    const formData = new FormData(e.currentTarget);
    const res = await createStockAction(formData);
    setCreateSubmitting(false);

    if (res.ok) {
      showToast("Stock banner created successfully.", "success");
      setCreateOpen(false);
      setCreateTitle("");
      setCreateStatus("PUBLISHED");
      router.refresh();
    } else {
      if (res.error.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.error.fieldErrors)) {
          flat[k] = Array.isArray(v) ? (v[0] ?? "") : String(v);
        }
        setCreateErrors(flat);
      }
      showToast(res.error.message || "Failed to create stock item.", "error");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    setEditSubmitting(true);
    setEditErrors({});

    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("image");
    if (imageFile instanceof File && (imageFile.size === 0 || !imageFile.name)) {
      formData.delete("image");
    }
    const res = await updateStockAction(editItem.id, formData);
    setEditSubmitting(false);

    if (res.ok) {
      showToast("Stock banner updated successfully.", "success");
      setEditOpen(false);
      setEditItem(null);
      router.refresh();
    } else {
      if (res.error.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.error.fieldErrors)) {
          flat[k] = Array.isArray(v) ? (v[0] ?? "") : String(v);
        }
        setEditErrors(flat);
      }
      showToast(res.error.message || "Failed to update stock item.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingStock) return;
    setDeleteSubmitting(true);
    const res = await deleteStockAction(deletingStock.id);
    setDeleteSubmitting(false);

    if (res.ok) {
      showToast("Stock banner deleted successfully.", "success");
      setDeleteDialogOpen(false);
      setDeletingStock(null);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to delete stock item.", "error");
    }
  };

  const columns: ColumnDef<StockItem>[] = [
    {
      id: "title",
      header: "Title & Banner",
      isIdentifying: true,
      sortable: true,
      accessor: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {row.image && (
            <img
              src={row.image}
              alt={row.title || "Stock banner"}
              style={{ width: "48px", height: "32px", objectFit: "cover", borderRadius: "2px" }}
            />
          )}
          <button
            type="button"
            onClick={() => openDetailDrawer(row)}
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
            {row.title || `Stock #${row.id}`}
          </button>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => (
        <Badge tone={row.status === "PUBLISHED" ? "success" : row.status === "ARCHIVED" ? "error" : "warning"}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: "created_at",
      header: "Created At",
      sortable: true,
      accessor: (row) => (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "updated_at",
      header: "Updated At",
      sortable: true,
      accessor: (row) => (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
          {new Date(row.updated_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDetailDrawer(row)}
          >
            Detail
          </Button>
          {canChange && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openEditDrawer(row)}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setDeletingStock(row);
                setDeleteDialogOpen(true);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
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
      <FilterBar
        searchValue={q}
        onSearchChange={handleSearch}
        searchPlaceholder="Search stock items by title..."
        filters={[
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
          canAdd && (
            <Button variant="primary" onClick={openCreateDrawer} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Plus size={14} /> New Stock Item
            </Button>
          )
        }
      />

      <DataTable
        data={initialStocks}
        columns={columns}
        identifyingColumnIndex={0}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Create Stock Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Stock Banner"
        position="right"
        size="sm"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <FormField label="Title" error={createErrors.title} description="Optional stock banner title (e.g. Fresh Shipment from Japan)">
            <Input
              name="title"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="e.g. Fresh Shipment from Japan"
              maxLength={100}
            />
          </FormField>

          <FormField label="Stock Image" required error={createErrors.image} description="Banner media (jpg, jpeg, png, webp)">
            <Upload name="image" accept="image/jpeg,image/png,image/webp" required />
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
              value={createStatus}
              onChange={(e) => setCreateStatus(e.target.value)}
            />
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createSubmitting}>
              {createSubmitting ? "Creating..." : "Save Stock"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Stock Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Stock Banner"
        position="right"
        size="sm"
      >
        {editItem && (
          <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <FormField label="Title" error={editErrors.title} description="Optional stock banner title">
              <Input
                name="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={100}
              />
            </FormField>

            <FormField label="Stock Image" error={editErrors.image} description="Leave blank to preserve existing banner">
              {editItem.image && (
                <div style={{ marginBottom: "var(--space-2)" }}>
                  <img src={editItem.image} alt={editItem.title || ""} style={{ maxHeight: "80px", objectFit: "cover", borderRadius: "2px" }} />
                </div>
              )}
              <Upload name="image" accept="image/jpeg,image/png,image/webp" />
            </FormField>

            <FormField label="Status" error={editErrors.status}>
              <Select
                name="status"
                options={[
                  { label: "Published", value: "PUBLISHED" },
                  { label: "Unpublished", value: "UNPUBLISHED" },
                  { label: "Archived", value: "ARCHIVED" },
                  { label: "Unlisted", value: "UNLISTED" },
                ]}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              />
            </FormField>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
              <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={editSubmitting}>
                {editSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Drawer>

      {/* Stock Detail Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailItem?.title || (detailItem ? `Stock #${detailItem.id}` : "Stock Details")}
        position="right"
        size="md"
      >
        {detailItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {detailItem.image && (
              <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
                <img
                  src={detailItem.image}
                  alt={detailItem.title || "Stock banner"}
                  style={{ width: "100%", maxHeight: "240px", objectFit: "cover", display: "block" }}
                />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
              <span className="muted">ID:</span>
              <span><strong>#{detailItem.id}</strong></span>

              <span className="muted">Title:</span>
              <span>{detailItem.title || "—"}</span>

              <span className="muted">Status:</span>
              <span>
                <Badge tone={detailItem.status === "PUBLISHED" ? "success" : detailItem.status === "ARCHIVED" ? "error" : "warning"}>
                  {detailItem.status}
                </Badge>
              </span>

              <span className="muted">Created At:</span>
              <span>{new Date(detailItem.created_at).toLocaleString()}</span>

              <span className="muted">Updated At:</span>
              <span>{new Date(detailItem.updated_at).toLocaleString()}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
              {canChange && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setDetailOpen(false);
                    openEditDrawer(detailItem);
                  }}
                >
                  Edit Banner
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Stock Banner"
        description="Permanently delete this showroom stock media item."
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to delete <strong>{deletingStock?.title || `Stock #${deletingStock?.id}`}</strong>?
        </p>
        <p className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "var(--space-2)" }}>
          Notice: This removes the media banner from the database and public showcase. Dependent vehicle records are not affected.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteSubmitting}>
            {deleteSubmitting ? "Deleting..." : "Delete Stock"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
