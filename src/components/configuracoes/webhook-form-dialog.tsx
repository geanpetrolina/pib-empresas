"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { webhookConfigSchema, type WebhookConfigFormValues } from "@/lib/validations/schemas";
import { criarWebhookConfig, atualizarWebhookConfig } from "@/lib/actions/webhooks";
import type { WebhookConfig } from "@/types/database";

const EVENTOS = [
  { value: "aniversario_hoje", label: "Aniversário hoje" },
  { value: "aniversario_proximo", label: "Aniversário próximo (2-3 dias)" },
  { value: "visita_agendada", label: "Visita agendada" },
  { value: "visita_realizada", label: "Visita realizada" },
  { value: "pedido_oracao_novo", label: "Novo pedido de oração" },
];

const VALORES_PADRAO: WebhookConfigFormValues = {
  nome: "",
  evento: "aniversario_hoje",
  url_destino: "",
  ativo: true,
  segredo: "",
};

interface WebhookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: WebhookConfig | null;
  onSuccess?: () => void;
}

export function WebhookFormDialog({ open, onOpenChange, webhook, onSuccess }: WebhookFormDialogProps) {
  const [salvando, setSalvando] = useState(false);
  const editando = Boolean(webhook);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WebhookConfigFormValues>({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: VALORES_PADRAO,
  });

  useEffect(() => {
    if (open) {
      reset(
        webhook
          ? {
              nome: webhook.nome,
              evento: webhook.evento as WebhookConfigFormValues["evento"],
              url_destino: webhook.url_destino,
              ativo: webhook.ativo,
              segredo: webhook.segredo ?? "",
            }
          : VALORES_PADRAO
      );
    }
  }, [open, webhook, reset]);

  async function onSubmit(values: WebhookConfigFormValues) {
    setSalvando(true);
    const resultado = editando && webhook
      ? await atualizarWebhookConfig(webhook.id, values)
      : await criarWebhookConfig(values);
    setSalvando(false);

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Erro ao salvar webhook");
      return;
    }
    toast.success(editando ? "Webhook atualizado" : "Webhook cadastrado");
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar webhook" : "Novo webhook n8n"}</DialogTitle>
          <DialogDescription>
            Configure uma URL de Webhook Trigger do n8n para receber eventos do sistema (ex: envio de
            WhatsApp via Evolution API).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome identificador *</Label>
            <Input id="nome" placeholder="Ex: n8n - Aniversários WhatsApp" {...register("nome")} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evento">Evento *</Label>
            <Controller
              control={control}
              name="evento"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="evento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENTOS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url_destino">URL do Webhook (n8n) *</Label>
            <Input
              id="url_destino"
              placeholder="https://automacao.agencia7up.com.br/webhook/xxxxx"
              {...register("url_destino")}
            />
            {errors.url_destino && <p className="text-xs text-destructive">{errors.url_destino.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="segredo">Segredo HMAC (opcional)</Label>
            <Input
              id="segredo"
              placeholder="Usado para assinar o payload (X-PIB-Signature)"
              {...register("segredo")}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Webhook ativo</p>
              <p className="text-xs text-muted-foreground">Desative para pausar este disparo sem excluir</p>
            </div>
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={salvando}>
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              {editando ? "Salvar alterações" : "Cadastrar webhook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
