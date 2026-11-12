import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { ToastProvider } from "@/components/ui/Toast";
import { getDashboardAccess } from "@/lib/server/auth";
import "./globals.css";

async function resolveDashboardFavicon(): Promise<string> {
  try {
    const origin = (process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000").replace(/\/$/, "");
    const res = await fetch(`${origin}/api/v1/home/site-settings/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return "/favicon.ico";
    const json = await res.json();
    const raw = typeof json?.data?.favicon === "string" ? json.data.favicon.trim() : "";
    return raw || "/favicon.ico";
  } catch {
    return "/favicon.ico";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await resolveDashboardFavicon();
  return {
    title: { default: "Dashboard | Dream Car House", template: "%s | Dream Car House Dashboard" },
    robots: { index: false, follow: false, noarchive: true },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await getDashboardAccess();
  const user = access.allowed ? access.user : undefined;

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ToastProvider>
          <Shell user={user}>{children}</Shell>
        </ToastProvider>
      </body>
    </html>
  );
}
