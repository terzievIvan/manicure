"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, BarChart2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/I18nProvider";

const navItems = [
  { translationKey: "nav.schedule", href: "/", icon: Calendar },
  { translationKey: "nav.clients", href: "/clients", icon: Users },
  { translationKey: "nav.analytics", href: "/analytics", icon: BarChart2 },
  { translationKey: "nav.services", href: "/services", icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
              )}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{t(item.translationKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
