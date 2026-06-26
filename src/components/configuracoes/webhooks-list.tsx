"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Webhook, Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
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
import { WebhookFormDialog } from "@/components/configuracoes/webhook-form-dialog";
import { excluirWebhookConfig } from "@/lib/actions/webhooks";
import type { WebhookConfig } from "@/types/database";

const EVENTO_LABEL: Record<string, string> = {
  aniversario_hoje: "Aniversário hoje",
  aniversario_proximo: "Aniversário próximo",
  visita_agendada: "Visita agendada",
  visita_realizada: "Visita realizada",
  pedido_oracao_novo: "Novo pedido de oração",
};

export function WebhooksList({ webhooks }: { webhooks: WebhookConfig[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<WebhookConfig | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [excluir, setExcluir] = useState<WebhookConfig | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmarExclusao() {
    if (!excluir) return;
    setExcluindo(true);
    const resultado = await excluirWebhookConfig(excluir.id);
    setExcluindo(false);
    setExcluir(null);
    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Erro ao excluir webhook");
      return;
    }
    toast.success("Webhook excluído");
    router.refresh();
  }

  return (
    <Card className="card-premium">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <Webhook className="h-4 w-4 text-pib-navy-500" /> Webhooks n8n
            </h3>
            <p className="text-xs text-muted-foreground">
              URLs do n8n que recebem eventos do sistema para automações de WhatsApp
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setFormAberto(true)}>
            <Plus className="h-3.5 w-3.5" /> Novo webhook
          </Button>
        </div>

        {webhooks.length === 0 ? (
          <EmptyState icon={Webhook} titulo="Nenhum webhook configurado" descricao="Cadastre uma URL do n8n para começar a receber notificações automáticas." />
        ) : (
          <div className="space-y-2">
            {webhooks.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{w.nome}</p>
                    <Badge variant={w.ativo ? "success" : "outline"}>{w.ativo ? "Ativo" : "Inativo"}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{EVENTO_LABEL[w.evento] ?? w.evento}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{w.url_destino}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditando(w);
                        setFormAberto(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setExcluir(w)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <WebhookFormDialog
        open={formAberto}
        onOpenChange={(open) => {
          setFormAberto(open);
          if (!open) setEditando(null);
        }}
        webhook={editando}
        onSuccess={() => router.refresh()}
      />

      <AlertDialog open={Boolean(excluir)} onOpenChange={(open) => !open && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              O webhook <strong>{excluir?.nome}</strong> deixará de receber eventos do sistema.
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
    </Card>
  );
}
