import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getSEOConfigs } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { PageSEOClient } from "./page-seo-client";

export const dynamic = "force-dynamic";

export default async function PageSEOPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    visibility?: string;
    robots?: string;
    page?: string;
    page_size?: string;
  }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/seo/pages");
    }
    return (
      <>
        <PageHeader href="/workspace/seo/pages" description="SEO Configuration for General Pages" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getSEOConfigs({
    q: sp.q,
    visibility: sp.visibility,
    robots: sp.robots,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/seo/pages" description="SEO Configuration for General Pages" />
        <State title="Failed to Load Page SEO Configurations" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/seo/pages"
        description="Search engine metadata, Open Graph cards, Twitter metadata, and JSON-LD schema for general static pages."
      />

      <PageSEOClient
        initialItems={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        visibility={sp.visibility || ""}
        robots={sp.robots || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
