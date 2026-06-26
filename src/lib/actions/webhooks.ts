"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { webhookConfigSchema, type WebhookConfigFormValues } from "@/lib/validations/schemas";

export async function criarWebhookConfig(values: WebhookConfigFormValues) {
  const parsed = webhookConfigSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("webhook_configs").insert({
    ...parsed.data,
    segredo: parsed.data.segredo || null,
  });

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/configuracoes");
  return { sucesso: true };
}

export async function atualizarWebhookConfig(id: string, values: WebhookConfigFormValues) {
  const parsed = webhookConfigSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("webhook_configs")
    .update({ ...parsed.data, segredo: parsed.data.segredo || null })
    .eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/configuracoes");
  return { sucesso: true };
}

export async function excluirWebhookConfig(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("webhook_configs").delete().eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/configuracoes");
  return { sucesso: true };
}
