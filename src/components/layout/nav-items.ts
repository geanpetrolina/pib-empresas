import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarHeart,
  Sparkles,
  ClipboardList,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  titulo: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { titulo: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { titulo: "Empresas", href: "/empresas", icon: Building2 },
  { titulo: "Funcionários", href: "/funcionarios", icon: Users },
  { titulo: "Aniversários", href: "/aniversarios", icon: CalendarHeart },
  { titulo: "Visitas", href: "/visitas", icon: ClipboardList },
  { titulo: "Devocional IA", href: "/devocional", icon: Sparkles },
];

export const NAV_ITEMS_RODAPE: NavItem[] = [
  { titulo: "Configurações", href: "/configuracoes", icon: Settings },
];

// Itens priorizados para a barra de navegação inferior mobile (máx. 5)
export const NAV_ITEMS_MOBILE: NavItem[] = [
  { titulo: "Início", href: "/dashboard", icon: LayoutDashboard },
  { titulo: "Empresas", href: "/empresas", icon: Building2 },
  { titulo: "Aniversários", href: "/aniversarios", icon: CalendarHeart },
  { titulo: "Visitas", href: "/visitas", icon: ClipboardList },
  { titulo: "Devocional", href: "/devocional", icon: Sparkles },
];
