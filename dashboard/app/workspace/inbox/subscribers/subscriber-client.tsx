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
  Trash2,
  Edit,
  Mail,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  updateSubscriberAction,
  deleteSubscriberAction,
} from "@/app/actions/inventory";
import type { SubscriberItem } from "@/lib/types";

export function SubscriberClient({
  initialSubscribers,
  totalRows,
  currentPage,
  pageSize,
  q,
  ordering = "",
  userPermissions = [],
}: {
  initialSubscribers: SubscriberItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  ordering?: string;
  userPermissions?: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_subscriber");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("home.delete_subscriber");

  // Drawers and dialogs
  const [activeSubscriber, setActiveSubscriber] = useState<SubscriberItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form State
  const [editEmail, setEditEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateParams(newParams: Record<string, string | number | undefined>) {
    const url = new URL(window.location.href);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === "") {
        url.searchParams.delete(k);
      } else {
        url.searchParams.set(k, String(v));
      }
    });
    if (!("page" in newParams)) {
      url.searchParams.delete("page");
    }
    router.push(url.pathname + url.search);
  }

  function handleOpenDetail(sub: SubscriberItem) {
    setActiveSubscriber(sub);
    setDetailOpen(true);
  }

  function handleOpenEdit(sub: SubscriberItem) {
    setActiveSubscriber(sub);
    setEditEmail(sub.email);
    setErrors({});
    setEditOpen(true);
  }

  function handleOpenDelete(sub: SubscriberItem) {
    setActiveSubscriber(sub);
    setDeleteDialogOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSubscriber) return;

    if (!editEmail.trim()) {
      setErrors({ email: "Email address is required." });
      return;
    }

    setSubmitting(true);
    setErrors({});

    const res = await updateSubscriberAction(activeSubscriber.id, {
      email: editEmail.trim(),
    });

    setSubmitting(false);

    if (!res.ok) {
      showToast(res.error.message || "Failed to update subscriber.", "error");
    } else {
      showToast(`Subscriber #${activeSubscriber.id} updated successfully.`, "success");
      setEditOpen(false);
      setActiveSubscriber(res.data);
      router.refresh();
    }
  }

  async function handleConfirmDelete() {
    if (!activeSubscriber) return;

    setSubmitting(true);
    const res = await deleteSubscriberAction(activeSubscriber.id);
    setSubmitting(false);

    if (!res.ok) {
      showToast(res.error.message || "Failed to delete subscriber.", "error");
    } else {
      showToast(`Subscriber '${activeSubscriber.email}' deleted.`, "success");
      setDeleteDialogOpen(false);
      setDetailOpen(false);
      setActiveSubscriber(null);
      router.refresh();
    }
  }

  const columns: ColumnDef<SubscriberItem>[] = [
    {
      id: "id",
      header: "Subscriber ID",
      sortable: true,
      accessor: (sub) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>
          #{sub.id}
        </span>
      ),
    },
    {
      id: "email",
      header: "Email Address",
      isIdentifying: true,
      sortable: true,
      accessor: (sub) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(sub)}
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
          {sub.email}
        </button>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (sub) => (
        <div style={{ display: "flex", gap: "var(--space-1)", justifyContent: "flex-end" }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDetail(sub)}
            aria-label={`View subscriber ${sub.email}`}
          >
            Detail
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenEdit(sub)}
              aria-label={`Edit subscriber ${sub.email}`}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(sub)}
              aria-label={`Delete subscriber ${sub.email}`}
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
      {/* Inbox Tabs Header */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "var(--space-2)",
        }}
      >
        <Link
          href="/workspace/inbox/contact"
          className="button button--ghost"
          style={{
            fontSize: "var(--font-size-sm)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <Mail size={16} /> Contact Messages
        </Link>
        <Link
          href="/workspace/inbox/subscribers"
          className="button button--primary"
          style={{
            fontSize: "var(--font-size-sm)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <Users size={16} /> Subscribers
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <FilterBar
          searchValue={q}
          onSearchChange={(newQ) => updateParams({ q: newQ })}
          searchPlaceholder="Search by subscriber email address..."
        />

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center" }}>
          {/* Ordering */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
            <label htmlFor="sub-order" className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
              Sort:
            </label>
            <select
              id="sub-order"
              value={ordering}
              onChange={(e) => updateParams({ ordering: e.target.value })}
              className="input input--sm"
              style={{ fontSize: "var(--font-size-xs)", width: "auto" }}
            >
              <option value="">Newest ID</option>
              <option value="id">Oldest ID</option>
              <option value="email">Email (A-Z)</option>
              <option value="-email">Email (Z-A)</option>
            </select>
          </div>

          {(q || ordering) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const url = new URL(window.location.href);
                url.search = "";
                router.push(url.pathname);
              }}
              style={{ fontSize: "var(--font-size-xs)" }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={initialSubscribers}
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
        title={activeSubscriber ? `Subscriber #${activeSubscriber.id}` : "Subscriber Details"}
      >
        {activeSubscriber && (
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
                  Subscriber ID
                </span>
                <p style={{ margin: "2px 0 0 0", fontFamily: "var(--font-mono)" }}>
                  #{activeSubscriber.id}
                </p>
              </div>
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Email Address
                </span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600 }}>{activeSubscriber.email}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
              {canChange && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDetailOpen(false);
                    handleOpenEdit(activeSubscriber);
                  }}
                >
                  <Edit size={12} style={{ marginRight: "4px" }} /> Edit Email
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDetailOpen(false);
                    handleOpenDelete(activeSubscriber);
                  }}
                >
                  <Trash2 size={12} style={{ marginRight: "4px" }} /> Delete Record
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeSubscriber ? `Edit Subscriber #${activeSubscriber.id}` : "Edit Subscriber"}
      >
        {activeSubscriber && (
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <FormField label="Email Address" required error={errors.email}>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                maxLength={32}
                disabled={submitting}
              />
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
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Subscriber Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: "0 0 var(--space-2) 0", fontWeight: 500 }}>
                Are you sure you want to delete this subscriber?
              </p>
              <p className="muted" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                Email: <strong>{activeSubscriber?.email}</strong>
              </p>
              <p className="muted" style={{ margin: "var(--space-1) 0 0 0", fontSize: "var(--font-size-xs)" }}>
                This permanently removes the email entry from <code>tbl_subscribers</code>.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
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
