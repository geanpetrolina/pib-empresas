"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, MoreVertical, Pencil, Trash2, Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { FuncionarioFormDialog } from "@/components/funcionarios/funcionario-form-dialog";
import { excluirFuncionario } from "@/lib/actions/funcionarios";
import { obterIniciais, calcularIdade, formatarDataExtensa } from "@/lib/utils/format";
import type { Funcionario } from "@/types/database";

export function FuncionariosList({ funcionarios }: { funcionarios: Funcionario[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [excluir, setExcluir] = useState<Funcionario | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmarExclusao() {
    if (!excluir) return;
    setExcluindo(true);
    const resultado = await excluirFuncionario(excluir.id);
    setExcluindo(false);
    setExcluir(null);

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Erro ao excluir colaborador");
      return;
    }
    toast.success("Colaborador excluído com sucesso");
    router.refresh();
  }

  if (funcionarios.length === 0) {
    return (
      <EmptyState
        icon={Users}
        titulo="Nenhum colaborador cadastrado"
        descricao="Cadastre os colaboradores das empresas para acompanhar aniversários e gerar conexões pastorais."
        acao={
          <Button variant="gold" onClick={() => setFormAberto(true)}>
            <Plus className="h-4 w-4" /> Cadastrar colaborador
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {funcionarios.map((f) => (
          <Card key={f.id} className="card-premium">
            <CardContent className="flex items-start gap-3 p-4">
              <Link href={`/funcionarios/${f.id}`} className="flex min-w-0 flex-1 items-start gap-3">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarFallback>{obterIniciais(f.nome)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{f.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.cargo ?? "Sem cargo"} · {calcularIdade(f.data_nascimento)} anos
                  </p>
                  {f.empresa?.nome && (
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 shrink-0" /> {f.empresa.nome}
                    </p>
                  )}
                  <Badge variant="secondary" className="mt-2">
                    {formatarDataExtensa(f.data_nascimento)}
                  </Badge>
                </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditando(f);
                      setFormAberto(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setExcluir(f)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>

      <FuncionarioFormDialog
        open={formAberto}
        onOpenChange={(open) => {
          setFormAberto(open);
          if (!open) setEditando(null);
        }}
        funcionario={editando}
        onSuccess={() => router.refresh()}
      />

      <AlertDialog open={Boolean(excluir)} onOpenChange={(open) => !open && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. <strong>{excluir?.nome}</strong> será removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} disabled={excluindo}>
              {excluindo ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
