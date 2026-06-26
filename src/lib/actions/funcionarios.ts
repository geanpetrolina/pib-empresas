"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { funcionarioSchema, type FuncionarioFormValues } from "@/lib/validations/schemas";

export async function criarFuncionario(values: FuncionarioFormValues) {
  const parsed = funcionarioSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("funcionarios")
    .insert({
      ...parsed.data,
      empresa_id: parsed.data.empresa_id || null,
      cargo: parsed.data.cargo || null,
      telefone: parsed.data.telefone || null,
      email: parsed.data.email || null,
      observacoes: parsed.data.observacoes || null,
      criado_por: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/funcionarios");
  revalidatePath("/aniversarios");
  revalidatePath("/dashboard");
  if (parsed.data.empresa_id) revalidatePath(`/empresas/${parsed.data.empresa_id}`);
  return { sucesso: true, data };
}

export async function atualizarFuncionario(id: string, values: FuncionarioFormValues) {
  const parsed = funcionarioSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("funcionarios")
    .update({
      ...parsed.data,
      empresa_id: parsed.data.empresa_id || null,
      cargo: parsed.data.cargo || null,
      telefone: parsed.data.telefone || null,
      email: parsed.data.email || null,
      observacoes: parsed.data.observacoes || null,
    })
    .eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/funcionarios");
  revalidatePath(`/funcionarios/${id}`);
  revalidatePath("/aniversarios");
  revalidatePath("/dashboard");
  return { sucesso: true };
}

export async function excluirFuncionario(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("funcionarios").delete().eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/funcionarios");
  revalidatePath("/aniversarios");
  revalidatePath("/dashboard");
  return { sucesso: true };
}
