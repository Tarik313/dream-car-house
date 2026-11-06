import { redirect } from "next/navigation";
import { getDashboardAccess } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const access = await getDashboardAccess();

  if (access.allowed) {
    redirect("/workspace");
  }

  redirect("/login");
}
