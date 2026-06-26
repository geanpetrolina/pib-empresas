import Link from "next/link";
import { Cake } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { obterIniciais, calcularIdade, formatarDataExtensa } from "@/lib/utils/format";
import type { Funcionario } from "@/types/database";

export function FuncionarioMiniCard({ funcionario }: { funcionario: Funcionario }) {
  return (
    <Link
      href={`/funcionarios/${funcionario.id}`}
      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/60"
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback>{obterIniciais(funcionario.nome)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{funcionario.nome}</p>
        <p className="truncate text-xs text-muted-foreground">
          {funcionario.cargo ?? "Sem cargo"} · {calcularIdade(funcionario.data_nascimento)} anos
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <Cake className="h-3 w-3" />
        {formatarDataExtensa(funcionario.data_nascimento)}
      </div>
    </Link>
  );
}
