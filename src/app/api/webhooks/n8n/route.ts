import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * POST /api/webhooks/n8n
 *
 * Endpoint de ENTRADA — chamado pelo n8n para informar o sistema sobre
 * eventos externos, como confirmação de envio/entrega de WhatsApp,
 * respostas recebidas de colaboradores, etc.
 *
 * Protegido por um header de segredo simples (Bearer token), configurado
 * em WEBHOOK_INBOUND_SECRET. Configure o mesmo valor no nó HTTP Request do n8n.
 *
 * Body esperado (flexível, conforme o evento):
 * {
 *   "tipo": "confirmacao_entrega" | "resposta_recebida" | "erro_envio",
 *   "notificacao_id": "uuid-do-log-original" (opcional),
 *   "destinatario": "5587999999999",
 *   "detalhes": { ... }
 * }
 */
export async function POST(request: Request) {
  const secretEsperado = process.env.WEBHOOK_INBOUND_SECRET;

  if (secretEsperado) {
    const authHeader = request.headers.get("authorization");
    const tokenRecebido = authHeader?.replace("Bearer ", "");
    if (tokenRecebido !== secretEsperado) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("notificacoes_log").insert({
      tipo: body.tipo ?? "callback_n8n",
      destinatario: body.destinatario ?? null,
      payload: body,
      status: "enviado",
      resposta_externa: body.detalhes ?? null,
      relacionado_tipo: body.relacionado_tipo ?? null,
      relacionado_id: body.notificacao_id ?? null,
      enviado_em: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({ recebido: true });
  } catch (err) {
    console.error("Erro ao processar webhook de entrada n8n:", err);
    return NextResponse.json({ erro: "Payload inválido" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    descricao: "Endpoint de webhooks do PIB Empresas. Use POST para enviar eventos.",
  });
}
