"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS_MOBILE } from "./nav-items";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      {NAV_ITEMS_MOBILE.map((item) => {
        const ativo = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              ativo ? "text-pib-gold-600 dark:text-pib-gold-400" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", ativo && "drop-shadow-sm")} strokeWidth={ativo ? 2.4 : 2} />
            {item.titulo}
          </Link>
        );
      })}
    </nav>
  );
}
