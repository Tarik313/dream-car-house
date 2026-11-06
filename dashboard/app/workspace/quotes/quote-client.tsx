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
import { Trash2, Edit, Car, User, Mail, Phone, ExternalLink } from "lucide-react";
import { updateQuoteAction, deleteQuoteAction } from "@/app/actions/inventory";
import type { InventoryQuoteItem } from "@/lib/types";

export function QuoteListClient({
  initialQuotes,
  totalRows,
  currentPage,
  pageSize,
  q,
  userPermissions = [],
}: {
  initialQuotes: InventoryQuoteItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  carFilter: string;
  ordering?: string;
  userPermissions?: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange = userPermissions.includes("*") || userPermissions.includes("inventory.change_inventoryquote");
  const canDelete = userPermissions.includes("*") || userPermissions.includes("inventory.delete_inventoryquote");

  // Edit state
  const [editItem, setEditItem] = useState<InventoryQuoteItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Detail state
  const [detailItem, setDetailItem] = useState<InventoryQuoteItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingQuote, setDeletingQuote] = useState<InventoryQuoteItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newQ) params.set("q", newQ);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/workspace/quotes?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`/workspace/quotes?${params.toString()}`);
  };

  const openEditDrawer = (item: InventoryQuoteItem) => {
    setEditErrors({});
    setEditItem(item);
    setEditName(item.name);
    setEditEmail(item.email);
    setEditPhone(item.phone);
    setEditOpen(true);
  };

  const openDetailDrawer = (item: InventoryQuoteItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    setEditSubmitting(true);
    setEditErrors({});

    const res = await updateQuoteAction(editItem.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
    });
    setEditSubmitting(false);

    if (res.ok) {
      showToast("Quote details updated successfully.", "success");
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
      showToast(res.error.message || "Failed to update quote.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingQuote) return;
    setDeleteSubmitting(true);
    const res = await deleteQuoteAction(deletingQuote.id);
    setDeleteSubmitting(false);

    if (res.ok) {
      showToast("Quote enquiry deleted successfully.", "success");
      setDeleteDialogOpen(false);
      setDeletingQuote(null);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to delete quote enquiry.", "error");
    }
  };

  const columns: ColumnDef<InventoryQuoteItem>[] = [
    {
      id: "name",
      header: "Customer Name",
      isIdentifying: true,
      sortable: true,
      accessor: (row) => (
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
      ),
    },
    {
      id: "car",
      header: "Requested Vehicle",
      sortable: true,
      accessor: (row) =>
        row.car ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Link
              href={`/workspace/inventory/${row.car}`}
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--accent-text)",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Car size={14} />
              {row.car_name || `Vehicle #${row.car}`}
            </Link>
          </div>
        ) : (
          <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
            Vehicle removed / unavailable
          </span>
        ),
    },
    {
      id: "email",
      header: "Email",
      sortable: true,
      accessor: (row) => (
        <a
          href={`mailto:${row.email}`}
          style={{ fontSize: "var(--font-size-sm)", color: "var(--text)", textDecoration: "none" }}
        >
          {row.email}
        </a>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      sortable: true,
      accessor: (row) => (
        <a
          href={`tel:${row.phone}`}
          style={{ fontSize: "var(--font-size-sm)", color: "var(--text)", textDecoration: "none" }}
        >
          {row.phone}
        </a>
      ),
    },
    {
      id: "created_at",
      header: "Submitted",
      sortable: true,
      accessor: (row) => (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
          {new Date(row.created_at).toLocaleDateString()}
        </span>
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
                setDeletingQuote(row);
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
        searchPlaceholder="Search quotes by customer name, email, phone, or vehicle..."
      />

      <DataTable
        data={initialQuotes}
        columns={columns}
        identifyingColumnIndex={0}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Edit Quote Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Customer Contact"
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

            <FormField label="Email Address" required error={editErrors.email}>
              <Input
                name="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                maxLength={32}
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

      {/* Quote Detail Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailItem ? `Quote Enquiry #${detailItem.id}` : "Quote Details"}
        position="right"
        size="md"
      >
        {detailItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)" }}>
              <h3 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-md)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <User size={16} style={{ color: "var(--accent)" }} /> Customer Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
                <span className="muted">Name:</span>
                <strong>{detailItem.name}</strong>

                <span className="muted">Email:</span>
                <span>
                  <a href={`mailto:${detailItem.email}`} style={{ color: "var(--accent-text)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Mail size={13} /> {detailItem.email}
                  </a>
                </span>

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
                <Car size={16} style={{ color: "var(--accent)" }} /> Requested Vehicle
              </h3>
              {detailItem.car ? (
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
                  <span className="muted">Vehicle:</span>
                  <span>
                    <Link
                      href={`/workspace/inventory/${detailItem.car}`}
                      style={{ color: "var(--accent-text)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      {detailItem.car_name || `Vehicle #${detailItem.car}`} <ExternalLink size={12} />
                    </Link>
                  </span>

                  {detailItem.car_price && (
                    <>
                      <span className="muted">Price:</span>
                      <strong>{Number(detailItem.car_price).toLocaleString()} BDT</strong>
                    </>
                  )}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                  Associated vehicle was removed or is not available.
                </p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "var(--space-2)", fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
              <span>Submitted:</span>
              <span>{new Date(detailItem.created_at).toLocaleString()}</span>

              <span>Last Updated:</span>
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
                  Edit Contact
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
        title="Delete Customer Quote"
        description="Permanently delete this customer enquiry submission."
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to delete the quote enquiry from <strong>{deletingQuote?.name}</strong>?
        </p>
        <p className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "var(--space-2)" }}>
          Notice: This removes the enquiry record from the database. Vehicle inventory records are not affected.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteSubmitting}>
            {deleteSubmitting ? "Deleting..." : "Delete Quote"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
