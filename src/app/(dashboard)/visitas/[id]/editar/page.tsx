import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { VisitaForm } from "@/components/visitas/visita-form";
import type { Visita } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EditarVisitaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: visita } = await supabase.from("visitas").select("*").eq("id", params.id).single();

  if (!visita) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader titulo="Editar visita" descricao="Atualize as informações desta visita pastoral" />
      <VisitaForm visita={visita as Visita} />
    </div>
  );
}
