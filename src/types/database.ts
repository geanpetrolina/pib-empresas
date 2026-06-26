// ============================================================================
// Tipos do banco de dados Supabase — espelham o schema SQL em supabase/migrations
// ============================================================================

export type UserRole = "admin" | "pastor" | "lider" | "voluntario";
export type VisitaStatus = "agendada" | "realizada" | "cancelada" | "remarcada";
export type OracaoStatus = "aberto" | "em_oracao" | "respondido" | "arquivado";
export type DevocionalTom = "encorajador" | "reflexivo" | "celebrativo" | "intercessao";

export type Profile = {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string | null;
  cargo_ministerial: string | null;
  role: UserRole;
  avatar_url: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
};

export type Empresa = {
  id: string;
  nome: string;
  responsavel: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  segmento: string | null;
  observacoes: string | null;
  ativa: boolean;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Funcionario = {
  id: string;
  nome: string;
  data_nascimento: string; // ISO date (yyyy-mm-dd)
  empresa_id: string | null;
  cargo: string | null;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  ativo: boolean;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
  // Joins opcionais
  empresa?: Pick<Empresa, "id" | "nome"> | null;
};

export type Visita = {
  id: string;
  empresa_id: string;
  data_visita: string;
  status: VisitaStatus;
  responsavel_id: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
  empresa?: Pick<Empresa, "id" | "nome"> | null;
  responsavel?: Pick<Profile, "id" | "nome_completo"> | null;
  pedidos_oracao?: PedidoOracao[];
};

export type PedidoOracao = {
  id: string;
  visita_id: string | null;
  empresa_id: string | null;
  funcionario_id: string | null;
  descricao: string;
  status: OracaoStatus;
  confidencial: boolean;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
  empresa?: Pick<Empresa, "id" | "nome"> | null;
  funcionario?: Pick<Funcionario, "id" | "nome"> | null;
};

export type Devocional = {
  id: string;
  titulo: string;
  versiculo_referencia: string;
  versiculo_texto: string;
  mensagem: string;
  oracao: string;
  tom: DevocionalTom;
  contexto_entrada: string | null;
  empresa_id: string | null;
  gerado_por: string | null;
  criado_em: string;
  empresa?: Pick<Empresa, "id" | "nome"> | null;
};

export type NotificacaoLog = {
  id: string;
  tipo: string;
  destinatario: string | null;
  payload: Record<string, unknown> | null;
  status: "pendente" | "enviado" | "erro";
  resposta_externa: Record<string, unknown> | null;
  relacionado_tipo: string | null;
  relacionado_id: string | null;
  criado_em: string;
  enviado_em: string | null;
};

export type WebhookConfig = {
  id: string;
  nome: string;
  evento: string;
  url_destino: string;
  ativo: boolean;
  segredo: string | null;
  criado_em: string;
};

export type Aniversariante = {
  id: string;
  nome: string;
  data_nascimento: string;
  empresa_id: string | null;
  empresa_nome: string | null;
  cargo: string | null;
  telefone: string | null;
  dias_restantes: number;
};

export type DashboardStats = {
  total_empresas: number;
  total_funcionarios: number;
  aniversarios_hoje: number;
  aniversarios_proximos: number;
  visitas_agendadas: number;
  pedidos_oracao_abertos: number;
};

// ============================================================================
// Tipo Database completo para o client tipado do Supabase
// ============================================================================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; nome_completo: string; email: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      empresas: {
        Row: Empresa;
        Insert: Partial<Empresa> & { nome: string };
        Update: Partial<Empresa>;
        Relationships: [];
      };
      funcionarios: {
        Row: Funcionario;
        Insert: Partial<Funcionario> & { nome: string; data_nascimento: string };
        Update: Partial<Funcionario>;
        Relationships: [];
      };
      visitas: {
        Row: Visita;
        Insert: Partial<Visita> & { empresa_id: string };
        Update: Partial<Visita>;
        Relationships: [];
      };
      pedidos_oracao: {
        Row: PedidoOracao;
        Insert: Partial<PedidoOracao> & { descricao: string };
        Update: Partial<PedidoOracao>;
        Relationships: [];
      };
      devocionais: {
        Row: Devocional;
        Insert: Partial<Devocional> & {
          titulo: string;
          versiculo_referencia: string;
          versiculo_texto: string;
          mensagem: string;
          oracao: string;
        };
        Update: Partial<Devocional>;
        Relationships: [];
      };
      notificacoes_log: {
        Row: NotificacaoLog;
        Insert: Partial<NotificacaoLog> & { tipo: string };
        Update: Partial<NotificacaoLog>;
        Relationships: [];
      };
      webhook_configs: {
        Row: WebhookConfig;
        Insert: Partial<WebhookConfig> & { nome: string; evento: string; url_destino: string };
        Update: Partial<WebhookConfig>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_aniversariantes: {
        Args: { dias_janela: number };
        Returns: Aniversariante[];
      };
      get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: DashboardStats;
      };
    };
    Enums: {
      user_role: UserRole;
      visita_status: VisitaStatus;
      oracao_status: OracaoStatus;
      devocional_tom: DevocionalTom;
    };
    CompositeTypes: Record<string, never>;
  };
}

