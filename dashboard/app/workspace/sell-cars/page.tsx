import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getSellCars } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { SellCarListClient } from "./sell-car-client";

export const dynamic = "force-dynamic";

export default async function SellCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; car_year?: string; ordering?: string; page?: string; page_size?: string }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/sell-cars");
    }
    return (
      <>
        <PageHeader href="/workspace/sell-cars" description="Sell Car Submissions" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getSellCars({
    q: sp.q,
    car_year: sp.car_year,
    ordering: sp.ordering,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/sell-cars" description="Sell Car Submissions" />
        <State title="Failed to Load Submissions" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/sell-cars"
        description="Customer vehicle appraisal requests, specs, and uploaded photo galleries."
      />
      <SellCarListClient
        initialSellCars={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        carYearFilter={sp.car_year || ""}
        ordering={sp.ordering || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
