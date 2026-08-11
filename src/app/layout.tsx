import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";

import { Sidebar } from "@/components/Sidebar";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/AuthProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Manic - Учет клиентов",
  description: "Система управления записями для маникюрного салона",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Manic",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} overscroll-none antialiased bg-muted/30 md:bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark", "pink"]}
        >
          <CurrencyProvider>
            <AuthProvider>
              <div className="flex md:max-w-5xl lg:max-w-6xl mx-auto min-h-screen bg-background relative md:shadow-2xl md:ring-1 md:ring-border/5 flex-col md:flex-row pb-[env(safe-area-inset-bottom)] md:pb-0">
                <Sidebar />
                <div className="flex-1 max-w-md mx-auto md:max-w-none w-full relative bg-background flex flex-col min-h-screen">
                  <main className="flex-1 pb-16 md:pb-8 overflow-y-auto w-full max-w-3xl mx-auto">
                    {children}
                  </main>
                  <BottomNav />
                </div>
                <InstallPrompt />
              </div>
            </AuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
