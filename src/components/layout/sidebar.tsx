"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Church } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, NAV_ITEMS_RODAPE } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-navy-gradient border-r border-pib-navy-800/60">
      {/* Logo / cabeçalho da marca */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-gradient shadow-gold">
          <Church className="h-5 w-5 text-pib-navy-950" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-serif text-lg font-semibold text-white">PIB Empresas</span>
          <span className="text-[11px] uppercase tracking-wider text-pib-gold-300/80">
            Ministério Empresarial
          </span>
        </div>
      </div>

      <Separator />

      {/* Navegação principal */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const ativo = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                ativo
                  ? "bg-white/10 text-pib-gold-300 shadow-sm"
                  : "text-pib-navy-100/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  ativo ? "text-pib-gold-400" : "text-pib-navy-300 group-hover:text-pib-gold-300"
                )}
              />
              {item.titulo}
              {ativo && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-pib-gold-400" />}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="space-y-1 px-4 py-4">
        {NAV_ITEMS_RODAPE.map((item) => {
          const ativo = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                ativo ? "bg-white/10 text-pib-gold-300" : "text-pib-navy-100/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] text-pib-navy-300 group-hover:text-pib-gold-300" />
              {item.titulo}
            </Link>
          );
        })}
        <p className="px-3 pt-3 text-[11px] text-pib-navy-400">
          Primeira Igreja Batista de Petrolina
        </p>
      </div>
    </aside>
  );
}

function Separator() {
  return <div className="mx-4 h-px bg-gradient-to-r from-transparent via-pib-navy-700/60 to-transparent" />;
}
