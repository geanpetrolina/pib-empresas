-- ============================================================================
-- PIB EMPRESAS — Schema inicial
-- Primeira Igreja Batista de Petrolina — Gestão de empresas, colaboradores,
-- aniversários, visitas pastorais e pedidos de oração.
-- ============================================================================
-- Como aplicar:
-- 1. Abra o SQL Editor do seu projeto Supabase (https://app.supabase.com)
-- 2. Cole o conteúdo deste arquivo (0001_initial_schema.sql) e execute (Run)
-- 3. Depois execute 0002_rls_policies.sql
-- 4. Depois execute 0003_seed_optional.sql (opcional, dados de exemplo)
-- ============================================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

do $$ begin
  create type user_role as enum ('admin', 'pastor', 'lider', 'voluntario');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visita_status as enum ('agendada', 'realizada', 'cancelada', 'remarcada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type oracao_status as enum ('aberto', 'em_oracao', 'respondido', 'arquivado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type devocional_tom as enum ('encorajador', 'reflexivo', 'celebrativo', 'intercessao');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- TABELA: profiles
-- Estende auth.users do Supabase com dados ministeriais.
-- Criada automaticamente via trigger quando um usuário se cadastra.
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  email text not null,
  telefone text,
  cargo_ministerial text, -- ex: "Pastor Titular", "Líder de Ministério de Empresas"
  role user_role not null default 'voluntario',
  avatar_url text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.profiles is 'Perfis de pastores, líderes e voluntários com acesso ao sistema';

-- ============================================================================
-- TABELA: empresas
-- ============================================================================

create table if not exists public.empresas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  responsavel text,
  telefone text,
  email text,
  endereco text,
  cidade text default 'Petrolina',
  estado text default 'PE',
  segmento text, -- ramo de atividade
  observacoes text,
  ativa boolean not null default true,
  criado_por uuid references public.profiles(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.empresas is 'Empresas visitadas pelo ministério da igreja';
create index if not exists idx_empresas_nome on public.empresas using gin (nome gin_trgm_ops);
create index if not exists idx_empresas_ativa on public.empresas (ativa);

create extension if not exists pg_trgm;

-- ============================================================================
-- TABELA: funcionarios
-- ============================================================================

create table if not exists public.funcionarios (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  data_nascimento date not null,
  empresa_id uuid references public.empresas(id) on delete set null,
  cargo text,
  telefone text,
  email text,
  observacoes text,
  ativo boolean not null default true,
  criado_por uuid references public.profiles(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.funcionarios is 'Colaboradores das empresas vinculadas ao ministério';
create index if not exists idx_funcionarios_empresa on public.funcionarios (empresa_id);
create index if not exists idx_funcionarios_nome on public.funcionarios using gin (nome gin_trgm_ops);
-- Índice para busca eficiente de aniversários por mês/dia (ignorando ano)
create index if not exists idx_funcionarios_aniversario
  on public.funcionarios (extract(month from data_nascimento), extract(day from data_nascimento));

-- ============================================================================
-- TABELA: visitas
-- ============================================================================

create table if not exists public.visitas (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  data_visita date not null default current_date,
  status visita_status not null default 'agendada',
  responsavel_id uuid references public.profiles(id) on delete set null,
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.visitas is 'Registro de visitas pastorais realizadas ou agendadas às empresas';
create index if not exists idx_visitas_empresa on public.visitas (empresa_id);
create index if not exists idx_visitas_data on public.visitas (data_visita desc);
create index if not exists idx_visitas_status on public.visitas (status);

-- ============================================================================
-- TABELA: pedidos_oracao
-- Vinculados a uma visita (e, por consequência, a uma empresa/funcionário)
-- ============================================================================

create table if not exists public.pedidos_oracao (
  id uuid primary key default uuid_generate_v4(),
  visita_id uuid references public.visitas(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete cascade,
  funcionario_id uuid references public.funcionarios(id) on delete set null,
  descricao text not null,
  status oracao_status not null default 'aberto',
  confidencial boolean not null default false,
  criado_por uuid references public.profiles(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.pedidos_oracao is 'Pedidos de oração coletados durante visitas pastorais';
create index if not exists idx_oracao_empresa on public.pedidos_oracao (empresa_id);
create index if not exists idx_oracao_status on public.pedidos_oracao (status);

-- ============================================================================
-- TABELA: devocionais
-- Histórico de devocionais gerados por IA
-- ============================================================================

create table if not exists public.devocionais (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  versiculo_referencia text not null,
  versiculo_texto text not null,
  mensagem text not null,
  oracao text not null,
  tom devocional_tom default 'encorajador',
  contexto_entrada text, -- prompt/contexto usado para gerar (ex: nome da empresa, tema)
  empresa_id uuid references public.empresas(id) on delete set null,
  gerado_por uuid references public.profiles(id) on delete set null,
  criado_em timestamptz not null default now()
);

comment on table public.devocionais is 'Devocionais cristãos gerados por IA, com histórico';
create index if not exists idx_devocionais_criado_em on public.devocionais (criado_em desc);

-- ============================================================================
-- TABELA: notificacoes_log
-- Log de envios/disparos para integração com n8n (WhatsApp etc.)
-- ============================================================================

create table if not exists public.notificacoes_log (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null, -- 'aniversario', 'visita_lembrete', 'pedido_oracao', 'manual'
  destinatario text, -- telefone ou identificador
  payload jsonb,
  status text not null default 'pendente', -- 'pendente' | 'enviado' | 'erro'
  resposta_externa jsonb,
  relacionado_tipo text, -- 'funcionario' | 'empresa' | 'visita'
  relacionado_id uuid,
  criado_em timestamptz not null default now(),
  enviado_em timestamptz
);

comment on table public.notificacoes_log is 'Log de eventos disparados via webhook para automações n8n (WhatsApp etc.)';
create index if not exists idx_notificacoes_status on public.notificacoes_log (status);
create index if not exists idx_notificacoes_tipo on public.notificacoes_log (tipo);

-- ============================================================================
-- TABELA: webhook_configs
-- URLs de webhook n8n configuráveis pela interface (Configurações)
-- ============================================================================

create table if not exists public.webhook_configs (
  id uuid primary key default uuid_generate_v4(),
  nome text not null, -- ex: "n8n - Aniversários WhatsApp"
  evento text not null, -- 'aniversario_hoje' | 'aniversario_proximo' | 'visita_agendada' | 'pedido_oracao_novo'
  url_destino text not null,
  ativo boolean not null default true,
  segredo text, -- usado para assinar o payload (HMAC) se desejado
  criado_em timestamptz not null default now()
);

comment on table public.webhook_configs is 'Configuração de webhooks de saída para n8n por tipo de evento';

-- ============================================================================
-- FUNÇÃO + TRIGGER: atualizar "atualizado_em" automaticamente
-- ============================================================================

create or replace function public.set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_atualizado_em on public.profiles;
create trigger trg_profiles_atualizado_em before update on public.profiles
  for each row execute function public.set_atualizado_em();

drop trigger if exists trg_empresas_atualizado_em on public.empresas;
create trigger trg_empresas_atualizado_em before update on public.empresas
  for each row execute function public.set_atualizado_em();

drop trigger if exists trg_funcionarios_atualizado_em on public.funcionarios;
create trigger trg_funcionarios_atualizado_em before update on public.funcionarios
  for each row execute function public.set_atualizado_em();

drop trigger if exists trg_visitas_atualizado_em on public.visitas;
create trigger trg_visitas_atualizado_em before update on public.visitas
  for each row execute function public.set_atualizado_em();

drop trigger if exists trg_oracao_atualizado_em on public.pedidos_oracao;
create trigger trg_oracao_atualizado_em before update on public.pedidos_oracao
  for each row execute function public.set_atualizado_em();

-- ============================================================================
-- FUNÇÃO + TRIGGER: criar profile automaticamente ao registrar usuário
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome_completo, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'voluntario')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- FUNÇÕES RPC — Aniversários
-- Calculam aniversários por mês/dia, lidando com virada de ano.
-- ============================================================================

create or replace function public.get_aniversariantes(dias_janela int default 3)
returns table (
  id uuid,
  nome text,
  data_nascimento date,
  empresa_id uuid,
  empresa_nome text,
  cargo text,
  telefone text,
  dias_restantes int
) as $$
begin
  return query
  with base as (
    select
      f.id,
      f.nome,
      f.data_nascimento,
      f.empresa_id,
      e.nome as empresa_nome,
      f.cargo,
      f.telefone,
      -- próxima ocorrência do aniversário (este ano ou no próximo, se já passou)
      (
        case
          when make_date(
                 extract(year from current_date)::int,
                 extract(month from f.data_nascimento)::int,
                 extract(day from f.data_nascimento)::int
               ) < current_date
          then make_date(
                 extract(year from current_date)::int + 1,
                 extract(month from f.data_nascimento)::int,
                 extract(day from f.data_nascimento)::int
               )
          else make_date(
                 extract(year from current_date)::int,
                 extract(month from f.data_nascimento)::int,
                 extract(day from f.data_nascimento)::int
               )
        end
      ) as proxima_data
    from public.funcionarios f
    left join public.empresas e on e.id = f.empresa_id
    where f.ativo = true
  )
  select
    base.id,
    base.nome,
    base.data_nascimento,
    base.empresa_id,
    base.empresa_nome,
    base.cargo,
    base.telefone,
    (base.proxima_data - current_date)::int as dias_restantes
  from base
  where (base.proxima_data - current_date) between 0 and dias_janela
  order by dias_restantes asc, base.nome asc;
end;
$$ language plpgsql stable;

comment on function public.get_aniversariantes is 'Retorna funcionários cujo aniversário cai dentro da janela de dias informada (padrão 3), tratando virada de ano e mês fevereiro/29';

-- Função auxiliar para o dashboard: contagens rápidas
create or replace function public.get_dashboard_stats()
returns json as $$
declare
  resultado json;
begin
  select json_build_object(
    'total_empresas', (select count(*) from public.empresas where ativa = true),
    'total_funcionarios', (select count(*) from public.funcionarios where ativo = true),
    'aniversarios_hoje', (select count(*) from public.get_aniversariantes(0)),
    'aniversarios_proximos', (select count(*) from public.get_aniversariantes(7)),
    'visitas_agendadas', (select count(*) from public.visitas where status = 'agendada' and data_visita >= current_date),
    'pedidos_oracao_abertos', (select count(*) from public.pedidos_oracao where status in ('aberto', 'em_oracao'))
  ) into resultado;
  return resultado;
end;
$$ language plpgsql stable;

comment on function public.get_dashboard_stats is 'Retorna contagens agregadas para o Dashboard em uma única chamada';
