"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { visitaSchema, type VisitaFormValues } from "@/lib/validations/schemas";
import { criarVisita, atualizarVisita, criarPedidoOracao } from "@/lib/actions/visitas";
import { useEmpresasOpcoes } from "@/lib/hooks/use-empresas-opcoes";
import { VISITA_STATUS_LABEL } from "@/lib/utils/format";
import type { Visita } from "@/types/database";

interface PedidoRascunho {
  descricao: string;
  confidencial: boolean;
}

interface VisitaFormProps {
  visita?: Visita | null;
  empresaIdPadrao?: string | null;
}

export function VisitaForm({ visita, empresaIdPadrao }: VisitaFormProps) {
  const router = useRouter();
  const editando = Boolean(visita);
  const { empresas } = useEmpresasOpcoes();
  const [salvando, setSalvando] = useState(false);
  const [pedidos, setPedidos] = useState<PedidoRascunho[]>([]);
  const [novoPedido, setNovoPedido] = useState("");
  const [novoPedidoConfidencial, setNovoPedidoConfidencial] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<VisitaFormValues>({
    resolver: zodResolver(visitaSchema),
    defaultValues: visita
      ? {
          empresa_id: visita.empresa_id,
          data_visita: visita.data_visita,
          status: visita.status,
          responsavel_id: visita.responsavel_id,
          observacoes: visita.observacoes ?? "",
        }
      : {
          empresa_id: empresaIdPadrao ?? "",
          data_visita: new Date().toISOString().split("T")[0],
          status: "agendada",
          observacoes: "",
        },
  });

  function adicionarPedido() {
    if (!novoPedido.trim()) return;
    setPedidos((prev) => [...prev, { descricao: novoPedido.trim(), confidencial: novoPedidoConfidencial }]);
    setNovoPedido("");
    setNovoPedidoConfidencial(false);
  }

  function removerPedido(index: number) {
    setPedidos((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: VisitaFormValues) {
    setSalvando(true);
    let visitaId: string | undefined;

    if (editando && visita) {
      const resultado = await atualizarVisita(visita.id, values);
      if (!resultado.sucesso) {
        setSalvando(false);
        toast.error(resultado.erro ?? "Erro ao salvar visita");
        return;
      }
      visitaId = visita.id;
    } else {
      const resultado = await criarVisita(values);
      if (!resultado.sucesso) {
        setSalvando(false);
        toast.error(resultado.erro ?? "Erro ao salvar visita");
        return;
      }
      visitaId = resultado.data?.id;
    }

    // Cria os pedidos de oração vinculados (apenas em criação nova)
    if (!editando && visitaId && pedidos.length > 0) {
      await Promise.all(
        pedidos.map((p) =>
          criarPedidoOracao({
            descricao: p.descricao,
            confidencial: p.confidencial,
            empresa_id: values.empresa_id,
            visita_id: visitaId,
            status: "aberto",
          })
        )
      );
    }

    setSalvando(false);
    toast.success(editando ? "Visita atualizada com sucesso" : "Visita registrada com sucesso");
    router.push(visitaId ? `/visitas/${visitaId}` : "/visitas");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-base">Dados da visita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="empresa_id">Empresa *</Label>
            <Controller
              control={control}
              name="empresa_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="empresa_id">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.empresa_id && <p className="text-xs text-destructive">{errors.empresa_id.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="data_visita">Data da visita *</Label>
              <Input id="data_visita" type="date" {...register("data_visita")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VISITA_STATUS_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações da visita</Label>
            <Textarea
              id="observacoes"
              placeholder="O que foi conversado, como a equipe foi recebida, encaminhamentos..."
              rows={4}
              {...register("observacoes")}
            />
          </div>
        </CardContent>
      </Card>

      {!editando && (
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartHandshake className="h-4 w-4 text-pib-gold-500" /> Pedidos de oração coletados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pedidos.map((p, i) => (
              <div key={i} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm text-foreground">{p.descricao}</p>
                  {p.confidencial && (
                    <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                      Confidencial
                    </span>
                  )}
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removerPedido(i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Textarea
                value={novoPedido}
                onChange={(e) => setNovoPedido(e.target.value)}
                placeholder="Ex: Oração pela saúde do proprietário..."
                rows={2}
                className="flex-1"
              />
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                <div className="flex items-center gap-2">
                  <Switch checked={novoPedidoConfidencial} onCheckedChange={setNovoPedidoConfidencial} />
                  <span className="text-xs text-muted-foreground">Confidencial</span>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={adicionarPedido}>
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="gold" disabled={salvando}>
          {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
          {editando ? "Salvar alterações" : "Registrar visita"}
        </Button>
      </div>
    </form>
  );
}
