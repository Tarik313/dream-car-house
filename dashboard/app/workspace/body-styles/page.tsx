import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getBodyStyles } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { BodyStyleListClient } from "./body-client";

export const dynamic = "force-dynamic";

export default async function BodyStylesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/body-styles");
    }
    return (
      <>
        <PageHeader href="/workspace/body-styles" description="Body Styles" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getBodyStyles({
    q: sp.q,
    status: sp.status,
    page: sp.page,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/body-styles" description="Body Styles" />
        <State title="Failed to Load Body Styles" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/body-styles"
        description="Manage vehicle body styles (SUV, Sedan, Hatchback, Coupe, etc.)."
      />
      <BodyStyleListClient
        initialStyles={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        status={sp.status || ""}
      />
    </>
  );
}
