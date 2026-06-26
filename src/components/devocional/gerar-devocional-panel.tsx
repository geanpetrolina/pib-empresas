"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { devocionalGerarSchema, type DevocionalGerarValues } from "@/lib/validations/schemas";
import { useEmpresasOpcoes } from "@/lib/hooks/use-empresas-opcoes";
import { DevocionalCard } from "@/components/devocional/devocional-card";
import type { Devocional } from "@/types/database";

const TOM_OPCOES = [
  { value: "encorajador", label: "Encorajador" },
  { value: "reflexivo", label: "Reflexivo" },
  { value: "celebrativo", label: "Celebrativo" },
  { value: "intercessao", label: "Intercessão" },
];

export function GerarDevocionalPanel() {
  const { empresas } = useEmpresasOpcoes();
  const [gerando, setGerando] = useState(false);
  const [devocionalGerado, setDevocionalGerado] = useState<Devocional | null>(null);

  const { register, handleSubmit, control, reset } = useForm<DevocionalGerarValues>({
    resolver: zodResolver(devocionalGerarSchema),
    defaultValues: { tema: "", tom: "encorajador", empresa_id: null, contexto_adicional: "" },
  });

  async function onSubmit(values: DevocionalGerarValues) {
    setGerando(true);
    setDevocionalGerado(null);
    try {
      const res = await fetch("/api/devocional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.erro ?? "Erro ao gerar devocional");
      }

      setDevocionalGerado(json.devocional);
      toast.success("Devocional gerado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar devocional");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="card-premium h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-pib-gold-500" /> Gerar devocional
          </CardTitle>
          <CardDescription>
            A IA cria uma mensagem cristã personalizada com versículo e oração, ideal para abrir ou
            encerrar uma visita pastoral.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tema">Tema (opcional)</Label>
              <Input id="tema" placeholder="Ex: gratidão, perseverança, sabedoria no trabalho" {...register("tema")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tom">Tom do devocional</Label>
              <Controller
                control={control}
                name="tom"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tom">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOM_OPCOES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="empresa_id">Empresa (opcional)</Label>
              <Controller
                control={control}
                name="empresa_id"
                render={({ field }) => (
                  <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                    <SelectTrigger id="empresa_id">
                      <SelectValue placeholder="Personalizar para uma empresa" />
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
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contexto_adicional">Contexto adicional (opcional)</Label>
              <Textarea
                id="contexto_adicional"
                placeholder="Ex: a equipe está passando por um momento de reestruturação..."
                rows={3}
                {...register("contexto_adicional")}
              />
            </div>

            <Button type="submit" variant="gold" className="w-full" disabled={gerando}>
              {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {gerando ? "Gerando devocional..." : "Gerar devocional"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        {devocionalGerado ? (
          <DevocionalCard devocional={devocionalGerado} />
        ) : (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-pib-gold-400" />
            <p className="text-sm text-muted-foreground">
              Preencha os detalhes ao lado e gere um devocional personalizado para sua próxima visita.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
