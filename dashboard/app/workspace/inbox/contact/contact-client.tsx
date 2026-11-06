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
  updateContactMessageAction,
  deleteContactMessageAction,
} from "@/app/actions/inventory";
import type { ContactMessageItem } from "@/lib/types";

export function ContactInboxClient({
  initialMessages,
  totalRows,
  currentPage,
  pageSize,
  q,
  topicFilter,
  preferredContactFilter,
  ordering = "",
  userPermissions = [],
}: {
  initialMessages: ContactMessageItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  topicFilter: string;
  preferredContactFilter: string;
  ordering?: string;
  userPermissions?: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_contactmessage");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("home.delete_contactmessage");

  // Drawers and dialogs
  const [activeMessage, setActiveMessage] = useState<ContactMessageItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form State
  const [editTopic, setEditTopic] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editVehicle, setEditVehicle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editPreferredContact, setEditPreferredContact] = useState("");
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

  function handleOpenDetail(msg: ContactMessageItem) {
    setActiveMessage(msg);
    setDetailOpen(true);
  }

  function handleOpenEdit(msg: ContactMessageItem) {
    setActiveMessage(msg);
    setEditTopic(msg.topic);
    setEditName(msg.name);
    setEditPhone(msg.phone);
    setEditEmail(msg.email || "");
    setEditVehicle(msg.vehicle || "");
    setEditMessage(msg.message || "");
    setEditPreferredContact(msg.preferred_contact);
    setErrors({});
    setEditOpen(true);
  }

  function handleOpenDelete(msg: ContactMessageItem) {
    setActiveMessage(msg);
    setDeleteDialogOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeMessage) return;

    const newErrors: Record<string, string> = {};
    if (!editName.trim()) newErrors.name = "Customer name is required.";
    if (!editPhone.trim()) newErrors.phone = "Phone number is required.";
    if (!editMessage.trim()) newErrors.message = "Message text is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    const res = await updateContactMessageAction(activeMessage.id, {
      topic: editTopic,
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      vehicle: editVehicle.trim(),
      message: editMessage.trim(),
      preferred_contact: editPreferredContact,
    });

    setSubmitting(false);

    if (!res.ok) {
      showToast(res.error.message || "Failed to update contact message.", "error");
    } else {
      showToast(`Contact message #${activeMessage.id} updated successfully.`, "success");
      setEditOpen(false);
      setActiveMessage(res.data);
      router.refresh();
    }
  }

  async function handleConfirmDelete() {
    if (!activeMessage) return;

    setSubmitting(true);
    const res = await deleteContactMessageAction(activeMessage.id);
    setSubmitting(false);

    if (!res.ok) {
      showToast(res.error.message || "Failed to delete message.", "error");
    } else {
      showToast(`Contact message from ${activeMessage.name} deleted.`, "success");
      setDeleteDialogOpen(false);
      setDetailOpen(false);
      setActiveMessage(null);
      router.refresh();
    }
  }

  const columns: ColumnDef<ContactMessageItem>[] = [
    {
      id: "name",
      header: "Customer",
      isIdentifying: true,
      sortable: true,
      accessor: (msg) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(msg)}
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
          {msg.name}
        </button>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      sortable: true,
      accessor: (msg) => (
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text)" }}>
          {msg.phone}
        </span>
      ),
    },
    {
      id: "topic",
      header: "Topic / Interest",
      sortable: true,
      accessor: (msg) => (
        <span
          className="badge"
          style={{
            background: "var(--surface-raised, rgba(255,255,255,0.05))",
            border: "1px solid var(--border)",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          {msg.topic_display || msg.topic}
        </span>
      ),
    },
    {
      id: "vehicle",
      header: "Vehicle",
      sortable: true,
      accessor: (msg) => (
        <span style={{ fontSize: "var(--font-size-sm)" }}>
          {msg.vehicle ? msg.vehicle : <span className="muted">—</span>}
        </span>
      ),
    },
    {
      id: "message",
      header: "Message Snippet",
      accessor: (msg) => (
        <span
          className="muted"
          style={{
            fontSize: "var(--font-size-xs)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            maxWidth: "320px",
            whiteSpace: "normal",
          }}
          title={msg.message}
        >
          {msg.message}
        </span>
      ),
    },
    {
      id: "preferred_contact",
      header: "Preferred Reach",
      sortable: true,
      accessor: (msg) => (
        <span style={{ fontSize: "var(--font-size-xs)" }}>
          {msg.preferred_contact_display || msg.preferred_contact}
        </span>
      ),
    },
    {
      id: "created_at",
      header: "Received",
      sortable: true,
      accessor: (msg) => (
        <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
          {new Date(msg.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (msg) => (
        <div style={{ display: "flex", gap: "var(--space-1)", justifyContent: "flex-end" }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDetail(msg)}
            aria-label={`View message from ${msg.name}`}
          >
            Detail
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenEdit(msg)}
              aria-label={`Edit message from ${msg.name}`}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(msg)}
              aria-label={`Delete message from ${msg.name}`}
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
          className="button button--primary"
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
          className="button button--ghost"
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
          searchPlaceholder="Search by name, phone, email, vehicle, or message snippet..."
        />

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center" }}>
          {/* Topic Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
            <label htmlFor="topic-filter" className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
              Topic:
            </label>
            <select
              id="topic-filter"
              value={topicFilter}
              onChange={(e) => updateParams({ topic: e.target.value })}
              className="input input--sm"
              style={{ fontSize: "var(--font-size-xs)", width: "auto" }}
            >
              <option value="">All Topics</option>
              <option value="BUYING">Buying a car</option>
              <option value="SELLING">Selling my car</option>
              <option value="AFTER_SALES">After-sales & service</option>
              <option value="OTHER">Something else</option>
            </select>
          </div>

          {/* Preferred Reach Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
            <label htmlFor="reach-filter" className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
              Preferred Reach:
            </label>
            <select
              id="reach-filter"
              value={preferredContactFilter}
              onChange={(e) => updateParams({ preferred_contact: e.target.value })}
              className="input input--sm"
              style={{ fontSize: "var(--font-size-xs)", width: "auto" }}
            >
              <option value="">All Channels</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PHONE">Phone call</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>

          {/* Ordering */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
            <label htmlFor="order-filter" className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
              Sort:
            </label>
            <select
              id="order-filter"
              value={ordering}
              onChange={(e) => updateParams({ ordering: e.target.value })}
              className="input input--sm"
              style={{ fontSize: "var(--font-size-xs)", width: "auto" }}
            >
              <option value="">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="name">Customer Name (A-Z)</option>
              <option value="-name">Customer Name (Z-A)</option>
              <option value="topic">Topic</option>
            </select>
          </div>

          {(q || topicFilter || preferredContactFilter || ordering) && (
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
        data={initialMessages}
        identifyingColumnIndex={0}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => updateParams({ page })}
      />

      {/* Detail Slide-over Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={activeMessage ? `Message from ${activeMessage.name}` : "Message Details"}
      >
        {activeMessage && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Full Name
                </span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600 }}>{activeMessage.name}</p>
              </div>
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Phone
                </span>
                <p style={{ margin: "2px 0 0 0", fontFamily: "var(--font-mono)" }}>{activeMessage.phone}</p>
              </div>
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Email
                </span>
                <p style={{ margin: "2px 0 0 0" }}>
                  {activeMessage.email ? activeMessage.email : <span className="muted">Not provided</span>}
                </p>
              </div>
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Preferred Reach
                </span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 500 }}>
                  {activeMessage.preferred_contact_display || activeMessage.preferred_contact}
                </p>
              </div>
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Topic / Interest
                </span>
                <p style={{ margin: "2px 0 0 0" }}>
                  <span
                    className="badge"
                    style={{
                      background: "var(--surface-raised, rgba(255,255,255,0.05))",
                      border: "1px solid var(--border)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {activeMessage.topic_display || activeMessage.topic}
                  </span>
                </p>
              </div>
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Vehicle of Interest
                </span>
                <p style={{ margin: "2px 0 0 0" }}>
                  {activeMessage.vehicle ? activeMessage.vehicle : <span className="muted">None specified</span>}
                </p>
              </div>
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Received At
                </span>
                <p style={{ margin: "2px 0 0 0", fontSize: "var(--font-size-sm)" }}>
                  {new Date(activeMessage.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "var(--font-size-sm)", marginBottom: "var(--space-2)" }}>
                Submitted Customer Message
              </h3>
              <div
                style={{
                  padding: "var(--space-3)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  whiteSpace: "pre-wrap",
                  fontSize: "var(--font-size-sm)",
                  lineHeight: 1.6,
                  color: "var(--foreground)",
                }}
              >
                {activeMessage.message}
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
              {canChange && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDetailOpen(false);
                    handleOpenEdit(activeMessage);
                  }}
                >
                  <Edit size={12} style={{ marginRight: "4px" }} /> Edit Details
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDetailOpen(false);
                    handleOpenDelete(activeMessage);
                  }}
                >
                  <Trash2 size={12} style={{ marginRight: "4px" }} /> Delete Message
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
        title={activeMessage ? `Edit Message #${activeMessage.id}` : "Edit Message"}
      >
        {activeMessage && (
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <FormField label="Full Name" required error={errors.name}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                disabled={submitting}
              />
            </FormField>

            <FormField label="Phone" required error={errors.phone}>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                required
                disabled={submitting}
              />
            </FormField>

            <FormField label="Email" error={errors.email}>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                disabled={submitting}
              />
            </FormField>

            <FormField label="Topic / Interest">
              <select
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                className="input"
                disabled={submitting}
              >
                <option value="BUYING">Buying a car</option>
                <option value="SELLING">Selling my car</option>
                <option value="AFTER_SALES">After-sales & service</option>
                <option value="OTHER">Something else</option>
              </select>
            </FormField>

            <FormField label="Preferred Contact Channel">
              <select
                value={editPreferredContact}
                onChange={(e) => setEditPreferredContact(e.target.value)}
                className="input"
                disabled={submitting}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">Phone call</option>
                <option value="EMAIL">Email</option>
              </select>
            </FormField>

            <FormField label="Vehicle of Interest">
              <Input
                value={editVehicle}
                onChange={(e) => setEditVehicle(e.target.value)}
                placeholder="e.g. 2023 Nissan Patrol"
                disabled={submitting}
              />
            </FormField>

            <FormField label="Customer Message" required error={errors.message}>
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                required
                rows={5}
                className="input"
                style={{ resize: "vertical", fontFamily: "inherit" }}
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
        title="Confirm Message Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: "0 0 var(--space-2) 0", fontWeight: 500 }}>
                Are you sure you want to delete this contact message?
              </p>
              <p className="muted" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                Customer: <strong>{activeMessage?.name}</strong> ({activeMessage?.phone})
              </p>
              <p className="muted" style={{ margin: "var(--space-1) 0 0 0", fontSize: "var(--font-size-xs)" }}>
                This permanently deletes the customer message enquiry from <code>tbl_contact_messages</code>.
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
