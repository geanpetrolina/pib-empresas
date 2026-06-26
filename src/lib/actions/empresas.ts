"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { empresaSchema, type EmpresaFormValues } from "@/lib/validations/schemas";

export async function criarEmpresa(values: EmpresaFormValues) {
  const parsed = empresaSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("empresas")
    .insert({
      ...parsed.data,
      responsavel: parsed.data.responsavel || null,
      telefone: parsed.data.telefone || null,
      email: parsed.data.email || null,
      endereco: parsed.data.endereco || null,
      segmento: parsed.data.segmento || null,
      observacoes: parsed.data.observacoes || null,
      criado_por: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/empresas");
  revalidatePath("/dashboard");
  return { sucesso: true, data };
}

export async function atualizarEmpresa(id: string, values: EmpresaFormValues) {
  const parsed = empresaSchema.safeParse(values);
  if (!parsed.success) {
    return { sucesso: false, erro: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("empresas")
    .update({
      ...parsed.data,
      responsavel: parsed.data.responsavel || null,
      telefone: parsed.data.telefone || null,
      email: parsed.data.email || null,
      endereco: parsed.data.endereco || null,
      segmento: parsed.data.segmento || null,
      observacoes: parsed.data.observacoes || null,
    })
    .eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/empresas");
  revalidatePath(`/empresas/${id}`);
  revalidatePath("/dashboard");
  return { sucesso: true };
}

export async function excluirEmpresa(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("empresas").delete().eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/empresas");
  revalidatePath("/dashboard");
  return { sucesso: true };
}
