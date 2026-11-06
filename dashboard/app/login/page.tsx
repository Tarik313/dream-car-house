import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboardAccess, validateSafeRedirect } from "@/lib/server/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const access = await getDashboardAccess();
  const params = await searchParams;
  const nextTarget = validateSafeRedirect(params.next, "/workspace");

  // If already authenticated and active staff, redirect to requested destination
  if (access.allowed) {
    redirect(nextTarget);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <LoginForm nextTarget={nextTarget} />
      </div>
    </div>
  );
}
