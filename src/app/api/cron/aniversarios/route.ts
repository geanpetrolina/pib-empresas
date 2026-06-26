import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Aniversariante } from "@/types/database";

/**
 * GET /api/cron/aniversarios
 *
 * Endpoint para ser chamado uma vez por dia (ex: 07h da manhã) por um
 * agendador externo — n8n Schedule Trigger, cron-job.org, Vercel Cron, etc.
 *
 * Verifica todos os colaboradores que fazem aniversário HOJE, em 2 dias ou
 * em 3 dias, e dispara o webhook correspondente (aniversario_hoje /
 * aniversario_proximo) para cada um, permitindo que o n8n envie mensagens
 * de WhatsApp automaticamente via Evolution API.
 *
 * Protegido por CRON_SECRET via query param `?secret=` ou header Authorization.
 *
 * Exemplo de configuração no n8n: Schedule Trigger (diário, 07:00) -> HTTP Request
 * GET https://seu-dominio.com/api/cron/aniversarios?secret=SEU_CRON_SECRET
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretEsperado = process.env.CRON_SECRET;

  if (secretEsperado) {
    const secretRecebido =
      searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
    if (secretRecebido !== secretEsperado) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
  }

  try {
    const supabase = createServiceRoleClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data, error } = await supabase.rpc("get_aniversariantes", { dias_janela: 3 });
    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    const aniversariantes = (data as Aniversariante[]) ?? [];
    const disparos = await Promise.allSettled(
      aniversariantes.map((pessoa) => {
        const evento = pessoa.dias_restantes === 0 ? "aniversario_hoje" : "aniversario_proximo";
        return fetch(`${baseUrl}/api/webhooks/n8n/disparar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            evento,
            funcionario_id: pessoa.id,
            nome: pessoa.nome,
            telefone: pessoa.telefone,
            empresa_id: pessoa.empresa_id,
            empresa_nome: pessoa.empresa_nome,
            cargo: pessoa.cargo,
            dias_restantes: pessoa.dias_restantes,
            data_nascimento: pessoa.data_nascimento,
          }),
        });
      })
    );

    const sucesso = disparos.filter((d) => d.status === "fulfilled").length;

    return NextResponse.json({
      executado_em: new Date().toISOString(),
      total_aniversariantes: aniversariantes.length,
      disparos_enviados: sucesso,
      disparos_com_falha: disparos.length - sucesso,
    });
  } catch (err) {
    console.error("Erro no cron de aniversários:", err);
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
