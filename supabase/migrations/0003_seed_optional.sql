-- ============================================================================
-- PIB EMPRESAS — Dados de exemplo (OPCIONAL)
-- Execute somente se quiser testar o sistema com dados fictícios.
-- Não execute em produção com dados reais já cadastrados.
-- ============================================================================

insert into public.empresas (nome, responsavel, telefone, email, endereco, segmento, observacoes)
values
  ('Clínica Vida Plena', 'Dra. Marina Souza', '(87) 99111-2233', 'contato@vidaplena.com.br', 'Av. Cardoso de Sá, 120, Petrolina - PE', 'Saúde', 'Empresa muito receptiva às visitas. Diretora é evangélica.'),
  ('Mercado São José', 'José Carlos Lima', '(87) 99222-3344', 'saojose@email.com', 'Rua Coronel José Cardoso, 45, Petrolina - PE', 'Varejo', 'Visitas mensais. Funcionários pediram oração pela saúde do proprietário.'),
  ('Auto Peças Petrolina', 'Antônio Ferreira', '(87) 99333-4455', null, 'BR-235, Km 12, Petrolina - PE', 'Automotivo', null)
on conflict do nothing;

-- Funcionários de exemplo (vinculados pela ordem de criação das empresas acima)
do $$
declare
  v_empresa_1 uuid;
  v_empresa_2 uuid;
begin
  select id into v_empresa_1 from public.empresas where nome = 'Clínica Vida Plena' limit 1;
  select id into v_empresa_2 from public.empresas where nome = 'Mercado São José' limit 1;

  insert into public.funcionarios (nome, data_nascimento, empresa_id, cargo, telefone, email)
  values
    ('Ana Paula Ferreira', (current_date), v_empresa_1, 'Recepcionista', '(87) 99888-1111', 'ana@vidaplena.com.br'),
    ('Carlos Eduardo Souza', (current_date + interval '2 days')::date, v_empresa_1, 'Enfermeiro', '(87) 99888-2222', null),
    ('Joana Lima', (current_date + interval '3 days')::date, v_empresa_2, 'Caixa', '(87) 99888-3333', null),
    ('Roberto Alves', (current_date - interval '40 days')::date, v_empresa_2, 'Estoquista', null, null)
  on conflict do nothing;
end $$;
