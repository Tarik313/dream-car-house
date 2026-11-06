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
import {
  createShowroomBranchAction,
  updateShowroomBranchAction,
  deleteShowroomBranchAction,
} from "@/app/actions/settings";
import type { ShowroomBranchItem } from "@/lib/types";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";

interface BranchesClientProps {
  initialItems: ShowroomBranchItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  status: string;
  userPermissions?: string[];
}

export function BranchesClient({
  initialItems,
  totalRows,
  currentPage,
  pageSize,
  q,
  status,
  userPermissions = [],
}: BranchesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canAdd =
    userPermissions.includes("*") ||
    userPermissions.includes("home.add_showroombranch");
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_showroombranch");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("home.delete_showroombranch");

  const [activeItem, setActiveItem] = useState<ShowroomBranchItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    branch_id: "",
    name: "",
    short_name: "",
    tag: "",
    address: "",
    phone: "",
    hotline: "",
    email: "dreamcarhouse101@gmail.com",
    hours: "Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)",
    map_link: "https://maps.google.com/?q=",
    embed_map: "https://maps.google.com/maps?output=embed",
    order: "1",
    status: "PUBLISHED",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setFormData({
      branch_id: "",
      name: "",
      short_name: "",
      tag: "",
      address: "",
      phone: "01615-121312",
      hotline: "+880 1615-121312",
      email: "dreamcarhouse101@gmail.com",
      hours: "Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)",
      map_link: "https://maps.google.com/?q=",
      embed_map: "https://maps.google.com/maps?output=embed",
      order: String(initialItems.length + 1),
      status: "PUBLISHED",
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (item: ShowroomBranchItem) => {
    setActiveItem(item);
    setFormData({
      branch_id: item.branch_id,
      name: item.name,
      short_name: item.short_name,
      tag: item.tag || "",
      address: item.address,
      phone: item.phone,
      hotline: item.hotline || "",
      email: item.email,
      hours: item.hours,
      map_link: item.map_link,
      embed_map: item.embed_map,
      order: String(item.order),
      status: item.status,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleOpenDetail = (item: ShowroomBranchItem) => {
    setActiveItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (item: ShowroomBranchItem) => {
    setActiveItem(item);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    const body = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      body.append(k, v);
    });

    const res = await createShowroomBranchAction(body);
    setSubmitting(false);

    if (res.ok) {
      showToast({
        type: "success",
        title: "Branch Created",
        message: `Showroom branch '${res.data.name}' has been created.`,
      });
      setIsCreateOpen(false);
      router.refresh();
    } else {
      showToast({
        type: "error",
        title: "Creation Failed",
        message: res.error?.message || "Failed to create showroom branch.",
      });
      if (res.error?.details && typeof res.error.details === "object") {
        setFormErrors(res.error.details as Record<string, string>);
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    setSubmitting(true);
    setFormErrors({});

    const body = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      body.append(k, v);
    });

    const res = await updateShowroomBranchAction(activeItem.id, body);
    setSubmitting(false);

    if (res.ok) {
      showToast({
        type: "success",
        title: "Branch Updated",
        message: `Showroom branch '${res.data.name}' updated successfully.`,
      });
      setIsEditOpen(false);
      router.refresh();
    } else {
      showToast({
        type: "error",
        title: "Update Failed",
        message: res.error?.message || "Failed to update showroom branch.",
      });
      if (res.error?.details && typeof res.error.details === "object") {
        setFormErrors(res.error.details as Record<string, string>);
      }
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activeItem) return;

    setSubmitting(true);
    const res = await deleteShowroomBranchAction(activeItem.id);
    setSubmitting(false);

    if (res.ok) {
      showToast({
        type: "success",
        title: "Branch Deleted",
        message: `Showroom branch '${activeItem.name}' removed.`,
      });
      setIsDeleteOpen(false);
      router.refresh();
    } else {
      showToast({
        type: "error",
        title: "Deletion Failed",
        message: res.error?.message || "Failed to delete showroom branch.",
      });
    }
  };

  const columns: ColumnDef<ShowroomBranchItem>[] = [
    {
      id: "name",
      header: "Branch",
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff" }}>{row.name}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
            ID: {row.branch_id}
          </div>
        </div>
      ),
    },
    {
      id: "tag",
      header: "Tag Pill",
      cell: (row) => (
        <span style={{ fontSize: "0.8rem", color: "#facc15" }}>
          {row.tag || "—"}
        </span>
      ),
    },
    {
      id: "address",
      header: "Address",
      cell: (row) => (
        <div style={{ fontSize: "0.8rem", color: "#cbd5e1", maxWidth: "260px" }}>
          {row.address}
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone / Hotline",
      cell: (row) => (
        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
          <div>{row.phone}</div>
          {row.hotline && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{row.hotline}</div>}
        </div>
      ),
    },
    {
      id: "order",
      header: "Order",
      cell: (row) => (
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#38bdf8" }}>
          #{row.order}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => {
        const isPublished = row.status === "PUBLISHED";
        return (
          <Badge tone={isPublished ? "success" : "neutral"}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDetail(row)}
            title="View Details"
          >
            <Eye size={14} />
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleOpenEdit(row)}
              title="Edit Branch"
            >
              <Edit size={14} />
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(row)}
              title="Delete Branch"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <FilterBar
          searchPlaceholder="Search branches by name, id or address..."
          searchValue={q}
          filters={[
            {
              param: "status",
              label: "Publication Status",
              options: [
                { label: "All Statuses", value: "" },
                { label: "Published Only", value: "PUBLISHED" },
                { label: "Unpublished", value: "UNPUBLISHED" },
              ],
            },
          ]}
        />
        {canAdd && (
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus size={16} />}
          >
            <span>Add Showroom Branch</span>
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={initialItems}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
      />

      {/* Create Drawer */}
      <Drawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Showroom Branch"
        description="Create a new physical showroom location for public website and footer maps."
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <FormField label="Branch Identifier (Slug)" required error={formErrors.branch_id}>
            <Input
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              placeholder="e.g. kakrail or gulshan"
              required
            />
          </FormField>

          <FormField label="Full Branch Name" required error={formErrors.name}>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Kakrail Branch & Showroom"
              required
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FormField label="Short Name" required error={formErrors.short_name}>
              <Input
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                placeholder="e.g. Kakrail Branch"
                required
              />
            </FormField>

            <FormField label="Tag Pill" error={formErrors.tag}>
              <Input
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g. Main Flagship Showroom"
              />
            </FormField>
          </div>

          <FormField label="Physical Address" required error={formErrors.address}>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000"
              required
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FormField label="Direct Phone" required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01615-121312"
                required
              />
            </FormField>

            <FormField label="Hotline" error={formErrors.hotline}>
              <Input
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                placeholder="+880 1615-121312"
              />
            </FormField>
          </div>

          <FormField label="Opening Hours" required error={formErrors.hours}>
            <Input
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              placeholder="Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)"
              required
            />
          </FormField>

          <FormField label="Google Maps Directions URL" required error={formErrors.map_link}>
            <Input
              value={formData.map_link}
              onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              required
            />
          </FormField>

          <FormField label="Google Maps Embed URL (Iframe Src)" required error={formErrors.embed_map}>
            <Input
              value={formData.embed_map}
              onChange={(e) => setFormData({ ...formData, embed_map: e.target.value })}
              placeholder="https://maps.google.com/maps?...output=embed"
              required
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FormField label="Display Order" required error={formErrors.order}>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Publication Status" required error={formErrors.status}>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { label: "Published (Visible on Public Website)", value: "PUBLISHED" },
                  { label: "Unpublished (Draft/Hidden)", value: "UNPUBLISHED" },
                ]}
              />
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Create Branch
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Showroom Branch: ${activeItem?.name || ""}`}
        description="Update showroom branch addresses, contact numbers, hours, and map links."
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <FormField label="Branch Identifier (Slug)" required error={formErrors.branch_id}>
            <Input
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Full Branch Name" required error={formErrors.name}>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FormField label="Short Name" required error={formErrors.short_name}>
              <Input
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Tag Pill" error={formErrors.tag}>
              <Input
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Physical Address" required error={formErrors.address}>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FormField label="Direct Phone" required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Hotline" error={formErrors.hotline}>
              <Input
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Opening Hours" required error={formErrors.hours}>
            <Input
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Google Maps Directions URL" required error={formErrors.map_link}>
            <Input
              value={formData.map_link}
              onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Google Maps Embed URL (Iframe Src)" required error={formErrors.embed_map}>
            <Input
              value={formData.embed_map}
              onChange={(e) => setFormData({ ...formData, embed_map: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FormField label="Display Order" required error={formErrors.order}>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Publication Status" required error={formErrors.status}>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { label: "Published (Visible on Public Website)", value: "PUBLISHED" },
                  { label: "Unpublished (Draft/Hidden)", value: "UNPUBLISHED" },
                ]}
              />
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeItem?.name || "Branch Details"}
      >
        {activeItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "#e2e8f0" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>BRANCH ID</span>
              <div style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{activeItem.branch_id}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>ADDRESS</span>
              <div style={{ fontSize: "0.9rem" }}>{activeItem.address}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>PHONE</span>
                <div style={{ fontSize: "0.9rem" }}>{activeItem.phone}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>HOTLINE</span>
                <div style={{ fontSize: "0.9rem" }}>{activeItem.hotline || "—"}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>OPENING HOURS</span>
              <div style={{ fontSize: "0.9rem" }}>{activeItem.hours}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>MAP PREVIEW</span>
              <div style={{ marginTop: "0.5rem", borderRadius: "6px", overflow: "hidden", height: "180px", border: "1px solid #1e2430" }}>
                <iframe
                  src={activeItem.embed_map}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  title={activeItem.name}
                />
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Showroom Branch"
        description={`Are you sure you want to delete '${activeItem?.name}'? This branch will no longer appear on the public website.`}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={submitting} onClick={handleDeleteSubmit}>
            Confirm Deletion
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
