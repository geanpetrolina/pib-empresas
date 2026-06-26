import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { FuncionariosList } from "@/components/funcionarios/funcionarios-list";
import { NovoFuncionarioButton } from "@/components/funcionarios/novo-funcionario-button";
import type { Funcionario } from "@/types/database";

export const dynamic = "force-dynamic";

interface FuncionariosPageProps {
  searchParams: { q?: string; empresa_id?: string };
}

export default async function FuncionariosPage({ searchParams }: FuncionariosPageProps) {
  const supabase = createClient();
  const termoBusca = searchParams.q?.trim();

  let query = supabase
    .from("funcionarios")
    .select("*, empresa:empresas(id, nome)")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (termoBusca) {
    query = query.or(`nome.ilike.%${termoBusca}%,cargo.ilike.%${termoBusca}%`);
  }
  if (searchParams.empresa_id) {
    query = query.eq("empresa_id", searchParams.empresa_id);
  }

  const { data: funcionarios } = await query;

  return (
    <div>
      <PageHeader
        titulo="Funcionários"
        descricao="Colaboradores das empresas vinculadas ao ministério"
        acao={
          <Suspense>
            <NovoFuncionarioButton />
          </Suspense>
        }
      />

      <div className="mb-5">
        <Suspense>
          <SearchInput placeholder="Buscar por nome ou cargo..." />
        </Suspense>
      </div>

      <FuncionariosList funcionarios={(funcionarios as Funcionario[]) ?? []} />
    </div>
  );
}
