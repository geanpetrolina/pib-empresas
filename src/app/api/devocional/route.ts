import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { devocionalGerarSchema } from "@/lib/validations/schemas";
import { gerarDevocionalIA } from "@/lib/ai/devocional";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = devocionalGerarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { erro: parsed.error.errors[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { erro: "OPENAI_API_KEY não configurada no servidor. Configure a variável de ambiente." },
        { status: 500 }
      );
    }

    let empresaNome: string | null = null;
    if (parsed.data.empresa_id) {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("nome")
        .eq("id", parsed.data.empresa_id)
        .single();
      empresaNome = empresa?.nome ?? null;
    }

    const devocionalGerado = await gerarDevocionalIA({ ...parsed.data, empresaNome });

    const { data: devocionalSalvo, error } = await supabase
      .from("devocionais")
      .insert({
        titulo: devocionalGerado.titulo,
        versiculo_referencia: devocionalGerado.versiculo_referencia,
        versiculo_texto: devocionalGerado.versiculo_texto,
        mensagem: devocionalGerado.mensagem,
        oracao: devocionalGerado.oracao,
        tom: parsed.data.tom,
        contexto_entrada: parsed.data.tema || parsed.data.contexto_adicional || null,
        empresa_id: parsed.data.empresa_id || null,
        gerado_por: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({ devocional: devocionalSalvo });
  } catch (err) {
    console.error("Erro ao gerar devocional:", err);
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido ao gerar devocional";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
