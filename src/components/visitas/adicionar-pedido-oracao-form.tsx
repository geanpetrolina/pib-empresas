"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { criarPedidoOracao } from "@/lib/actions/visitas";

export function AdicionarPedidoOracaoForm({
  visitaId,
  empresaId,
}: {
  visitaId: string;
  empresaId: string;
}) {
  const router = useRouter();
  const [descricao, setDescricao] = useState("");
  const [confidencial, setConfidencial] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit() {
    if (!descricao.trim()) return;
    setSalvando(true);
    const resultado = await criarPedidoOracao({
      descricao: descricao.trim(),
      confidencial,
      empresa_id: empresaId,
      visita_id: visitaId,
      status: "aberto",
    });
    setSalvando(false);

    if (!resultado.sucesso) {
      toast.error(resultado.erro ?? "Erro ao adicionar pedido");
      return;
    }
    setDescricao("");
    setConfidencial(false);
    toast.success("Pedido de oração adicionado");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3 sm:flex-row">
      <Textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Adicionar novo pedido de oração..."
        rows={2}
        className="flex-1"
      />
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
        <div className="flex items-center gap-2">
          <Switch checked={confidencial} onCheckedChange={setConfidencial} />
          <span className="text-xs text-muted-foreground">Confidencial</span>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleSubmit} disabled={salvando}>
          {salvando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Adicionar
        </Button>
      </div>
    </div>
  );
}
