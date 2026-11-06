import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getSocialMedias } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { SocialMediaClient } from "./social-media-client";

export const dynamic = "force-dynamic";

export default async function SocialMediaPage({
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
      redirect("/login?next=/workspace/content/social-media");
    }
    return (
      <>
        <PageHeader href="/workspace/content/social-media" description="Social Media Links" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getSocialMedias({
    q: sp.q,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/social-media" description="Social Media Links" />
        <State title="Failed to Load Social Media Configurations" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/content/social-media"
        description="Public website social media accounts configuration. The public website renders the newest created record."
      />
      <SocialMediaClient
        initialItems={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
