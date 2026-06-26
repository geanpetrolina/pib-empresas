"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, MoreVertical, Pencil, Trash2, Phone, Mail, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { EmpresaFormDialog } from "@/components/empresas/empresa-form-dialog";
import { excluirEmpresa } from "@/lib/actions/empresas";
import type { Empresa } from "@/types/database";

export function EmpresasList({ empresas }: { empresas: Empresa[] }) {
  const router = useRouter();
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [empresaExcluir, setEmpresaExcluir] = useState<Empresa | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmarExclusao() {
    if (!empresaExcluir) return;
    setExcluindo(true);
    const resultado = await excluirEmpresa(empresaExcluir.id);
    setExcluindo(false);
    setEmpresaExcluir(null);

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Erro ao excluir empresa");
      return;
    }
    toast.success("Empresa excluída com sucesso");
    router.refresh();
  }

  if (empresas.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        titulo="Nenhuma empresa cadastrada"
        descricao="Cadastre a primeira empresa visitada pelo ministério para começar a acompanhar colaboradores e visitas."
        acao={
          <Button variant="gold" onClick={() => setFormAberto(true)}>
            <Plus className="h-4 w-4" /> Cadastrar empresa
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {empresas.map((empresa) => (
          <Card key={empresa.id} className="card-premium group relative">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/empresas/${empresa.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pib-navy-100 dark:bg-pib-navy-800/50">
                      <Building2 className="h-5 w-5 text-pib-navy-600 dark:text-pib-navy-200" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{empresa.nome}</h3>
                      {empresa.responsavel && (
                        <p className="truncate text-xs text-muted-foreground">{empresa.responsavel}</p>
                      )}
                    </div>
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
                        setEmpresaEditando(empresa);
                        setFormAberto(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setEmpresaExcluir(empresa)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-1.5">
                {empresa.telefone && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {empresa.telefone}
                  </p>
                )}
                {empresa.email && (
                  <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> {empresa.email}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {empresa.segmento && <Badge variant="secondary">{empresa.segmento}</Badge>}
                {!empresa.ativa && <Badge variant="outline">Inativa</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EmpresaFormDialog
        open={formAberto}
        onOpenChange={(open) => {
          setFormAberto(open);
          if (!open) setEmpresaEditando(null);
        }}
        empresa={empresaEditando}
        onSuccess={() => router.refresh()}
      />

      <AlertDialog open={Boolean(empresaExcluir)} onOpenChange={(open) => !open && setEmpresaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os funcionários, visitas e pedidos de oração
              vinculados a <strong>{empresaExcluir?.nome}</strong> também serão removidos.
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
