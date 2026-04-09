import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-client";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { SyncProvider } from "@/components/sync-provider";
import { MigrationDialog } from "@/components/migration-dialog";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: "SplitEase - Split bills, not friendships",
  description:
    "Track shared expenses, split bills fairly, and settle up with friends — all stored locally on your device.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "SplitEase - Split bills, not friendships",
    description:
      "Track shared expenses, split bills fairly, and settle up with friends.",
    siteName: "SplitEase",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark) || (stored === 'system' && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background font-sans">
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              <SyncProvider>
                {children}
                <MigrationDialog />
              </SyncProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
