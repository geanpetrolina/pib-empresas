import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmpresasList } from "@/components/empresas/empresas-list";
import { NovaEmpresaButton } from "@/components/empresas/nova-empresa-button";
import type { Empresa } from "@/types/database";

export const dynamic = "force-dynamic";

interface EmpresasPageProps {
  searchParams: { q?: string };
}

export default async function EmpresasPage({ searchParams }: EmpresasPageProps) {
  const supabase = createClient();
  const termoBusca = searchParams.q?.trim();

  let query = supabase
    .from("empresas")
    .select("*")
    .order("nome", { ascending: true });

  if (termoBusca) {
    query = query.or(
      `nome.ilike.%${termoBusca}%,responsavel.ilike.%${termoBusca}%,segmento.ilike.%${termoBusca}%`
    );
  }

  const { data: empresas } = await query;

  return (
    <div>
      <PageHeader
        titulo="Empresas"
        descricao="Empresas visitadas pelo ministério empresarial da igreja"
        acao={<NovaEmpresaButton />}
      />

      <div className="mb-5">
        <Suspense>
          <SearchInput placeholder="Buscar por nome, responsável ou segmento..." />
        </Suspense>
      </div>

      <EmpresasList empresas={(empresas as Empresa[]) ?? []} />
    </div>
  );
}
