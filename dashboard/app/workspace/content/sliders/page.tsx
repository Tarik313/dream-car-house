import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getSliders } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { SliderClient } from "./slider-client";

export const dynamic = "force-dynamic";

export default async function SlidersPage({
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
      redirect("/login?next=/workspace/content/sliders");
    }
    return (
      <>
        <PageHeader href="/workspace/content/sliders" description="Slider Videos" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getSliders({
    q: sp.q,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/sliders" description="Slider Videos" />
        <State title="Failed to Load Sliders" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/content/sliders"
        description="Homepage banner video and headline configuration. Public website selects the newest created record."
      />
      <SliderClient
        initialSliders={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
