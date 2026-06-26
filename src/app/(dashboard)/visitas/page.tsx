import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { VisitasList } from "@/components/visitas/visitas-list";
import type { Visita } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function VisitasPage() {
  const supabase = createClient();

  const { data: visitas } = await supabase
    .from("visitas")
    .select("*, empresa:empresas(id, nome), responsavel:profiles(id, nome_completo)")
    .order("data_visita", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        titulo="Visitas Pastorais"
        descricao="Histórico e agendamento de visitas às empresas"
        acao={
          <Button asChild variant="gold">
            <Link href="/visitas/novo">
              <Plus className="h-4 w-4" /> Registrar visita
            </Link>
          </Button>
        }
      />
      <VisitasList visitas={(visitas as Visita[]) ?? []} />
    </div>
  );
}
