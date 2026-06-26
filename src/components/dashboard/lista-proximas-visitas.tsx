import Link from "next/link";
import { ClipboardList, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatarData, VISITA_STATUS_LABEL } from "@/lib/utils/format";
import type { Visita } from "@/types/database";

const STATUS_VARIANT: Record<string, "secondary" | "success" | "warning" | "destructive"> = {
  agendada: "warning",
  realizada: "success",
  cancelada: "destructive",
  remarcada: "secondary",
};

export function ListaProximasVisitas({ visitas }: { visitas: Visita[] }) {
  return (
    <Card className="card-premium">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-4 w-4 text-pib-navy-500" />
          Próximas visitas
        </CardTitle>
        <Link href="/visitas" className="text-xs font-medium text-accent hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {visitas.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma visita agendada.
          </p>
        )}
        {visitas.map((visita) => (
          <div
            key={visita.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/60"
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-pib-navy-100 text-pib-navy-700 dark:bg-pib-navy-800/60 dark:text-pib-navy-100">
              <span className="text-[10px] font-medium uppercase leading-none">
                {formatarData(visita.data_visita).split("/")[1] && ""}
              </span>
              <span className="text-sm font-bold leading-none">
                {formatarData(visita.data_visita).split("/")[0]}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {visita.empresa?.nome ?? "Empresa"}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                {formatarData(visita.data_visita)}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[visita.status]}>{VISITA_STATUS_LABEL[visita.status]}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
