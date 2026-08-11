"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, BarChart2, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/I18nProvider";

const navItems = [
  { translationKey: "nav.schedule", href: "/", icon: Calendar },
  { translationKey: "nav.clients", href: "/clients", icon: Users },
  { translationKey: "nav.analytics", href: "/analytics", icon: BarChart2 },
  { translationKey: "nav.services", href: "/services", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-border bg-background h-screen sticky top-0 py-8 px-4 z-40">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black text-xl shadow-md">
          M
        </div>
        <span className="text-2xl font-bold tracking-tight">Manic</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
              )}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-base">{t(item.translationKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
            pathname === "/settings" 
              ? "bg-primary/10 text-primary font-semibold shadow-sm" 
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
          )}
        >
          <Settings className="w-6 h-6" strokeWidth={pathname === "/settings" ? 2.5 : 2} />
          <span className="text-base">{t("nav.settings")}</span>
        </Link>
      </div>
    </div>
  );
}
