import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * POST /api/webhooks/n8n/disparar
 *
 * Endpoint interno chamado pelo próprio sistema (Server Actions, cron, ou UI)
 * sempre que um evento relevante ocorre (aniversário, visita, pedido de oração).
 *
 * Body esperado:
 * {
 *   "evento": "aniversario_hoje" | "aniversario_proximo" | "visita_agendada" | "visita_realizada" | "pedido_oracao_novo",
 *   ...payload livre relacionado ao evento
 * }
 *
 * Busca todos os webhooks ativos cadastrados em `webhook_configs` para o evento
 * informado e envia o payload via POST para cada `url_destino` (tipicamente uma
 * URL de Webhook Trigger do n8n), que então decide como notificar via WhatsApp
 * (ex: usando a Evolution API).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { evento, ...payload } = body;

    if (!evento) {
      return NextResponse.json({ erro: "Campo 'evento' é obrigatório" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: webhooks, error } = await supabase
      .from("webhook_configs")
      .select("*")
      .eq("evento", evento)
      .eq("ativo", true);

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    if (!webhooks || webhooks.length === 0) {
      // Não é um erro: simplesmente não há integração configurada para este evento ainda.
      return NextResponse.json({ enviado: false, motivo: "Nenhum webhook ativo configurado para este evento" });
    }

    const resultados = await Promise.allSettled(
      webhooks.map(async (webhook: { id: string; url_destino: string; segredo: string | null }) => {
        const payloadFinal = {
          evento,
          timestamp: new Date().toISOString(),
          ...payload,
        };

        const headers: Record<string, string> = { "Content-Type": "application/json" };

        // Se um segredo estiver configurado, assina o payload via HMAC-SHA256
        // para que o n8n possa validar a autenticidade da chamada.
        if (webhook.segredo) {
          const assinatura = crypto
            .createHmac("sha256", webhook.segredo)
            .update(JSON.stringify(payloadFinal))
            .digest("hex");
          headers["X-PIB-Signature"] = assinatura;
        }

        const resposta = await fetch(webhook.url_destino, {
          method: "POST",
          headers,
          body: JSON.stringify(payloadFinal),
        });

        const respostaTexto = await resposta.text().catch(() => "");

        await supabase.from("notificacoes_log").insert({
          tipo: evento,
          destinatario: webhook.url_destino,
          payload: payloadFinal,
          status: resposta.ok ? "enviado" : "erro",
          resposta_externa: { status: resposta.status, body: respostaTexto.slice(0, 2000) },
          enviado_em: new Date().toISOString(),
        });

        return { webhook_id: webhook.id, ok: resposta.ok };
      })
    );

    return NextResponse.json({ enviado: true, resultados: resultados.length });
  } catch (err) {
    console.error("Erro ao disparar webhook n8n:", err);
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
