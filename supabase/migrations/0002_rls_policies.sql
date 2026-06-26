-- ============================================================================
-- PIB EMPRESAS — Políticas de Row Level Security (RLS)
-- Execute após 0001_initial_schema.sql
-- ============================================================================
-- Modelo de acesso:
--  - Qualquer usuário autenticado (pastor/líder/voluntário) com profile ativo
--    pode LER tudo (empresas, funcionários, visitas, devocionais).
--  - Para ESCRITA (insert/update/delete) em empresas/funcionários/visitas,
--    qualquer usuário autenticado ativo pode criar/editar (uso colaborativo
--    do time ministerial).
--  - Pedidos de oração marcados como "confidencial" só podem ser lidos por
--    admin/pastor, ou por quem criou o registro.
--  - Apenas admin pode gerenciar profiles de outros usuários e webhook_configs.
--  - service_role (backend/API routes/n8n) tem acesso total, como padrão do Supabase.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.empresas enable row level security;
alter table public.funcionarios enable row level security;
alter table public.visitas enable row level security;
alter table public.pedidos_oracao enable row level security;
alter table public.devocionais enable row level security;
alter table public.notificacoes_log enable row level security;
alter table public.webhook_configs enable row level security;

-- ----------------------------------------------------------------------------
-- Função auxiliar: verifica se o usuário autenticado é admin ou pastor
-- ----------------------------------------------------------------------------
create or replace function public.is_admin_or_pastor()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'pastor')
    and ativo = true
  );
$$ language sql security definer stable;

create or replace function public.is_active_user()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and ativo = true
  );
$$ language sql security definer stable;

-- ----------------------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin_or_pastor());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin_or_pastor());

drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin_or_pastor());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin_or_pastor());

-- ----------------------------------------------------------------------------
-- EMPRESAS — leitura e escrita para qualquer usuário ativo
-- ----------------------------------------------------------------------------
drop policy if exists "empresas_select_authenticated" on public.empresas;
create policy "empresas_select_authenticated"
  on public.empresas for select
  using (public.is_active_user());

drop policy if exists "empresas_insert_authenticated" on public.empresas;
create policy "empresas_insert_authenticated"
  on public.empresas for insert
  with check (public.is_active_user());

drop policy if exists "empresas_update_authenticated" on public.empresas;
create policy "empresas_update_authenticated"
  on public.empresas for update
  using (public.is_active_user());

drop policy if exists "empresas_delete_admin_pastor" on public.empresas;
create policy "empresas_delete_admin_pastor"
  on public.empresas for delete
  using (public.is_admin_or_pastor());

-- ----------------------------------------------------------------------------
-- FUNCIONARIOS
-- ----------------------------------------------------------------------------
drop policy if exists "funcionarios_select_authenticated" on public.funcionarios;
create policy "funcionarios_select_authenticated"
  on public.funcionarios for select
  using (public.is_active_user());

drop policy if exists "funcionarios_insert_authenticated" on public.funcionarios;
create policy "funcionarios_insert_authenticated"
  on public.funcionarios for insert
  with check (public.is_active_user());

drop policy if exists "funcionarios_update_authenticated" on public.funcionarios;
create policy "funcionarios_update_authenticated"
  on public.funcionarios for update
  using (public.is_active_user());

drop policy if exists "funcionarios_delete_admin_pastor" on public.funcionarios;
create policy "funcionarios_delete_admin_pastor"
  on public.funcionarios for delete
  using (public.is_admin_or_pastor());

-- ----------------------------------------------------------------------------
-- VISITAS
-- ----------------------------------------------------------------------------
drop policy if exists "visitas_select_authenticated" on public.visitas;
create policy "visitas_select_authenticated"
  on public.visitas for select
  using (public.is_active_user());

drop policy if exists "visitas_insert_authenticated" on public.visitas;
create policy "visitas_insert_authenticated"
  on public.visitas for insert
  with check (public.is_active_user());

drop policy if exists "visitas_update_authenticated" on public.visitas;
create policy "visitas_update_authenticated"
  on public.visitas for update
  using (public.is_active_user());

drop policy if exists "visitas_delete_admin_pastor" on public.visitas;
create policy "visitas_delete_admin_pastor"
  on public.visitas for delete
  using (public.is_admin_or_pastor());

-- ----------------------------------------------------------------------------
-- PEDIDOS_ORACAO — confidenciais só para admin/pastor ou autor
-- ----------------------------------------------------------------------------
drop policy if exists "oracao_select_nao_confidencial_ou_autor" on public.pedidos_oracao;
create policy "oracao_select_nao_confidencial_ou_autor"
  on public.pedidos_oracao for select
  using (
    public.is_active_user()
    and (confidencial = false or criado_por = auth.uid() or public.is_admin_or_pastor())
  );

drop policy if exists "oracao_insert_authenticated" on public.pedidos_oracao;
create policy "oracao_insert_authenticated"
  on public.pedidos_oracao for insert
  with check (public.is_active_user());

drop policy if exists "oracao_update_autor_ou_admin" on public.pedidos_oracao;
create policy "oracao_update_autor_ou_admin"
  on public.pedidos_oracao for update
  using (criado_por = auth.uid() or public.is_admin_or_pastor());

drop policy if exists "oracao_delete_admin_pastor" on public.pedidos_oracao;
create policy "oracao_delete_admin_pastor"
  on public.pedidos_oracao for delete
  using (public.is_admin_or_pastor());

-- ----------------------------------------------------------------------------
-- DEVOCIONAIS
-- ----------------------------------------------------------------------------
drop policy if exists "devocionais_select_authenticated" on public.devocionais;
create policy "devocionais_select_authenticated"
  on public.devocionais for select
  using (public.is_active_user());

drop policy if exists "devocionais_insert_authenticated" on public.devocionais;
create policy "devocionais_insert_authenticated"
  on public.devocionais for insert
  with check (public.is_active_user());

drop policy if exists "devocionais_delete_admin_pastor" on public.devocionais;
create policy "devocionais_delete_admin_pastor"
  on public.devocionais for delete
  using (public.is_admin_or_pastor());

-- ----------------------------------------------------------------------------
-- NOTIFICACOES_LOG — leitura para admin/pastor; escrita via service_role (API)
-- ----------------------------------------------------------------------------
drop policy if exists "notificacoes_select_admin_pastor" on public.notificacoes_log;
create policy "notificacoes_select_admin_pastor"
  on public.notificacoes_log for select
  using (public.is_admin_or_pastor());

-- Sem policy de insert/update para usuários autenticados: apenas service_role
-- (usado pelas API routes do Next.js, que usam a service key) pode escrever.

-- ----------------------------------------------------------------------------
-- WEBHOOK_CONFIGS — somente admin/pastor
-- ----------------------------------------------------------------------------
drop policy if exists "webhooks_select_admin_pastor" on public.webhook_configs;
create policy "webhooks_select_admin_pastor"
  on public.webhook_configs for select
  using (public.is_admin_or_pastor());

drop policy if exists "webhooks_insert_admin_pastor" on public.webhook_configs;
create policy "webhooks_insert_admin_pastor"
  on public.webhook_configs for insert
  with check (public.is_admin_or_pastor());

drop policy if exists "webhooks_update_admin_pastor" on public.webhook_configs;
create policy "webhooks_update_admin_pastor"
  on public.webhook_configs for update
  using (public.is_admin_or_pastor());

drop policy if exists "webhooks_delete_admin_pastor" on public.webhook_configs;
create policy "webhooks_delete_admin_pastor"
  on public.webhook_configs for delete
  using (public.is_admin_or_pastor());
