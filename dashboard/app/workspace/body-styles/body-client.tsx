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
  createBodyStyleAction,
  updateBodyStyleAction,
  deleteBodyStyleAction,
} from "@/app/actions/inventory";
import type { BodyStyleItem } from "@/lib/types";

export function BodyStyleListClient({
  initialStyles,
  totalRows,
  currentPage,
  pageSize,
  q,
  status,
}: {
  initialStyles: BodyStyleItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  status: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  const [editItem, setEditItem] = useState<BodyStyleItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStyle, setDeletingStyle] = useState<BodyStyleItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newQ) params.set("q", newQ);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/workspace/body-styles?${params.toString()}`);
  };

  const handleFilterChange = (key: string, val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set(key, val);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/workspace/body-styles?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`/workspace/body-styles?${params.toString()}`);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateErrors({});

    const formData = new FormData(e.currentTarget);
    const body = String(formData.get("body") || "").trim();
    const statusVal = String(formData.get("status") || "PUBLISHED");

    const res = await createBodyStyleAction({ body, status: statusVal });
    setCreateSubmitting(false);

    if (res.ok) {
      showToast("Body style created successfully.", "success");
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
      showToast(res.error.message || "Failed to create body style.", "error");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    setEditSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = String(formData.get("body") || "").trim();
    const statusVal = String(formData.get("status") || "PUBLISHED");

    const res = await updateBodyStyleAction(editItem.id, { body, status: statusVal });
    setEditSubmitting(false);

    if (res.ok) {
      showToast("Body style updated successfully.", "success");
      setEditOpen(false);
      setEditItem(null);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to update body style.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingStyle) return;
    setDeleteSubmitting(true);
    const res = await deleteBodyStyleAction(deletingStyle.id);
    setDeleteSubmitting(false);

    if (res.ok) {
      showToast("Body style deleted successfully.", "success");
      setDeleteDialogOpen(false);
      setDeletingStyle(null);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to delete body style.", "error");
    }
  };

  const columns: ColumnDef<BodyStyleItem>[] = [
    {
      id: "body",
      header: "Body Style Name",
      accessor: (row) => <span style={{ fontWeight: 600 }}>{row.body}</span>,
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
              setDeletingStyle(row);
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
        searchPlaceholder="Search body styles..."
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
          <Button variant="primary" onClick={() => setCreateOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Plus size={14} /> New Body Style
          </Button>
        }
      />

      <DataTable
        data={initialStyles}
        columns={columns}
        identifyingColumnIndex={0}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Create Body Style Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Body Style"
        position="right"
        size="sm"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <FormField label="Body Style Name" required error={createErrors.body}>
            <Input name="body" required placeholder="e.g. Sedan, SUV, Coupe" />
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
              {createSubmitting ? "Creating..." : "Save Body Style"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Body Style Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Body Style"
        position="right"
        size="sm"
      >
        {editItem && (
          <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <FormField label="Body Style Name" required>
              <Input name="body" defaultValue={editItem.body} required />
            </FormField>

            <FormField label="Status">
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
        title="Delete Body Style"
        description="Vehicles using this body style will have body_style set to null."
      >
        <p>Are you sure you want to delete body style <strong>{deletingStyle?.body}</strong>?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteSubmitting}>
            {deleteSubmitting ? "Deleting..." : "Delete Body Style"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
