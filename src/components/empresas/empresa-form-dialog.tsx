"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { empresaSchema, type EmpresaFormValues } from "@/lib/validations/schemas";
import { criarEmpresa, atualizarEmpresa } from "@/lib/actions/empresas";
import { formatarTelefone } from "@/lib/utils/format";
import type { Empresa } from "@/types/database";

interface EmpresaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: Empresa | null;
  onSuccess?: () => void;
}

const VALORES_PADRAO: EmpresaFormValues = {
  nome: "",
  responsavel: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "Petrolina",
  estado: "PE",
  segmento: "",
  observacoes: "",
  ativa: true,
};

export function EmpresaFormDialog({ open, onOpenChange, empresa, onSuccess }: EmpresaFormDialogProps) {
  const [salvando, setSalvando] = useState(false);
  const editando = Boolean(empresa);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: VALORES_PADRAO,
  });

  useEffect(() => {
    if (open) {
      reset(
        empresa
          ? {
              nome: empresa.nome,
              responsavel: empresa.responsavel ?? "",
              telefone: empresa.telefone ?? "",
              email: empresa.email ?? "",
              endereco: empresa.endereco ?? "",
              cidade: empresa.cidade ?? "Petrolina",
              estado: empresa.estado ?? "PE",
              segmento: empresa.segmento ?? "",
              observacoes: empresa.observacoes ?? "",
              ativa: empresa.ativa,
            }
          : VALORES_PADRAO
      );
    }
  }, [open, empresa, reset]);

  async function onSubmit(values: EmpresaFormValues) {
    setSalvando(true);
    const resultado = editando && empresa
      ? await atualizarEmpresa(empresa.id, values)
      : await criarEmpresa(values);
    setSalvando(false);

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Erro ao salvar empresa");
      return;
    }

    toast.success(editando ? "Empresa atualizada com sucesso" : "Empresa cadastrada com sucesso");
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar empresa" : "Nova empresa"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Atualize as informações da empresa."
              : "Cadastre uma nova empresa visitada pelo ministério."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome da empresa *</Label>
            <Input id="nome" placeholder="Ex: Clínica Vida Plena" {...register("nome")} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input id="responsavel" placeholder="Nome do responsável" {...register("responsavel")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="segmento">Segmento</Label>
              <Input id="segmento" placeholder="Ex: Saúde, Varejo..." {...register("segmento")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(87) 99999-9999"
                value={watch("telefone")}
                onChange={(e) => setValue("telefone", formatarTelefone(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="contato@empresa.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" placeholder="Rua, número, bairro" {...register("endereco")} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" {...register("cidade")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estado">UF</Label>
              <Input id="estado" maxLength={2} className="uppercase" {...register("estado")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações relevantes sobre a empresa, contexto ministerial, etc."
              {...register("observacoes")}
            />
          </div>

          {editando && (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Empresa ativa</p>
                <p className="text-xs text-muted-foreground">
                  Empresas inativas não aparecem nas listagens principais
                </p>
              </div>
              <Switch
                checked={watch("ativa")}
                onCheckedChange={(checked) => setValue("ativa", checked)}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={salvando}>
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              {editando ? "Salvar alterações" : "Cadastrar empresa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
