import { PageHeader } from "@/components/shared/page-header";
import { VisitaForm } from "@/components/visitas/visita-form";

export default function NovaVisitaPage({
  searchParams,
}: {
  searchParams: { empresa_id?: string };
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader titulo="Registrar visita" descricao="Documente uma visita pastoral realizada ou agendada" />
      <VisitaForm empresaIdPadrao={searchParams.empresa_id ?? null} />
    </div>
  );
}
