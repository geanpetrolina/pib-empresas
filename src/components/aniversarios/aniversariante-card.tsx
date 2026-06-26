"use client";

import { useState } from "react";
import { MessageCircle, Phone, Building2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  obterIniciais,
  textoDiasRestantes,
  corDestaqueAniversario,
  calcularProximaIdade,
  formatarDataExtensa,
  limparTelefone,
} from "@/lib/utils/format";
import type { Aniversariante } from "@/types/database";

export function AniversarianteCard({ pessoa }: { pessoa: Aniversariante }) {
  const [disparando, setDisparando] = useState(false);
  const destaque = corDestaqueAniversario(pessoa.dias_restantes);

  async function notificarWhatsapp() {
    setDisparando(true);
    try {
      const res = await fetch("/api/webhooks/n8n/disparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evento: pessoa.dias_restantes === 0 ? "aniversario_hoje" : "aniversario_proximo",
          funcionario_id: pessoa.id,
          nome: pessoa.nome,
          telefone: pessoa.telefone,
          empresa_nome: pessoa.empresa_nome,
          dias_restantes: pessoa.dias_restantes,
        }),
      });
      if (!res.ok) throw new Error("Falha ao disparar notificação");
      toast.success("Notificação enviada para a fila do n8n");
    } catch {
      toast.error("Não foi possível disparar a notificação. Verifique a configuração do webhook.");
    } finally {
      setDisparando(false);
    }
  }

  return (
    <Card className={`card-premium ${destaque.borda}`}>
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarFallback>{obterIniciais(pessoa.nome)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{pessoa.nome}</p>
            {pessoa.dias_restantes === 0 && <PartyPopper className="h-4 w-4 shrink-0 text-pib-gold-500" />}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {pessoa.cargo && `${pessoa.cargo} · `}
            {formatarDataExtensa(pessoa.data_nascimento)} · fará {calcularProximaIdade(pessoa.data_nascimento)} anos
          </p>
          {pessoa.empresa_nome && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" /> {pessoa.empresa_nome}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${destaque.badge}`}>
            {textoDiasRestantes(pessoa.dias_restantes)}
          </span>
          <div className="flex gap-1">
            {pessoa.telefone && (
              <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                <a
                  href={`https://wa.me/55${limparTelefone(pessoa.telefone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir WhatsApp"
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={disparando}
              onClick={notificarWhatsapp}
              title="Disparar notificação automática via n8n"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
