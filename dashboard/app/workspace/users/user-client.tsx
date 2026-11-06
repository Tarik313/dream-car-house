"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  AlertCircle,
  Key,
} from "lucide-react";
import type { UserListItem, GroupItem, PermissionItem, DashboardUser } from "@/lib/types";
import { createUserAction, updateUserAction, deleteUserAction } from "@/app/actions/inventory";

export function UsersClient({
  initialItems,
  totalRows,
  currentPage,
  pageSize,
  q,
  isStaffFilter,
  isActiveFilter,
  groupFilter,
  availableGroups,
  availablePermissions,
  currentUser,
}: {
  initialItems: UserListItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  isStaffFilter: string;
  isActiveFilter: string;
  groupFilter: string;
  availableGroups: GroupItem[];
  availablePermissions: PermissionItem[];
  currentUser: DashboardUser;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canAdd = currentUser.is_superuser || currentUser.permissions.includes("auth.add_user");
  const canChange = currentUser.is_superuser || currentUser.permissions.includes("auth.change_user");
  const canDelete = currentUser.is_superuser || currentUser.permissions.includes("auth.delete_user");
  const isSuperuser = currentUser.is_superuser;

  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedStaff, setSelectedStaff] = useState(isStaffFilter);
  const [selectedActive, setSelectedActive] = useState(isActiveFilter);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(groupFilter);

  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);

  // Form states
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formIsStaff, setFormIsStaff] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsSuperuser, setFormIsSuperuser] = useState(false);
  const [formGroupIds, setFormGroupIds] = useState<number[]>([]);
  const [formPermIds, setFormPermIds] = useState<number[]>([]);
  const [permFilter, setPermFilter] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.ceil(totalRows / pageSize) || 1;

  function updateQuery(opts?: { q?: string; is_staff?: string; is_active?: string; group?: string; page?: number }) {
    const params = new URLSearchParams();
    const newQ = opts?.q !== undefined ? opts.q : searchQuery;
    const newStaff = opts?.is_staff !== undefined ? opts.is_staff : selectedStaff;
    const newActive = opts?.is_active !== undefined ? opts.is_active : selectedActive;
    const newGroup = opts?.group !== undefined ? opts.group : selectedGroupFilter;
    const newPage = opts?.page !== undefined ? opts.page : 1;

    if (newQ.trim()) params.set("q", newQ.trim());
    if (newStaff) params.set("is_staff", newStaff);
    if (newActive) params.set("is_active", newActive);
    if (newGroup) params.set("group", newGroup);
    if (newPage > 1) params.set("page", String(newPage));

    startTransition(() => {
      router.push(`/workspace/users?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ page: 1 });
  }

  function openCreate() {
    setIsCreating(true);
    setEditingUser(null);
    setFormUsername("");
    setFormEmail("");
    setFormFirstName("");
    setFormLastName("");
    setFormPassword("");
    setFormIsStaff(true);
    setFormIsActive(true);
    setFormIsSuperuser(false);
    setFormGroupIds([]);
    setFormPermIds([]);
    setPermFilter("");
    setFormError(null);
  }

  function openEdit(user: UserListItem) {
    setIsCreating(false);
    setEditingUser(user);
    setFormUsername(user.username);
    setFormEmail(user.email || "");
    setFormFirstName(user.first_name || "");
    setFormLastName(user.last_name || "");
    setFormPassword(""); // Never prefill passwords
    setFormIsStaff(user.is_staff);
    setFormIsActive(user.is_active);
    setFormIsSuperuser(user.is_superuser);

    // Map group names to group IDs
    const matchedGroupIds = availableGroups
      .filter((g) => user.groups?.includes(g.name))
      .map((g) => g.id);
    setFormGroupIds(matchedGroupIds);
    setFormPermIds([]);
    setPermFilter("");
    setFormError(null);
  }

  function toggleGroup(id: number) {
    if (formGroupIds.includes(id)) {
      setFormGroupIds(formGroupIds.filter((g) => g !== id));
    } else {
      setFormGroupIds([...formGroupIds, id]);
    }
  }

  function togglePermission(id: number) {
    if (formPermIds.includes(id)) {
      setFormPermIds(formPermIds.filter((p) => p !== id));
    } else {
      setFormPermIds([...formPermIds, id]);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    const fd = new FormData();
    fd.set("username", formUsername.trim());
    fd.set("email", formEmail.trim());
    fd.set("first_name", formFirstName.trim());
    fd.set("last_name", formLastName.trim());
    if (formPassword.trim()) {
      fd.set("password", formPassword.trim());
    }
    fd.set("is_staff", String(formIsStaff));
    fd.set("is_active", String(formIsActive));
    if (isSuperuser) {
      fd.set("is_superuser", String(formIsSuperuser));
    }
    fd.set("group_ids", JSON.stringify(formGroupIds));
    if (formPermIds.length > 0) {
      fd.set("permission_ids", JSON.stringify(formPermIds));
    }

    let res;
    if (isCreating) {
      res = await createUserAction(fd);
    } else if (editingUser) {
      res = await updateUserAction(editingUser.id, fd);
    }

    setActionLoading(false);

    if (res && !res.ok) {
      const err = res.error;
      if (err.fieldErrors) {
        const msgs = Object.entries(err.fieldErrors)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(" ") : String(m)}`)
          .join(" | ");
        setFormError(msgs);
      } else {
        setFormError(err.message || "Failed to save user account.");
      }
      return;
    }

    setIsCreating(false);
    setEditingUser(null);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deletingUser) return;
    setActionLoading(true);
    const res = await deleteUserAction(deletingUser.id);
    setActionLoading(false);

    if (!res.ok) {
      alert(res.error.message || "Failed to delete user.");
      return;
    }

    setDeletingUser(null);
    router.refresh();
  }

  const filteredPermissions = availablePermissions.filter((p) => {
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
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "var(--space-2)", flex: 1, flexWrap: "wrap", maxWidth: "800px" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <input
              type="text"
              placeholder="Search username, name, email..."
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

          <select
            className="input"
            value={selectedStaff}
            onChange={(e) => {
              setSelectedStaff(e.target.value);
              updateQuery({ is_staff: e.target.value, page: 1 });
            }}
          >
            <option value="">All Staff Roles</option>
            <option value="true">Staff Members</option>
            <option value="false">Non-Staff</option>
          </select>

          <select
            className="input"
            value={selectedActive}
            onChange={(e) => {
              setSelectedActive(e.target.value);
              updateQuery({ is_active: e.target.value, page: 1 });
            }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive</option>
          </select>

          {availableGroups.length > 0 && (
            <select
              className="input"
              value={selectedGroupFilter}
              onChange={(e) => {
                setSelectedGroupFilter(e.target.value);
                updateQuery({ group: e.target.value, page: 1 });
              }}
            >
              <option value="">All Groups</option>
              {availableGroups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          )}

          <button type="submit" className="button button--secondary" disabled={isPending}>
            Filter
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
              <Plus size={16} /> New User
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", width: "200px" }}>Account</th>
              <th style={{ textAlign: "left", width: "220px" }}>Full Name & Email</th>
              <th style={{ textAlign: "center", width: "110px" }}>Staff Role</th>
              <th style={{ textAlign: "center", width: "110px" }}>Status</th>
              <th style={{ textAlign: "left", width: "200px" }}>Assigned Groups</th>
              <th style={{ textAlign: "right", width: "140px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "var(--space-6)" }} className="muted">
                  No user accounts found.
                </td>
              </tr>
            ) : (
              initialItems.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        {u.is_superuser ? (
                          <ShieldAlert size={16} style={{ color: "var(--danger)" }} />
                        ) : u.is_staff ? (
                          <Shield size={16} style={{ color: "var(--accent)" }} />
                        ) : (
                          <Users size={16} style={{ color: "var(--muted)" }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.username}</div>
                          {isSelf && (
                            <span className="badge badge--neutral" style={{ fontSize: "10px" }}>
                              Current session
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {u.first_name || u.last_name ? (
                          <div style={{ fontWeight: 500 }}>
                            {u.first_name} {u.last_name}
                          </div>
                        ) : (
                          <span className="muted" style={{ fontStyle: "italic" }}>
                            No name set
                          </span>
                        )}
                        <div className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                          {u.email || "No email"}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {u.is_superuser ? (
                        <span className="badge badge--danger">Superuser</span>
                      ) : u.is_staff ? (
                        <span className="badge badge--info">Staff</span>
                      ) : (
                        <span className="badge badge--neutral">Regular</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {u.is_active ? (
                        <span className="badge badge--success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <UserCheck size={12} /> Active
                        </span>
                      ) : (
                        <span className="badge badge--warning" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <UserX size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      {u.groups && u.groups.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {u.groups.map((g) => (
                            <span key={g} className="badge badge--neutral" style={{ fontSize: "11px" }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                          None
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "var(--space-1)" }}>
                        <button
                          type="button"
                          className="button button--ghost"
                          title="View Details"
                          onClick={() => setSelectedUser(u)}
                          style={{ padding: "var(--space-1)" }}
                        >
                          <Eye size={16} />
                        </button>
                        {canChange && (!u.is_superuser || isSuperuser) && (
                          <button
                            type="button"
                            className="button button--ghost"
                            title="Edit Account"
                            onClick={() => openEdit(u)}
                            style={{ padding: "var(--space-1)" }}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {canDelete && !isSelf && (
                          <button
                            type="button"
                            className="button button--ghost"
                            title="Delete Account"
                            onClick={() => setDeletingUser(u)}
                            style={{ padding: "var(--space-1)", color: "var(--danger)" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)" }}>
          <span className="muted" style={{ fontSize: "var(--font-size-sm)" }}>
            Page {currentPage} of {totalPages} ({totalRows} total users)
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              type="button"
              className="button button--secondary"
              disabled={currentPage <= 1 || isPending}
              onClick={() => updateQuery({ page: currentPage - 1 })}
            >
              Previous
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => updateQuery({ page: currentPage + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedUser && (
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
              maxWidth: "580px",
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
                <Users size={20} style={{ color: "var(--accent)" }} />
                User: {selectedUser.username}
              </h3>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setSelectedUser(null)}
                style={{ padding: "var(--space-1)" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "var(--space-4)", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>FULL NAME</span>
                  <p style={{ margin: "var(--space-1) 0 0 0", fontWeight: 600 }}>
                    {selectedUser.first_name} {selectedUser.last_name || "—"}
                  </p>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>EMAIL</span>
                  <p style={{ margin: "var(--space-1) 0 0 0", fontWeight: 600 }}>{selectedUser.email || "—"}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>IS ACTIVE</span>
                  <p style={{ margin: "var(--space-1) 0 0 0" }}>{selectedUser.is_active ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>STAFF ROLE</span>
                  <p style={{ margin: "var(--space-1) 0 0 0" }}>{selectedUser.is_staff ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>SUPERUSER</span>
                  <p style={{ margin: "var(--space-1) 0 0 0" }}>{selectedUser.is_superuser ? "Yes" : "No"}</p>
                </div>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>ASSIGNED GROUPS</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", marginTop: "var(--space-1)" }}>
                  {selectedUser.groups && selectedUser.groups.length > 0 ? (
                    selectedUser.groups.map((g) => (
                      <span key={g} className="badge badge--neutral">
                        {g}
                      </span>
                    ))
                  ) : (
                    <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: 0 }}>
                      No groups assigned.
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>DATE JOINED</span>
                  <p style={{ margin: "var(--space-1) 0 0 0", fontSize: "var(--font-size-sm)" }}>
                    {selectedUser.date_joined ? new Date(selectedUser.date_joined).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>LAST LOGIN</span>
                  <p style={{ margin: "var(--space-1) 0 0 0", fontSize: "var(--font-size-sm)" }}>
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "Never"}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: "var(--space-3) var(--space-4)", borderTop: "1px solid var(--border)", textAlign: "right" }}>
              <button type="button" className="button button--secondary" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {(isCreating || editingUser) && (
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
              <h3 style={{ margin: 0 }}>{isCreating ? "Create New User Account" : `Edit Account: ${editingUser?.username}`}</h3>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setIsCreating(false);
                  setEditingUser(null);
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                  <div>
                    <label htmlFor="user_username" style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                      Username <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      id="user_username"
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="user_email" style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                      Email Address
                    </label>
                    <input
                      id="user_email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="input"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                  <div>
                    <label htmlFor="user_fn" style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                      First Name
                    </label>
                    <input
                      id="user_fn"
                      type="text"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="user_ln" style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                      Last Name
                    </label>
                    <input
                      id="user_ln"
                      type="text"
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="input"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="user_pw" style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                    {isCreating ? "Password" : "Change Password (leave empty to keep unchanged)"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="user_pw"
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="input"
                      style={{ width: "100%", paddingLeft: "var(--space-6)" }}
                      placeholder={isCreating ? "Minimum 8 characters..." : "••••••••"}
                      autoComplete="new-password"
                    />
                    <Key
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
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                    Passwords are securely salted and hashed by Django. Never stored in plain text.
                  </span>
                </div>

                <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "var(--space-2)" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                    />
                    <span style={{ fontWeight: 600 }}>Active</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formIsStaff}
                      onChange={(e) => setFormIsStaff(e.target.checked)}
                    />
                    <span style={{ fontWeight: 600 }}>Staff Status</span>
                  </label>

                  {isSuperuser && (
                    <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formIsSuperuser}
                        onChange={(e) => setFormIsSuperuser(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600, color: "var(--danger)" }}>Superuser (Full System Access)</span>
                    </label>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                    Assigned Groups ({formGroupIds.length} selected)
                  </label>
                  <div
                    style={{
                      maxHeight: "140px",
                      overflowY: "auto",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "var(--space-2)",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "var(--space-2)",
                    }}
                  >
                    {availableGroups.length === 0 ? (
                      <span className="muted" style={{ padding: "var(--space-2)" }}>
                        No groups created yet.
                      </span>
                    ) : (
                      availableGroups.map((g) => {
                        const checked = formGroupIds.includes(g.id);
                        return (
                          <label
                            key={g.id}
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
                              onChange={() => toggleGroup(g.id)}
                            />
                            <span style={{ fontSize: "var(--font-size-sm)" }}>{g.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-1)" }}>
                    <label style={{ fontWeight: 600 }}>Direct User Permissions ({formPermIds.length} selected)</label>
                    <button
                      type="button"
                      className="button button--ghost"
                      style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-1)" }}
                      onClick={() => {
                        if (formPermIds.length === availablePermissions.length) {
                          setFormPermIds([]);
                        } else {
                          setFormPermIds(availablePermissions.map((p) => p.id));
                        }
                      }}
                    >
                      {formPermIds.length === availablePermissions.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Filter permissions..."
                    value={permFilter}
                    onChange={(e) => setPermFilter(e.target.value)}
                    className="input"
                    style={{ width: "100%", marginBottom: "var(--space-2)" }}
                  />

                  <div
                    style={{
                      maxHeight: "160px",
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
                      <span className="muted" style={{ padding: "var(--space-2)", textAlign: "center" }}>
                        No permissions found.
                      </span>
                    ) : (
                      filteredPermissions.map((p) => {
                        const checked = formPermIds.includes(p.id);
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
                    setEditingUser(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="button button--primary" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : isCreating ? "Create Account" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingUser && (
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
            <h3 style={{ margin: "0 0 var(--space-2) 0", color: "var(--danger)" }}>Delete User Account</h3>
            <p style={{ margin: "0 0 var(--space-4) 0", fontSize: "var(--font-size-sm)" }}>
              Are you sure you want to permanently delete the account <strong>{deletingUser.username}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setDeletingUser(null)}
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
