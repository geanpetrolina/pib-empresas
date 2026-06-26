import { z } from "zod";

export const empresaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da empresa").max(200),
  responsavel: z.string().max(150).optional().or(z.literal("")),
  telefone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  endereco: z.string().max(300).optional().or(z.literal("")),
  cidade: z.string().max(100).optional().or(z.literal("")),
  estado: z.string().max(2).optional().or(z.literal("")),
  segmento: z.string().max(100).optional().or(z.literal("")),
  observacoes: z.string().max(2000).optional().or(z.literal("")),
  ativa: z.boolean().default(true),
});

export type EmpresaFormValues = z.infer<typeof empresaSchema>;

export const funcionarioSchema = z.object({
  nome: z.string().min(2, "Informe o nome do colaborador").max(200),
  data_nascimento: z
    .string()
    .min(1, "Informe a data de nascimento")
    .refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  empresa_id: z.string().uuid("Selecione uma empresa").nullable().optional(),
  cargo: z.string().max(100).optional().or(z.literal("")),
  telefone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  observacoes: z.string().max(2000).optional().or(z.literal("")),
  ativo: z.boolean().default(true),
});

export type FuncionarioFormValues = z.infer<typeof funcionarioSchema>;

export const visitaSchema = z.object({
  empresa_id: z.string().uuid("Selecione uma empresa"),
  data_visita: z.string().min(1, "Informe a data da visita"),
  status: z.enum(["agendada", "realizada", "cancelada", "remarcada"]).default("agendada"),
  responsavel_id: z.string().uuid().nullable().optional(),
  observacoes: z.string().max(3000).optional().or(z.literal("")),
});

export type VisitaFormValues = z.infer<typeof visitaSchema>;

export const pedidoOracaoSchema = z.object({
  descricao: z.string().min(3, "Descreva o pedido de oração").max(2000),
  empresa_id: z.string().uuid().nullable().optional(),
  funcionario_id: z.string().uuid().nullable().optional(),
  visita_id: z.string().uuid().nullable().optional(),
  confidencial: z.boolean().default(false),
  status: z.enum(["aberto", "em_oracao", "respondido", "arquivado"]).default("aberto"),
});

export type PedidoOracaoFormValues = z.infer<typeof pedidoOracaoSchema>;

export const devocionalGerarSchema = z.object({
  tema: z.string().max(300).optional().or(z.literal("")),
  tom: z.enum(["encorajador", "reflexivo", "celebrativo", "intercessao"]).default("encorajador"),
  empresa_id: z.string().uuid().nullable().optional(),
  contexto_adicional: z.string().max(1000).optional().or(z.literal("")),
});

export type DevocionalGerarValues = z.infer<typeof devocionalGerarSchema>;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const webhookConfigSchema = z.object({
  nome: z.string().min(2, "Dê um nome para identificar este webhook"),
  evento: z.enum([
    "aniversario_hoje",
    "aniversario_proximo",
    "visita_agendada",
    "visita_realizada",
    "pedido_oracao_novo",
  ]),
  url_destino: z.string().url("Informe uma URL válida"),
  ativo: z.boolean().default(true),
  segredo: z.string().max(200).optional().or(z.literal("")),
});

export type WebhookConfigFormValues = z.infer<typeof webhookConfigSchema>;
