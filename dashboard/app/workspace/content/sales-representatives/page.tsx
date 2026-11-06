import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getSalesRepresentatives } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { SalesRepresentativesClient } from "./sales-representatives-client";

export const dynamic = "force-dynamic";

export default async function SalesRepresentativesPage({
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
      redirect("/login?next=/workspace/content/sales-representatives");
    }
    return (
      <>
        <PageHeader href="/workspace/content/sales-representatives" description="Sales Representatives" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getSalesRepresentatives({
    q: sp.q,
    status: sp.status,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/sales-representatives" description="Sales Representatives" />
        <State title="Failed to Load Sales Representatives" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/content/sales-representatives"
        description="Showroom advisors and customer sales contacts displayed across the website."
      />
      <SalesRepresentativesClient
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
