import { format, parseISO, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Formata uma data ISO (yyyy-mm-dd) para dd/MM/yyyy */
export function formatarData(dataIso: string | null | undefined): string {
  if (!dataIso) return "—";
  try {
    return format(parseISO(dataIso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

/** Formata uma data ISO para "dd de MMMM" (ex: "15 de março") */
export function formatarDataExtensa(dataIso: string | null | undefined): string {
  if (!dataIso) return "—";
  try {
    return format(parseISO(dataIso), "dd 'de' MMMM", { locale: ptBR });
  } catch {
    return "—";
  }
}

/** Formata data + hora ISO para dd/MM/yyyy às HH:mm */
export function formatarDataHora(dataIso: string | null | undefined): string {
  if (!dataIso) return "—";
  try {
    return format(parseISO(dataIso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

/** Calcula a idade atual (ou idade que a pessoa fará no próximo aniversário) */
export function calcularIdade(dataNascimentoIso: string): number {
  return differenceInYears(new Date(), parseISO(dataNascimentoIso));
}

/** Calcula a idade que a pessoa terá no próximo aniversário */
export function calcularProximaIdade(dataNascimentoIso: string): number {
  return calcularIdade(dataNascimentoIso) + 1;
}

/** Retorna um texto amigável para "dias_restantes" (0 = hoje, 1 = amanhã, etc.) */
export function textoDiasRestantes(diasRestantes: number): string {
  if (diasRestantes === 0) return "Hoje";
  if (diasRestantes === 1) return "Amanhã";
  return `Em ${diasRestantes} dias`;
}

/** Classe de destaque visual conforme proximidade do aniversário */
export function corDestaqueAniversario(diasRestantes: number): {
  badge: string;
  borda: string;
} {
  if (diasRestantes === 0) {
    return {
      badge: "bg-gold-gradient text-pib-navy-950 shadow-gold",
      borda: "border-l-4 border-pib-gold-500",
    };
  }
  if (diasRestantes <= 2) {
    return {
      badge: "bg-pib-gold-100 text-pib-gold-800 dark:bg-pib-gold-900/30 dark:text-pib-gold-300",
      borda: "border-l-4 border-pib-gold-300",
    };
  }
  if (diasRestantes <= 3) {
    return {
      badge: "bg-pib-navy-100 text-pib-navy-700 dark:bg-pib-navy-800/50 dark:text-pib-navy-200",
      borda: "border-l-4 border-pib-navy-300",
    };
  }
  return {
    badge: "bg-muted text-muted-foreground",
    borda: "border-l-4 border-transparent",
  };
}

/** Formata telefone brasileiro (XX) XXXXX-XXXX enquanto o usuário digita */
export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/** Remove formatação do telefone, deixando só dígitos (para salvar/enviar a APIs) */
export function limparTelefone(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Gera iniciais a partir de um nome completo (para Avatar fallback) */
export function obterIniciais(nomeCompleto: string): string {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Mapeia o enum de status de visita para um rótulo amigável em português */
export const VISITA_STATUS_LABEL: Record<string, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  remarcada: "Remarcada",
};

export const ORACAO_STATUS_LABEL: Record<string, string> = {
  aberto: "Em aberto",
  em_oracao: "Em oração",
  respondido: "Respondido",
  arquivado: "Arquivado",
};

export const USER_ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  pastor: "Pastor",
  lider: "Líder",
  voluntario: "Voluntário",
};
