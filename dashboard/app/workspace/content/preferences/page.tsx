import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getPreferenceSectionDashboard, getInventoryList } from "@/lib/server/inventory";
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

  const [res, invRes] = await Promise.all([
    getPreferenceSectionDashboard(),
    getInventoryList({ status: "PUBLISHED", page_size: 200 }).catch(() => null),
  ]);

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

  const publishedCars = invRes && invRes.ok ? invRes.data.results : [];

  return (
    <>
      <PageHeader
        href="/workspace/content/preferences"
        description="Configure homepage Studio Preference Switcher: Section heading, category tab labels, and curated 3-car showcase allocations."
      />
      <PreferenceClient
        initialData={res.data}
        inventoryCars={publishedCars}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
