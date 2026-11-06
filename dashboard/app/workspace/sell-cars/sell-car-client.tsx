"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Drawer } from "@/components/ui/Drawer";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  Trash2,
  Edit,
  Car,
  User,
  Phone,
  Calendar,
  Gauge,
  DollarSign,
  Images,
  ZoomIn,
} from "lucide-react";
import { updateSellCarAction, deleteSellCarAction, deleteSellCarImageAction } from "@/app/actions/inventory";
import type { SellCarItem, SellYourCarImageItem } from "@/lib/types";

export function SellCarListClient({
  initialSellCars,
  totalRows,
  currentPage,
  pageSize,
  q,
  userPermissions = [],
}: {
  initialSellCars: SellCarItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  carYearFilter: string;
  ordering?: string;
  userPermissions?: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange = userPermissions.includes("*") || userPermissions.includes("home.change_sellcar");
  const canDelete = userPermissions.includes("*") || userPermissions.includes("home.delete_sellcar");
  const canDeleteImage = userPermissions.includes("*") || userPermissions.includes("home.delete_sellyourcarimages");

  // Edit state
  const [editItem, setEditItem] = useState<SellCarItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCarName, setEditCarName] = useState("");
  const [editCarModel, setEditCarModel] = useState("");
  const [editCarYear, setEditCarYear] = useState("");
  const [editMileage, setEditMileage] = useState("");
  const [editOfferedPrice, setEditOfferedPrice] = useState("");

  // Detail state
  const [detailItem, setDetailItem] = useState<SellCarItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<SellYourCarImageItem | null>(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSellCar, setDeletingSellCar] = useState<SellCarItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newQ) params.set("q", newQ);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/workspace/sell-cars?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`/workspace/sell-cars?${params.toString()}`);
  };

  const openEditDrawer = (item: SellCarItem) => {
    setEditErrors({});
    setEditItem(item);
    setEditName(item.name);
    setEditPhone(item.phone);
    setEditCarName(item.car_name);
    setEditCarModel(item.car_model);
    setEditCarYear(item.car_year);
    setEditMileage(String(item.mileage));
    setEditOfferedPrice(item.offered_price !== null ? String(item.offered_price) : "");
    setEditOpen(true);
  };

  const openDetailDrawer = (item: SellCarItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    setEditSubmitting(true);
    setEditErrors({});

    const mileageNum = parseInt(editMileage, 10);
    const offeredPriceNum = editOfferedPrice.trim() ? parseInt(editOfferedPrice, 10) : null;

    const res = await updateSellCarAction(editItem.id, {
      name: editName,
      phone: editPhone,
      car_name: editCarName,
      car_model: editCarModel,
      car_year: editCarYear,
      mileage: isNaN(mileageNum) ? editItem.mileage : mileageNum,
      offered_price: offeredPriceNum,
    });
    setEditSubmitting(false);

    if (res.ok) {
      showToast("Submission updated successfully.", "success");
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
      showToast(res.error.message || "Failed to update submission.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingSellCar) return;
    setDeleteSubmitting(true);
    const res = await deleteSellCarAction(deletingSellCar.id);
    setDeleteSubmitting(false);

    if (res.ok) {
      showToast("Submission deleted successfully.", "success");
      setDeleteDialogOpen(false);
      setDeletingSellCar(null);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to delete submission.", "error");
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!detailItem) return;
    const res = await deleteSellCarImageAction(detailItem.id, imageId);
    if (res.ok) {
      showToast("Image removed successfully.", "success");
      setDetailItem((prev) =>
        prev
          ? {
              ...prev,
              inventory_images: prev.inventory_images.filter((img) => img.id !== imageId),
            }
          : null
      );
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to remove image.", "error");
    }
  };

  const columns: ColumnDef<SellCarItem>[] = [
    {
      id: "name",
      header: "Customer & Contact",
      isIdentifying: true,
      sortable: true,
      accessor: (row) => (
        <div>
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
            {row.name}
          </button>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
            <a href={`tel:${row.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
              {row.phone}
            </a>
          </div>
        </div>
      ),
    },
    {
      id: "car_name",
      header: "Vehicle Details",
      sortable: true,
      accessor: (row) => (
        <div>
          <strong>{row.car_name}</strong> {row.car_model}
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
            Year: {row.car_year}
          </div>
        </div>
      ),
    },
    {
      id: "mileage",
      header: "Mileage",
      sortable: true,
      accessor: (row) => (
        <span style={{ fontSize: "var(--font-size-sm)" }}>
          {row.mileage.toLocaleString()} km
        </span>
      ),
    },
    {
      id: "offered_price",
      header: "Asking Price",
      sortable: true,
      accessor: (row) => (
        <strong style={{ fontSize: "var(--font-size-sm)", color: "var(--accent-text)" }}>
          {row.offered_price ? `${row.offered_price.toLocaleString()} BDT` : "Negotiable"}
        </strong>
      ),
    },
    {
      id: "photos",
      header: "Photos",
      accessor: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          <Images size={14} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "var(--font-size-xs)" }}>
            {row.inventory_images?.length || 0}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={() => openDetailDrawer(row)}>
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
                setDeletingSellCar(row);
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
        searchPlaceholder="Search submissions by customer name, phone, car name, or model..."
      />

      <DataTable
        data={initialSellCars}
        columns={columns}
        identifyingColumnIndex={0}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Edit Submission Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Submission Details"
        position="right"
        size="sm"
      >
        {editItem && (
          <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <FormField label="Customer Name" required error={editErrors.name}>
              <Input
                name="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={100}
                required
              />
            </FormField>

            <FormField label="Phone Number" required error={editErrors.phone}>
              <Input
                name="phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                maxLength={18}
                required
              />
            </FormField>

            <FormField label="Car Name" required error={editErrors.car_name}>
              <Input
                name="car_name"
                value={editCarName}
                onChange={(e) => setEditCarName(e.target.value)}
                maxLength={100}
                required
              />
            </FormField>

            <FormField label="Car Model" required error={editErrors.car_model}>
              <Input
                name="car_model"
                value={editCarModel}
                onChange={(e) => setEditCarModel(e.target.value)}
                maxLength={100}
                required
              />
            </FormField>

            <FormField label="Car Year" required error={editErrors.car_year}>
              <Input
                name="car_year"
                value={editCarYear}
                onChange={(e) => setEditCarYear(e.target.value)}
                maxLength={100}
                required
              />
            </FormField>

            <FormField label="Mileage (km)" required error={editErrors.mileage}>
              <Input
                name="mileage"
                type="number"
                min="0"
                value={editMileage}
                onChange={(e) => setEditMileage(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Asking Price (BDT)" error={editErrors.offered_price} description="Optional offered price in BDT">
              <Input
                name="offered_price"
                type="number"
                min="0"
                value={editOfferedPrice}
                onChange={(e) => setEditOfferedPrice(e.target.value)}
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

      {/* Submission Detail Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailItem ? `Submission #${detailItem.id}` : "Submission Details"}
        position="right"
        size="md"
      >
        {detailItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)" }}>
              <h3 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-md)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <User size={16} style={{ color: "var(--accent)" }} /> Submitter Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
                <span className="muted">Name:</span>
                <strong>{detailItem.name}</strong>

                <span className="muted">Phone:</span>
                <span>
                  <a href={`tel:${detailItem.phone}`} style={{ color: "var(--accent-text)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Phone size={13} /> {detailItem.phone}
                  </a>
                </span>
              </div>
            </div>

            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)" }}>
              <h3 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-md)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <Car size={16} style={{ color: "var(--accent)" }} /> Submitted Vehicle
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
                <span className="muted">Vehicle:</span>
                <strong>{detailItem.car_name} {detailItem.car_model}</strong>

                <span className="muted">Model Year:</span>
                <span>
                  <Calendar size={13} style={{ display: "inline-block", marginRight: "4px", verticalAlign: "middle" }} />
                  {detailItem.car_year}
                </span>

                <span className="muted">Mileage:</span>
                <span>
                  <Gauge size={13} style={{ display: "inline-block", marginRight: "4px", verticalAlign: "middle" }} />
                  {detailItem.mileage.toLocaleString()} km
                </span>

                <span className="muted">Asking Price:</span>
                <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>
                  <DollarSign size={13} style={{ display: "inline-block", marginRight: "2px", verticalAlign: "middle" }} />
                  {detailItem.offered_price ? `${detailItem.offered_price.toLocaleString()} BDT` : "Negotiable / Unspecified"}
                </span>
              </div>
            </div>

            {/* Photo Gallery Display */}
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)" }}>
              <h3 style={{ margin: "0 0 var(--space-3) 0", fontSize: "var(--font-size-md)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <Images size={16} style={{ color: "var(--accent)" }} /> Uploaded Photos ({detailItem.inventory_images?.length || 0})
              </h3>
              {detailItem.inventory_images && detailItem.inventory_images.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "var(--space-2)" }}>
                  {detailItem.inventory_images.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                        aspectRatio: "4/3",
                        background: "var(--hover)",
                      }}
                    >
                      <img
                        src={img.image}
                        alt={`Photo #${img.id}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => {
                          // Gracefully handle missing media file
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.parentElement?.querySelector(".img-fallback");
                          if (fallback) fallback.setAttribute("style", "display: flex; height: 100%; align-items: center; justify-content: center; font-size: 11px; color: var(--text-muted); text-align: center; padding: 4px;");
                        }}
                      />
                      <div className="img-fallback" style={{ display: "none" }}>
                        Media unavailable
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "2px 4px",
                          background: "rgba(0,0,0,0.6)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img)}
                          aria-label="Enlarge image"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            padding: "2px",
                            display: "inline-flex",
                          }}
                        >
                          <ZoomIn size={14} />
                        </button>
                        {canDeleteImage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            aria-label={`Remove photo #${img.id}`}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ff6b6b",
                              cursor: "pointer",
                              padding: "2px",
                              display: "inline-flex",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                  No photos were attached with this submission.
                </p>
              )}
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
                  Edit Details
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        title={previewImage ? `Photo #${previewImage.id}` : "Photo Preview"}
        description="High resolution inspection"
      >
        {previewImage && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", maxHeight: "65vh" }}>
              <img
                src={previewImage.image}
                alt="Enlarged photo"
                style={{ width: "100%", maxHeight: "65vh", objectFit: "contain", display: "block" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setPreviewImage(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Sell Car Submission"
        description="Permanently delete this customer vehicle submission and attached photos."
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to delete the submission from <strong>{deletingSellCar?.name}</strong> ({deletingSellCar?.car_name} {deletingSellCar?.car_model})?
        </p>
        <p className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "var(--space-2)" }}>
          Notice: This removes the submission and associated photo records from the database.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteSubmitting}>
            {deleteSubmitting ? "Deleting..." : "Delete Submission"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
