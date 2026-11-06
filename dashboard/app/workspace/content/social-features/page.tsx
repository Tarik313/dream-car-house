import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getPeopleTalks } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { SocialFeaturesClient } from "./social-features-client";

export const dynamic = "force-dynamic";

export default async function SocialFeaturesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    is_featured?: string;
    page?: string;
    page_size?: string;
  }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/content/social-features");
    }
    return (
      <>
        <PageHeader href="/workspace/content/social-features" description="Social Features (People Talk About Us)" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getPeopleTalks({
    q: sp.q,
    status: sp.status,
    is_featured: sp.is_featured,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/social-features" description="Social Features (People Talk About Us)" />
        <State title="Failed to Load Social Features" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/content/social-features"
        description="Customer stories, press mentions, and social cards highlighted on the public website."
      />
      <SocialFeaturesClient
        initialItems={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        status={sp.status || ""}
        isFeatured={sp.is_featured || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
