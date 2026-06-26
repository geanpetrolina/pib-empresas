import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { FiltroEmpresa } from "@/components/aniversarios/filtro-empresa";
import { AniversarianteCard } from "@/components/aniversarios/aniversariante-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Cake } from "lucide-react";
import type { Aniversariante } from "@/types/database";

export const dynamic = "force-dynamic";

interface AniversariosPageProps {
  searchParams: { empresa_id?: string };
}

export default async function AniversariosPage({ searchParams }: AniversariosPageProps) {
  const supabase = createClient();

  // Busca aniversariantes numa janela ampla (30 dias) para a listagem geral;
  // as seções de destaque (hoje/2/3 dias) filtram esse mesmo resultado.
  const { data } = await supabase.rpc("get_aniversariantes", { dias_janela: 30 });
  let aniversariantes = (data as Aniversariante[]) ?? [];

  if (searchParams.empresa_id) {
    aniversariantes = aniversariantes.filter((a) => a.empresa_id === searchParams.empresa_id);
  }

  const hoje = aniversariantes.filter((a) => a.dias_restantes === 0);
  const emDoisDias = aniversariantes.filter((a) => a.dias_restantes === 2);
  const emTresDias = aniversariantes.filter((a) => a.dias_restantes === 3);
  const demaisProximos = aniversariantes.filter(
    (a) => a.dias_restantes === 1 || a.dias_restantes > 3
  );

  return (
    <div className="space-y-8">
      <PageHeader
        titulo="Aniversários"
        descricao="Acompanhe e celebre os aniversários dos colaboradores das empresas visitadas"
      />

      <div className="max-w-xs">
        <Suspense>
          <FiltroEmpresa />
        </Suspense>
      </div>

      {aniversariantes.length === 0 && (
        <EmptyState
          icon={Cake}
          titulo="Nenhum aniversário nos próximos 30 dias"
          descricao="Cadastre colaboradores para começar a acompanhar os aniversários."
        />
      )}

      <SecaoAniversarios titulo="🎉 Hoje" pessoas={hoje} />
      <SecaoAniversarios titulo="Em 2 dias" pessoas={emDoisDias} />
      <SecaoAniversarios titulo="Em 3 dias" pessoas={emTresDias} />
      <SecaoAniversarios titulo="Próximos 30 dias" pessoas={demaisProximos} />
    </div>
  );
}

function SecaoAniversarios({ titulo, pessoas }: { titulo: string; pessoas: Aniversariante[] }) {
  if (pessoas.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo} <span className="text-pib-gold-500">({pessoas.length})</span>
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pessoas.map((p) => (
          <AniversarianteCard key={p.id} pessoa={p} />
        ))}
      </div>
    </section>
  );
}
