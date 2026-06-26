"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { visitaSchema, type VisitaFormValues, pedidoOracaoSchema, type PedidoOracaoFormValues } from "@/lib/validations/schemas";

export async function criarVisita(values: VisitaFormValues) {
  const parsed = visitaSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("visitas")
    .insert({
      ...parsed.data,
      responsavel_id: parsed.data.responsavel_id || user?.id || null,
      observacoes: parsed.data.observacoes || null,
    })
    .select()
    .single();

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  // Dispara notificação para n8n de forma best-effort (não bloqueia o fluxo principal)
  try {
    await dispararWebhookEvento("visita_agendada", { visita_id: data.id, empresa_id: data.empresa_id });
  } catch {
    // Falha de notificação não deve impedir o cadastro da visita
  }

  revalidatePath("/visitas");
  revalidatePath(`/empresas/${parsed.data.empresa_id}`);
  revalidatePath("/dashboard");
  return { sucesso: true, data };
}

export async function atualizarVisita(id: string, values: VisitaFormValues) {
  const parsed = visitaSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("visitas")
    .update({
      ...parsed.data,
      responsavel_id: parsed.data.responsavel_id || null,
      observacoes: parsed.data.observacoes || null,
    })
    .eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  if (parsed.data.status === "realizada") {
    try {
      await dispararWebhookEvento("visita_realizada", { visita_id: id, empresa_id: parsed.data.empresa_id });
    } catch {
      // best-effort
    }
  }

  revalidatePath("/visitas");
  revalidatePath(`/visitas/${id}`);
  revalidatePath(`/empresas/${parsed.data.empresa_id}`);
  revalidatePath("/dashboard");
  return { sucesso: true };
}

export async function excluirVisita(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("visitas").delete().eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/visitas");
  revalidatePath("/dashboard");
  return { sucesso: true };
}

export async function criarPedidoOracao(values: PedidoOracaoFormValues) {
  const parsed = pedidoOracaoSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("pedidos_oracao")
    .insert({
      ...parsed.data,
      criado_por: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  try {
    await dispararWebhookEvento("pedido_oracao_novo", { pedido_id: data.id, empresa_id: parsed.data.empresa_id });
  } catch {
    // best-effort
  }

  revalidatePath("/visitas");
  if (parsed.data.visita_id) revalidatePath(`/visitas/${parsed.data.visita_id}`);
  if (parsed.data.empresa_id) revalidatePath(`/empresas/${parsed.data.empresa_id}`);
  revalidatePath("/dashboard");
  return { sucesso: true, data };
}

export async function atualizarStatusPedidoOracao(id: string, status: PedidoOracaoFormValues["status"]) {
  const supabase = createClient();
  const { error } = await supabase.from("pedidos_oracao").update({ status }).eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/visitas");
  return { sucesso: true };
}

/**
 * Dispara um evento de webhook para todas as integrações n8n ativas
 * cadastradas na tabela webhook_configs para o evento informado.
 * Usa a API route interna /api/webhooks/n8n/disparar.
 */
async function dispararWebhookEvento(evento: string, payload: Record<string, unknown>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await fetch(`${baseUrl}/api/webhooks/n8n/disparar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evento, ...payload }),
  });
}
