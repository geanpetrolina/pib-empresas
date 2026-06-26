import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { PerfilCard } from "@/components/configuracoes/perfil-card";
import { WebhooksList } from "@/components/configuracoes/webhooks-list";
import type { Profile, WebhookConfig } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // O middleware já garante redirecionamento para /login; isto é apenas defensivo.
  }

  const [profileRes, webhooksRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("webhook_configs").select("*").order("criado_em", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader titulo="Configurações" descricao="Seu perfil e integrações de notificação do sistema" />

      {profileRes.data && <PerfilCard profile={profileRes.data as Profile} />}

      <WebhooksList webhooks={(webhooksRes.data as WebhookConfig[]) ?? []} />
    </div>
  );
}
