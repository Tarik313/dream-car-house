import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getGroups, getPermissions } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { GroupsClient } from "./group-client";

export const dynamic = "force-dynamic";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    page_size?: string;
  }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/groups");
    }
    return (
      <>
        <PageHeader href="/workspace/groups" description="User Groups" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const [res, permsRes] = await Promise.all([
    getGroups({
      q: sp.q,
      page: sp.page,
      page_size: sp.page_size,
    }),
    getPermissions(),
  ]);

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/groups" description="User Groups" />
        <State title="Failed to Load Groups" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;
  const allPermissions = permsRes.ok ? permsRes.data : [];

  return (
    <>
      <PageHeader
        href="/workspace/groups"
        description="Role-based permission groups and access policy management."
      />
      <GroupsClient
        initialItems={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        allPermissions={allPermissions}
        user={access.data.user}
      />
    </>
  );
}
