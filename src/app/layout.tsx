import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";

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
      <body className={`${inter.className} overscroll-none antialiased`}>
        <div className="max-w-md mx-auto min-h-screen bg-background relative shadow-2xl ring-1 ring-border/5 flex flex-col pb-[env(safe-area-inset-bottom)]">
          <main className="flex-1 pb-16 overflow-y-auto">
            {children}
          </main>
          <BottomNav />
          <InstallPrompt />
        </div>
      </body>
    </html>
  );
}
