import Link from "next/link";
import { ClipboardList, Plus, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatarData, VISITA_STATUS_LABEL } from "@/lib/utils/format";
import type { Visita } from "@/types/database";

const STATUS_VARIANT: Record<string, "secondary" | "success" | "warning" | "destructive"> = {
  agendada: "warning",
  realizada: "success",
  cancelada: "destructive",
  remarcada: "secondary",
};

export function VisitasList({ visitas }: { visitas: Visita[] }) {
  if (visitas.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        titulo="Nenhuma visita registrada"
        descricao="Registre a primeira visita pastoral a uma empresa para começar o histórico."
        acao={
          <Button asChild variant="gold">
            <Link href="/visitas/novo">
              <Plus className="h-4 w-4" /> Registrar visita
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {visitas.map((v) => (
        <Link key={v.id} href={`/visitas/${v.id}`}>
          <Card className="card-premium transition-colors hover:bg-secondary/40">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-pib-navy-100 dark:bg-pib-navy-800/50">
                <span className="text-[10px] font-medium uppercase leading-none text-pib-navy-500 dark:text-pib-navy-300">
                  {formatarData(v.data_visita).split("/")[1]}
                </span>
                <span className="text-base font-bold leading-tight text-pib-navy-700 dark:text-pib-navy-100">
                  {formatarData(v.data_visita).split("/")[0]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {v.empresa?.nome ?? "Empresa"}
                </p>
                {v.responsavel?.nome_completo && (
                  <p className="truncate text-xs text-muted-foreground">{v.responsavel.nome_completo}</p>
                )}
                {v.observacoes && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{v.observacoes}</p>
                )}
              </div>
              <Badge variant={STATUS_VARIANT[v.status]} className="shrink-0">
                {VISITA_STATUS_LABEL[v.status]}
              </Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
