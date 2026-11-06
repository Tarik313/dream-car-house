import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getQuotes } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { QuoteListClient } from "./quote-client";

export const dynamic = "force-dynamic";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; car?: string; ordering?: string; page?: string; page_size?: string }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/quotes");
    }
    return (
      <>
        <PageHeader href="/workspace/quotes" description="Customer Quotes" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getQuotes({
    q: sp.q,
    car: sp.car,
    ordering: sp.ordering,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/quotes" description="Customer Quotes" />
        <State title="Failed to Load Quotes" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/quotes"
        description="Manage customer price enquiries and showroom quote submissions."
      />
      <QuoteListClient
        initialQuotes={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        carFilter={sp.car || ""}
        ordering={sp.ordering || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
