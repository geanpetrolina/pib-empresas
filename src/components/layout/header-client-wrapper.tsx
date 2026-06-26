"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import type { Profile } from "@/types/database";

const TITULOS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/empresas": "Empresas",
  "/funcionarios": "Funcionários",
  "/aniversarios": "Aniversários",
  "/visitas": "Visitas Pastorais",
  "/devocional": "Devocional IA",
  "/configuracoes": "Configurações",
};

export function HeaderClientWrapper({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const base = "/" + (pathname.split("/")[1] ?? "");
  const titulo = TITULOS[base] ?? TITULOS[pathname];

  return <Header profile={profile} titulo={titulo} />;
}
