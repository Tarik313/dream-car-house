import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getSiteSettings } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { SiteSettingsClient } from "./site-settings-client";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/site-settings");
    }
    return (
      <>
        <PageHeader href="/workspace/site-settings" description="Site Settings & Business Profile" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const res = await getSiteSettings();
  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/site-settings" description="Site Settings & Business Profile" />
        <State title="Failed to Load Site Settings" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  return (
    <>
      <PageHeader
        href="/workspace/site-settings"
        description="Public website business identity, hotline, email, primary address, and footer copy configuration."
      />
      <SiteSettingsClient
        initialSettings={res.data}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
