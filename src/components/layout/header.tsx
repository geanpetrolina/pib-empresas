"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { obterIniciais, USER_ROLE_LABEL } from "@/lib/utils/format";
import type { Profile } from "@/types/database";
import { toast } from "sonner";
import Link from "next/link";

interface HeaderProps {
  profile: Profile | null;
  titulo?: string;
}

export function Header({ profile, titulo }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada com sucesso");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
      <div className="flex flex-1 items-center gap-3">
        {titulo && (
          <h1 className="font-serif text-lg font-semibold text-foreground lg:text-xl">{titulo}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-9 w-9 border border-pib-gold-400/40">
              <AvatarFallback>{obterIniciais(profile?.nome_completo ?? "??")}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium">{profile?.nome_completo ?? "Usuário"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {profile?.role ? USER_ROLE_LABEL[profile.role] : ""}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/configuracoes" className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                Meu perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracoes" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
