import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { PageHeader } from "@/components/page-header";
import { ComponentPreview } from "@/components/preview/ComponentPreview";

export const metadata: Metadata = {
  title: "UI Components Preview",
};

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const access = await getManagementAccess();

  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/preview");
    }
  }

  return (
    <>
      <PageHeader
        title="UI Components Preview"
        href="/workspace/preview"
        description="Comprehensive preview of Dream Car House reusable dashboard design system components, DataTable, and form controls."
      />
      <ComponentPreview />
    </>
  );
}
