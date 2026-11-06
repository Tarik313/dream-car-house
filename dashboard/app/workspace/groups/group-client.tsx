"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Plus, Search, Edit2, Trash2, Eye, X, AlertCircle } from "lucide-react";
import type { GroupItem, PermissionItem, DashboardUser } from "@/lib/types";
import { createGroupAction, updateGroupAction, deleteGroupAction } from "@/app/actions/inventory";

export function GroupsClient({
  initialItems,
  totalRows,
  currentPage,
  pageSize,
  q,
  allPermissions,
  user,
}: {
  initialItems: GroupItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  allPermissions: PermissionItem[];
  user: DashboardUser;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canAdd = user.is_superuser || user.permissions.includes("auth.add_group");
  const canChange = user.is_superuser || user.permissions.includes("auth.change_group");
  const canDelete = user.is_superuser || user.permissions.includes("auth.delete_group");

  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
  const [editingGroup, setEditingGroup] = useState<GroupItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<GroupItem | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [permFilter, setPermFilter] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.ceil(totalRows / pageSize) || 1;

  function updateQuery(newQ: string, page = 1) {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (page > 1) params.set("page", String(page));
    startTransition(() => {
      router.push(`/workspace/groups?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery(searchQuery, 1);
  }

  function openCreate() {
    setIsCreating(true);
    setEditingGroup(null);
    setFormName("");
    setSelectedPermIds([]);
    setFormError(null);
    setPermFilter("");
  }

  function openEdit(group: GroupItem) {
    setIsCreating(false);
    setEditingGroup(group);
    setFormName(group.name);
    setSelectedPermIds(group.permission_ids || []);
    setFormError(null);
    setPermFilter("");
  }

  function togglePermission(id: number) {
    if (selectedPermIds.includes(id)) {
      setSelectedPermIds(selectedPermIds.filter((p) => p !== id));
    } else {
      setSelectedPermIds([...selectedPermIds, id]);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    const fd = new FormData();
    fd.set("name", formName.trim());
    fd.set("permission_ids", JSON.stringify(selectedPermIds));

    let res;
    if (isCreating) {
      res = await createGroupAction(fd);
    } else if (editingGroup) {
      res = await updateGroupAction(editingGroup.id, fd);
    }

    setActionLoading(false);

    if (res && !res.ok) {
      const err = res.error;
      if (err.fieldErrors?.name) {
        const val = err.fieldErrors.name;
        setFormError(Array.isArray(val) ? val.join(" ") : String(val));
      } else {
        setFormError(err.message || "Operation failed.");
      }
      return;
    }

    setIsCreating(false);
    setEditingGroup(null);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deletingGroup) return;
    setActionLoading(true);
    const res = await deleteGroupAction(deletingGroup.id);
    setActionLoading(false);
    if (!res.ok) {
      alert(res.error.message || "Failed to delete group.");
      return;
    }
    setDeletingGroup(null);
    router.refresh();
  }

  const filteredPermissions = allPermissions.filter((p) => {
    if (!permFilter.trim()) return true;
    const term = permFilter.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.codename.toLowerCase().includes(term) ||
      p.app_label.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Top Filter and Actions Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "var(--space-2)", flex: 1, maxWidth: "400px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Search groups by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ width: "100%", paddingLeft: "var(--space-6)" }}
            />
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "var(--space-2)",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
              }}
            />
          </div>
          <button type="submit" className="button button--secondary" disabled={isPending}>
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {canAdd && (
            <button
              type="button"
              className="button button--primary"
              onClick={openCreate}
              style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
            >
              <Plus size={16} /> New Group
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", width: "240px" }}>Group Name</th>
              <th style={{ textAlign: "center", width: "120px" }}>Members</th>
              <th style={{ textAlign: "center", width: "140px" }}>Permissions</th>
              <th style={{ textAlign: "right", width: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "var(--space-6)" }} className="muted">
                  No user groups found.
                </td>
              </tr>
            ) : (
              initialItems.map((group) => (
                <tr key={group.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <ShieldCheck size={16} style={{ color: "var(--accent)" }} />
                      <span>{group.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="badge badge--neutral">{group.user_count} users</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="badge badge--info">{group.permission_ids?.length || 0} perms</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "var(--space-1)" }}>
                      <button
                        type="button"
                        className="button button--ghost"
                        title="View Group Details"
                        onClick={() => setSelectedGroup(group)}
                        style={{ padding: "var(--space-1)" }}
                      >
                        <Eye size={16} />
                      </button>
                      {canChange && (
                        <button
                          type="button"
                          className="button button--ghost"
                          title="Edit Group"
                          onClick={() => openEdit(group)}
                          style={{ padding: "var(--space-1)" }}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className="button button--ghost"
                          title="Delete Group"
                          onClick={() => setDeletingGroup(group)}
                          style={{ padding: "var(--space-1)", color: "var(--danger)" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)" }}>
          <span className="muted" style={{ fontSize: "var(--font-size-sm)" }}>
            Page {currentPage} of {totalPages} ({totalRows} total groups)
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              type="button"
              className="button button--secondary"
              disabled={currentPage <= 1 || isPending}
              onClick={() => updateQuery(searchQuery, currentPage - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => updateQuery(searchQuery, currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedGroup && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-md)",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-4)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <ShieldCheck size={20} style={{ color: "var(--accent)" }} />
                Group: {selectedGroup.name}
              </h3>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setSelectedGroup(null)}
                style={{ padding: "var(--space-1)" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "var(--space-4)", overflowY: "auto", flex: 1 }}>
              <div style={{ marginBottom: "var(--space-3)" }}>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>MEMBERS</span>
                <p style={{ margin: "var(--space-1) 0 0 0", fontWeight: 600 }}>{selectedGroup.user_count} assigned accounts</p>
              </div>
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  ASSIGNED PERMISSIONS ({selectedGroup.permissions_details?.length || 0})
                </span>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "var(--space-2)",
                    marginTop: "var(--space-2)",
                  }}
                >
                  {(!selectedGroup.permissions_details || selectedGroup.permissions_details.length === 0) ? (
                    <p className="muted" style={{ fontSize: "var(--font-size-sm)" }}>No permissions assigned.</p>
                  ) : (
                    selectedGroup.permissions_details.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          padding: "var(--space-2)",
                          background: "var(--surface-subtle)",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "var(--font-size-sm)" }}>{p.name}</span>
                        <code style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>
                          {p.app_label}.{p.codename}
                        </code>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div style={{ padding: "var(--space-3) var(--space-4)", borderTop: "1px solid var(--border)", textAlign: "right" }}>
              <button type="button" className="button button--secondary" onClick={() => setSelectedGroup(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Drawer or Modal */}
      {(isCreating || editingGroup) && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-md)",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-4)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ margin: 0 }}>{isCreating ? "Create New Group" : `Edit Group: ${editingGroup?.name}`}</h3>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setIsCreating(false);
                  setEditingGroup(null);
                }}
                style={{ padding: "var(--space-1)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "hidden" }}>
              <div style={{ padding: "var(--space-4)", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {formError && (
                  <div className="state state--error" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2)" }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="group_name" style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                    Group Name <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    id="group_name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g. Content Editors, Inventory Managers"
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-1)" }}>
                    <label style={{ fontWeight: 600 }}>Assign Permissions ({selectedPermIds.length} selected)</label>
                    <button
                      type="button"
                      className="button button--ghost"
                      style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-1)" }}
                      onClick={() => {
                        if (selectedPermIds.length === allPermissions.length) {
                          setSelectedPermIds([]);
                        } else {
                          setSelectedPermIds(allPermissions.map((p) => p.id));
                        }
                      }}
                    >
                      {selectedPermIds.length === allPermissions.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Filter available permissions..."
                    value={permFilter}
                    onChange={(e) => setPermFilter(e.target.value)}
                    className="input"
                    style={{ width: "100%", marginBottom: "var(--space-2)" }}
                  />

                  <div
                    style={{
                      maxHeight: "260px",
                      overflowY: "auto",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "var(--space-2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-1)",
                    }}
                  >
                    {filteredPermissions.length === 0 ? (
                      <p className="muted" style={{ padding: "var(--space-2)", textAlign: "center" }}>
                        No matching permissions.
                      </p>
                    ) : (
                      filteredPermissions.map((p) => {
                        const checked = selectedPermIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-2)",
                              padding: "var(--space-1) var(--space-2)",
                              borderRadius: "var(--radius-sm)",
                              background: checked ? "var(--surface-subtle)" : "transparent",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(p.id)}
                            />
                            <span style={{ fontSize: "var(--font-size-sm)", flex: 1 }}>{p.name}</span>
                            <code style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>
                              {p.app_label}.{p.codename}
                            </code>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "var(--space-2)",
                }}
              >
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingGroup(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="button button--primary" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : isCreating ? "Create Group" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingGroup && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-md)",
              width: "100%",
              maxWidth: "460px",
              padding: "var(--space-4)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h3 style={{ margin: "0 0 var(--space-2) 0", color: "var(--danger)" }}>Delete Group</h3>
            <p style={{ margin: "0 0 var(--space-4) 0", fontSize: "var(--font-size-sm)" }}>
              Are you sure you want to delete the group <strong>{deletingGroup.name}</strong>?
              {deletingGroup.user_count > 0 && (
                <span style={{ display: "block", marginTop: "var(--space-2)", color: "var(--warning)" }}>
                  Warning: {deletingGroup.user_count} user accounts currently belong to this group. Deleting it will remove these permissions from members.
                </span>
              )}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setDeletingGroup(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
