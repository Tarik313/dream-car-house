import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getStoriesDashboardAction } from "@/app/actions/stories";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { StoriesClient } from "./stories-client";

export const dynamic = "force-dynamic";

export default async function ShowroomStoriesPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/content/stories");
    }
    return (
      <>
        <PageHeader href="/workspace/content/stories" description="Showroom Stories Management" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const storiesRes = await getStoriesDashboardAction();
  const stories = storiesRes.ok ? storiesRes.data : [];

  return (
    <>
      <PageHeader
        href="/workspace/content/stories"
        description="Manage VIP Showroom Stories, video reels, and highlights displayed in the public header story player."
      />
      <StoriesClient
        initialStories={stories}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
