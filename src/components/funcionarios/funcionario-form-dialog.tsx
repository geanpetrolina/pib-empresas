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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { funcionarioSchema, type FuncionarioFormValues } from "@/lib/validations/schemas";
import { criarFuncionario, atualizarFuncionario } from "@/lib/actions/funcionarios";
import { formatarTelefone } from "@/lib/utils/format";
import { useEmpresasOpcoes } from "@/lib/hooks/use-empresas-opcoes";
import type { Funcionario } from "@/types/database";

interface FuncionarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionario?: Funcionario | null;
  empresaIdPadrao?: string | null;
  onSuccess?: () => void;
}

function valoresPadrao(empresaId?: string | null): FuncionarioFormValues {
  return {
    nome: "",
    data_nascimento: "",
    empresa_id: empresaId ?? null,
    cargo: "",
    telefone: "",
    email: "",
    observacoes: "",
    ativo: true,
  };
}

export function FuncionarioFormDialog({
  open,
  onOpenChange,
  funcionario,
  empresaIdPadrao,
  onSuccess,
}: FuncionarioFormDialogProps) {
  const [salvando, setSalvando] = useState(false);
  const editando = Boolean(funcionario);
  const { empresas } = useEmpresasOpcoes();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FuncionarioFormValues>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: valoresPadrao(empresaIdPadrao),
  });

  useEffect(() => {
    if (open) {
      reset(
        funcionario
          ? {
              nome: funcionario.nome,
              data_nascimento: funcionario.data_nascimento,
              empresa_id: funcionario.empresa_id,
              cargo: funcionario.cargo ?? "",
              telefone: funcionario.telefone ?? "",
              email: funcionario.email ?? "",
              observacoes: funcionario.observacoes ?? "",
              ativo: funcionario.ativo,
            }
          : valoresPadrao(empresaIdPadrao)
      );
    }
  }, [open, funcionario, empresaIdPadrao, reset]);

  async function onSubmit(values: FuncionarioFormValues) {
    setSalvando(true);
    const resultado =
      editando && funcionario
        ? await atualizarFuncionario(funcionario.id, values)
        : await criarFuncionario(values);
    setSalvando(false);

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Erro ao salvar colaborador");
      return;
    }

    toast.success(editando ? "Colaborador atualizado com sucesso" : "Colaborador cadastrado com sucesso");
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar colaborador" : "Novo colaborador"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Atualize as informações do colaborador."
              : "Cadastre um colaborador vinculado a uma empresa visitada."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome completo *</Label>
            <Input id="nome" placeholder="Ex: Ana Paula Ferreira" {...register("nome")} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="data_nascimento">Data de nascimento *</Label>
              <Input id="data_nascimento" type="date" {...register("data_nascimento")} />
              {errors.data_nascimento && (
                <p className="text-xs text-destructive">{errors.data_nascimento.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargo">Cargo</Label>
              <Input id="cargo" placeholder="Ex: Recepcionista" {...register("cargo")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="empresa_id">Empresa vinculada</Label>
            <Controller
              control={control}
              name="empresa_id"
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
              <Input id="email" type="email" placeholder="email@empresa.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" placeholder="Informações relevantes..." {...register("observacoes")} />
          </div>

          {editando && (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Colaborador ativo</p>
                <p className="text-xs text-muted-foreground">
                  Inativos não aparecem nas listas de aniversários
                </p>
              </div>
              <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={salvando}>
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              {editando ? "Salvar alterações" : "Cadastrar colaborador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
