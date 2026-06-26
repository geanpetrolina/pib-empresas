"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { atualizarStatusPedidoOracao } from "@/lib/actions/visitas";
import { formatarDataHora, ORACAO_STATUS_LABEL } from "@/lib/utils/format";
import type { PedidoOracao, OracaoStatus } from "@/types/database";

export function PedidoOracaoCard({ pedido }: { pedido: PedidoOracao }) {
  const router = useRouter();
  const [status, setStatus] = useState<OracaoStatus>(pedido.status);
  const [atualizando, setAtualizando] = useState(false);

  async function handleChange(novoStatus: string) {
    setAtualizando(true);
    const resultado = await atualizarStatusPedidoOracao(pedido.id, novoStatus as OracaoStatus);
    setAtualizando(false);

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Erro ao atualizar status");
      return;
    }
    setStatus(novoStatus as OracaoStatus);
    toast.success("Status do pedido atualizado");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1 text-sm text-foreground">{pedido.descricao}</p>
        {pedido.confidencial && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{formatarDataHora(pedido.criado_em)}</p>
        <Select value={status} onValueChange={handleChange} disabled={atualizando}>
          <SelectTrigger className="h-7 w-auto gap-1.5 border-none bg-secondary px-2.5 text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ORACAO_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
