import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getStocks } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { StockListClient } from "./stock-client";

export const dynamic = "force-dynamic";

export default async function StocksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; ordering?: string; page?: string; page_size?: string }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/stocks");
    }
    return (
      <>
        <PageHeader href="/workspace/stocks" description="Stock Items" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getStocks({
    q: sp.q,
    status: sp.status,
    ordering: sp.ordering,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/stocks" description="Stock Items" />
        <State title="Failed to Load Stock Items" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/stocks"
        description="Manage incoming and available showroom stock arrivals and media banners."
      />
      <StockListClient
        initialStocks={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        status={sp.status || ""}
        ordering={sp.ordering || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
