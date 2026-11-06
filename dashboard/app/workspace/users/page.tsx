import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getUsers, getGroups, getPermissions } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { UsersClient } from "./user-client";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    is_staff?: string;
    is_active?: string;
    group?: string;
    page?: string;
    page_size?: string;
  }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/users");
    }
    return (
      <>
        <PageHeader href="/workspace/users" description="User Accounts" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const [usersRes, groupsRes, permsRes] = await Promise.all([
    getUsers({
      q: sp.q,
      is_staff: sp.is_staff,
      is_active: sp.is_active,
      group: sp.group,
      page: sp.page,
      page_size: sp.page_size,
    }),
    getGroups({ page_size: 100 }),
    getPermissions(),
  ]);

  if (!usersRes.ok) {
    return (
      <>
        <PageHeader href="/workspace/users" description="User Accounts" />
        <State title="Failed to Load Users" tone="error">
          <p>{usersRes.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = usersRes.data;
  const availableGroups = groupsRes.ok ? groupsRes.data.results : [];
  const availablePermissions = permsRes.ok ? permsRes.data : [];

  return (
    <>
      <PageHeader
        href="/workspace/users"
        description="Django staff accounts, group assignments, permissions, and credential management."
      />
      <UsersClient
        initialItems={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        isStaffFilter={sp.is_staff || ""}
        isActiveFilter={sp.is_active || ""}
        groupFilter={sp.group || ""}
        availableGroups={availableGroups}
        availablePermissions={availablePermissions}
        currentUser={access.data.user}
      />
    </>
  );
}
