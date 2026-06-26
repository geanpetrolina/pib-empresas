import OpenAI from "openai";
import type { DevocionalGerarValues } from "@/lib/validations/schemas";

let _openai: OpenAI | null = null;

/** Inicializa o client OpenAI de forma lazy (apenas quando efetivamente usado). */
function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface DevocionalGerado {
  titulo: string;
  versiculo_referencia: string;
  versiculo_texto: string;
  mensagem: string;
  oracao: string;
}

const TOM_DESCRICAO: Record<string, string> = {
  encorajador: "encorajador e cheio de esperança, lembrando que Deus está no controle e cuida de cada detalhe",
  reflexivo: "reflexivo e contemplativo, convidando a uma pausa para examinar o coração e os caminhos",
  celebrativo: "celebrativo e grato, enfatizando louvor e gratidão pelas bênçãos recebidas",
  intercessao: "voltado à intercessão, mobilizando o leitor a orar por outras pessoas e situações específicas",
};

/**
 * Gera um devocional cristão personalizado usando a OpenAI.
 * Retorna um objeto estruturado em JSON: título, versículo, mensagem e oração.
 */
export async function gerarDevocionalIA(
  params: DevocionalGerarValues & { empresaNome?: string | null }
): Promise<DevocionalGerado> {
  const tomDescricao = TOM_DESCRICAO[params.tom] ?? TOM_DESCRICAO.encorajador;

  const contextoPartes: string[] = [];
  if (params.tema) contextoPartes.push(`Tema solicitado: ${params.tema}.`);
  if (params.empresaNome) {
    contextoPartes.push(
      `Este devocional será compartilhado com os colaboradores da empresa "${params.empresaNome}", visitada pelo ministério empresarial da igreja.`
    );
  }
  if (params.contexto_adicional) contextoPartes.push(`Contexto adicional: ${params.contexto_adicional}.`);

  const systemPrompt = `Você é um assistente que ajuda pastores e líderes cristãos a preparar devocionais curtos para serem compartilhados em visitas pastorais a empresas (clínicas, comércios, etc).

Gere um devocional ${tomDescricao}.

Regras importantes:
- O versículo bíblico deve ser uma referência real e a citação deve ser uma paráfrase fiel ao sentido do texto bíblico em português, NÃO copie literalmente de uma tradução protegida por direitos autorais; escreva com suas próprias palavras mantendo o significado teológico correto.
- A mensagem deve ter entre 3 e 5 parágrafos curtos, linguagem acessível, aplicável ao contexto de trabalho e relações profissionais.
- A oração deve ser curta (3 a 5 frases), em primeira pessoa do plural ("Senhor, nós te agradecemos..."), adequada para ser lida em voz alta ao final de uma visita.
- Evite jargões teológicos complexos. Foque em algo prático e pastoral.
- Responda APENAS em JSON válido, sem markdown, sem comentários, no formato exato:
{"titulo": "...", "versiculo_referencia": "Livro Capítulo:Versículo", "versiculo_texto": "...", "mensagem": "...", "oracao": "..."}`;

  const userPrompt = contextoPartes.length > 0
    ? contextoPartes.join(" ")
    : "Gere um devocional cristão de uso geral para uma visita pastoral a uma empresa.";

  const completion = await getOpenAIClient().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const conteudo = completion.choices[0]?.message?.content;
  if (!conteudo) {
    throw new Error("A OpenAI não retornou conteúdo para o devocional");
  }

  const parsed = JSON.parse(conteudo) as DevocionalGerado;

  if (!parsed.titulo || !parsed.mensagem || !parsed.versiculo_referencia || !parsed.oracao) {
    throw new Error("Resposta da IA incompleta. Tente gerar novamente.");
  }

  return parsed;
}
