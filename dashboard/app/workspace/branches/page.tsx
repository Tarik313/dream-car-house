import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getShowroomBranchList } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { BranchesClient } from "./branches-client";

export const dynamic = "force-dynamic";

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    page_size?: string;
  }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/branches");
    }
    return (
      <>
        <PageHeader href="/workspace/branches" description="Showroom Branches" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getShowroomBranchList({
    q: sp.q,
    status: sp.status,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/branches" description="Showroom Branches" />
        <State title="Failed to Load Showroom Branches" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/branches"
        description="Showroom branch locations, phone numbers, map embeds, and publication status."
      />
      <BranchesClient
        initialItems={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        status={sp.status || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
