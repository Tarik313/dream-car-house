import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getPreferenceSectionDashboard } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { PreferenceClient } from "./preference-client";

export const dynamic = "force-dynamic";

export default async function PreferenceSectionPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/content/preferences");
    }
    return (
      <>
        <PageHeader href="/workspace/content/preferences" description="Homepage Preference Section" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const res = await getPreferenceSectionDashboard();
  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/preferences" description="Homepage Preference Section" />
        <State title="Failed to Load Preference Section" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  return (
    <>
      <PageHeader
        href="/workspace/content/preferences"
        description="Configure homepage Studio Preference Switcher: Section heading, badge, category labels, CTA targets, media banners, and trust guarantee cards."
      />
      <PreferenceClient initialData={res.data} userPermissions={access.data.user.permissions} />
    </>
  );
}
