# PIB Empresas

Sistema de gestão de empresas, colaboradores, aniversários, visitas pastorais e pedidos de oração — desenvolvido para o ministério empresarial da **Primeira Igreja Batista de Petrolina**.

Visual premium em azul-marinho e dourado, mobile-first, com Devocional gerado por IA e integração com n8n para automações de WhatsApp.

---

## Stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **Supabase** (Postgres + Auth + Row Level Security)
- **Tailwind CSS** + **shadcn/ui**
- **OpenAI API** (geração do Devocional IA)
- **n8n** (webhooks de notificação, ex: WhatsApp via Evolution API)

---

## 1. Configurar o Supabase

Você já tem um projeto Supabase. Siga estes passos:

1. Abra o **SQL Editor** do seu projeto em [app.supabase.com](https://app.supabase.com)
2. Execute, **na ordem**, os arquivos em `supabase/migrations/`:
   1. `0001_initial_schema.sql` — cria tabelas, enums, índices, triggers e funções RPC
   2. `0002_rls_policies.sql` — ativa Row Level Security e define as políticas de acesso
   3. `0003_seed_optional.sql` — **opcional**, popula dados de exemplo para testes (não execute em produção real)
3. Em **Authentication > Providers**, confirme que **Email** está habilitado (login por e-mail/senha)
4. Em **Authentication > Users**, crie os primeiros usuários (pastores/líderes) manualmente, ou peça que se registrem (você pode desabilitar o self-signup em Authentication > Settings se quiser controlar quem entra)
5. Para definir o `role` de um usuário (admin, pastor, lider, voluntario), edite a tabela `profiles` diretamente no Table Editor após o primeiro login — o trigger cria o profile automaticamente com `role = 'voluntario'` por padrão.

> **Importante:** o trigger `handle_new_user` cria automaticamente uma linha em `profiles` sempre que um novo usuário se registra em `auth.users`. Não é necessário criar profiles manualmente.

### Modelo de permissões (RLS)

| Ação | Quem pode |
|---|---|
| Ler empresas, funcionários, visitas, devocionais | Qualquer usuário autenticado e ativo |
| Criar/editar empresas, funcionários, visitas | Qualquer usuário autenticado e ativo |
| Excluir empresas, funcionários, visitas | Apenas `admin` ou `pastor` |
| Ler pedidos de oração confidenciais | Apenas `admin`/`pastor` ou quem criou o registro |
| Gerenciar webhooks (Configurações) | Apenas `admin` ou `pastor` |
| Gerenciar profiles de outros usuários | Apenas `admin` ou `pastor` |

---

## 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (⚠️ secreta, nunca expor no client) |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `OPENAI_MODEL` | `gpt-4o-mini` (padrão, custo baixo) ou outro modelo de sua preferência |
| `WEBHOOK_INBOUND_SECRET` | Defina uma string aleatória forte — usada para validar chamadas do n8n para o sistema |
| `CRON_SECRET` | Defina outra string aleatória forte — protege o endpoint de cron de aniversários |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação (ex: `https://pib-empresas.vercel.app`) |

---

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

---

## 4. Deploy (recomendado: Vercel)

1. Suba este projeto para um repositório Git (GitHub/GitLab)
2. Importe o repositório na [Vercel](https://vercel.com/new)
3. Configure todas as variáveis de ambiente da seção 2 em **Project Settings → Environment Variables**
4. Atualize `NEXT_PUBLIC_APP_URL` para a URL final gerada pela Vercel
5. Deploy

O projeto também funciona em qualquer host que suporte Next.js (Node.js 18+): Railway, Render, um VPS com `next start`, etc.

---

## 5. Integração com n8n (WhatsApp e outras notificações)

O sistema **dispara eventos automaticamente** para qualquer webhook do n8n cadastrado na tela **Configurações**. Não é necessário alterar código para adicionar uma nova automação.

### Como conectar

1. No n8n, crie um workflow com um nó **Webhook** (Trigger)
2. Copie a URL gerada (modo "Production")
3. No PIB Empresas, vá em **Configurações → Webhooks n8n → Novo webhook**
4. Escolha o **evento** que deseja escutar:
   - `aniversario_hoje` — disparado quando alguém faz aniversário hoje (via cron diário, veja seção 6)
   - `aniversario_proximo` — disparado para aniversários em 2 ou 3 dias
   - `visita_agendada` — disparado ao registrar uma nova visita
   - `visita_realizada` — disparado quando o status de uma visita muda para "realizada"
   - `pedido_oracao_novo` — disparado ao registrar um novo pedido de oração
5. Cole a URL do webhook e salve

### Payload enviado ao n8n

```json
{
  "evento": "aniversario_hoje",
  "timestamp": "2026-06-24T10:00:00.000Z",
  "funcionario_id": "uuid",
  "nome": "Ana Paula Ferreira",
  "telefone": "87999998888",
  "empresa_nome": "Clínica Vida Plena",
  "dias_restantes": 0
}
```

A partir daí, monte no n8n a lógica de envio via **Evolution API** (ou qualquer provedor de WhatsApp), formatando a mensagem como preferir.

### Segurança (opcional, recomendado)

Se preencher o campo **Segredo HMAC** ao cadastrar o webhook, toda requisição enviada incluirá o header `X-PIB-Signature` com um HMAC-SHA256 do corpo da requisição, assinado com esse segredo — use isso no n8n (nó Function/Code) para validar a autenticidade da chamada antes de processar.

### Callback de volta (n8n → sistema)

Caso queira que o n8n confirme entregas de volta para o sistema (ex: registrar que a mensagem de WhatsApp foi enviada com sucesso), use um nó **HTTP Request** no n8n apontando para:

```
POST https://seu-dominio.com/api/webhooks/n8n
Authorization: Bearer SEU_WEBHOOK_INBOUND_SECRET
Content-Type: application/json

{
  "tipo": "confirmacao_entrega",
  "destinatario": "87999998888",
  "detalhes": { "status": "entregue" }
}
```

---

## 6. Cron diário de aniversários

O endpoint `GET /api/cron/aniversarios` verifica todos os aniversários de hoje, em 2 e em 3 dias, e dispara automaticamente os webhooks `aniversario_hoje` / `aniversario_proximo` configurados.

Configure um agendador externo para chamá-lo **uma vez por dia** (sugestão: 07h da manhã):

**Opção A — n8n (Schedule Trigger):**
1. Crie um workflow com um nó **Schedule Trigger** (diário, 07:00)
2. Adicione um nó **HTTP Request**: `GET https://seu-dominio.com/api/cron/aniversarios?secret=SEU_CRON_SECRET`

**Opção B — cron-job.org (gratuito):**
1. Crie uma conta em [cron-job.org](https://cron-job.org)
2. Configure uma tarefa diária apontando para a mesma URL acima

**Opção C — Vercel Cron Jobs:**
Adicione ao `vercel.json`:
```json
{
  "crons": [{ "path": "/api/cron/aniversarios?secret=SEU_CRON_SECRET", "schedule": "0 10 * * *" }]
}
```
(horário em UTC; `0 10 * * *` ≈ 07h em Petrolina/Brasília)

---

## 7. Devocional IA

A tela **Devocional IA** gera, via OpenAI, um devocional completo (título, versículo, mensagem e oração) personalizado por tema, tom e empresa. Todo devocional gerado é salvo automaticamente no histórico (tabela `devocionais`).

Custo aproximado por geração com `gpt-4o-mini`: poucos centavos de dólar por chamada.

---

## 8. Estrutura do projeto

```
src/
  app/
    (auth)/login/          → tela de login
    (dashboard)/           → todas as telas autenticadas (sidebar + header + bottom nav)
      dashboard/           → visão geral com estatísticas e widgets
      empresas/            → CRUD de empresas + página de detalhe
      funcionarios/         → CRUD de colaboradores + página de detalhe
      aniversarios/         → painel de aniversários (hoje / 2 dias / 3 dias / filtro)
      visitas/              → registro e histórico de visitas + pedidos de oração
      devocional/           → geração de devocional IA + histórico
      configuracoes/        → perfil do usuário + gerenciamento de webhooks n8n
    api/
      devocional/           → geração via OpenAI
      webhooks/n8n/         → disparo (saída) e recebimento (entrada) de eventos
      cron/aniversarios/    → verificação diária de aniversários
  components/               → componentes de UI organizados por domínio
  lib/
    actions/                → Server Actions (mutações de dados)
    ai/                     → integração com OpenAI
    supabase/                → clients Supabase (browser, server, service role)
    validations/             → schemas Zod
    utils/                   → formatação, datas, helpers
  types/database.ts          → tipos TypeScript espelhando o schema SQL
supabase/migrations/          → SQL para colar no Supabase (schema, RLS, seed)
```

---

## 9. Próximos passos sugeridos

- Configurar storage do Supabase para upload de foto de perfil (`avatar_url` já existe no schema)
- Adicionar relatórios/exportação (PDF ou Excel) do histórico de visitas
- Criar tela de gestão de usuários (convidar novos pastores/líderes) usando a Service Role Key
- Adicionar push notifications via PWA para aniversários do dia
