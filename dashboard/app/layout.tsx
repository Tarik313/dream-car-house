import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { ToastProvider } from "@/components/ui/Toast";
import { getDashboardAccess } from "@/lib/server/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Dashboard | Dream Car House", template: "%s | Dream Car House Dashboard" },
  robots: { index: false, follow: false, noarchive: true },
};

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
