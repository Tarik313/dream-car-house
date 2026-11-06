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
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  createModelGenerationAction,
  updateModelGenerationAction,
  deleteModelGenerationAction,
} from "@/app/actions/inventory";
import type { ModelGenerationItem, BrandItem } from "@/lib/types";

export function ModelGenerationListClient({
  initialModels,
  totalRows,
  currentPage,
  pageSize,
  brands,
  currentBrand,
  q,
  status,
}: {
  initialModels: ModelGenerationItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  brands: BrandItem[];
  currentBrand: string;
  q: string;
  status: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  const [editItem, setEditItem] = useState<ModelGenerationItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingModel, setDeletingModel] = useState<ModelGenerationItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newQ) params.set("q", newQ);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/workspace/model-generations?${params.toString()}`);
  };

  const handleFilterChange = (key: string, val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set(key, val);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/workspace/model-generations?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`/workspace/model-generations?${params.toString()}`);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateErrors({});

    const formData = new FormData(e.currentTarget);
    const brandId = parseInt(String(formData.get("brand")), 10);
    const model = String(formData.get("model") || "").trim();
    const statusVal = String(formData.get("status") || "PUBLISHED");

    const res = await createModelGenerationAction({
      brand: brandId,
      model,
      status: statusVal,
    });
    setCreateSubmitting(false);

    if (res.ok) {
      showToast("Model Generation created successfully.", "success");
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
      showToast(res.error.message || "Failed to create model.", "error");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    setEditSubmitting(true);
    setEditErrors({});

    const formData = new FormData(e.currentTarget);
    const brandId = parseInt(String(formData.get("brand")), 10);
    const model = String(formData.get("model") || "").trim();
    const statusVal = String(formData.get("status") || "PUBLISHED");

    const res = await updateModelGenerationAction(editItem.id, {
      brand: brandId,
      model,
      status: statusVal,
    });
    setEditSubmitting(false);

    if (res.ok) {
      showToast("Model updated successfully.", "success");
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
      showToast(res.error.message || "Failed to update model.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingModel) return;
    setDeleteSubmitting(true);
    const res = await deleteModelGenerationAction(deletingModel.id);
    setDeleteSubmitting(false);

    if (res.ok) {
      showToast("Model deleted successfully.", "success");
      setDeleteDialogOpen(false);
      setDeletingModel(null);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to delete model.", "error");
    }
  };

  const brandOptions = brands.map((b) => ({ label: b.name, value: String(b.id) }));

  const columns: ColumnDef<ModelGenerationItem>[] = [
    {
      id: "model",
      header: "Model Name",
      accessor: (row) => <span style={{ fontWeight: 600 }}>{row.model}</span>,
    },
    {
      id: "brand",
      header: "Brand Relationship",
      accessor: (row) => <Badge tone="neutral">{row.brand_name}</Badge>,
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
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditItem(row);
              setEditOpen(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <Edit size={12} /> Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setDeletingModel(row);
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
        searchPlaceholder="Search model names..."
        filters={[
          {
            key: "brand",
            label: "Brand",
            value: currentBrand,
            options: brandOptions,
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
            <Plus size={14} /> New Model
          </Button>
        }
      />

      <DataTable
        data={initialModels}
        columns={columns}
        identifyingColumnIndex={0}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Create Model Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Model Generation"
        position="right"
        size="sm"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <FormField label="Parent Brand" required error={createErrors.brand}>
            <Select name="brand" options={brandOptions} required />
          </FormField>

          <FormField label="Model Name" required error={createErrors.model}>
            <Input name="model" required placeholder="e.g. Land Cruiser" />
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createSubmitting}>
              {createSubmitting ? "Creating..." : "Save Model"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Model Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Model Generation"
        position="right"
        size="sm"
      >
        {editItem && (
          <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <FormField label="Parent Brand" required error={editErrors.brand}>
              <Select name="brand" options={brandOptions} defaultValue={String(editItem.brand)} required />
            </FormField>

            <FormField label="Model Name" required error={editErrors.model}>
              <Input name="model" defaultValue={editItem.model} required />
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
                defaultValue={editItem.status}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Model Generation"
        description="Vehicles referencing this model generation will have their model reference set to null."
      >
        <p>Are you sure you want to delete model <strong>{deletingModel?.model}</strong>?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteSubmitting}>
            {deleteSubmitting ? "Deleting..." : "Delete Model"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
