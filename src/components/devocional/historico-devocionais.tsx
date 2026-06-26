import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatarData } from "@/lib/utils/format";
import type { Devocional } from "@/types/database";

export function HistoricoDevocionais({ devocionais }: { devocionais: Devocional[] }) {
  if (devocionais.length === 0) {
    return <EmptyState icon={BookOpen} titulo="Nenhum devocional gerado ainda" />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {devocionais.map((d) => (
        <Card key={d.id} className="card-premium">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{formatarData(d.criado_em.split("T")[0])}</p>
            <h3 className="mt-1 line-clamp-1 font-semibold text-foreground">{d.titulo}</h3>
            <p className="mt-1 text-xs font-medium text-pib-gold-600 dark:text-pib-gold-400">
              {d.versiculo_referencia}
            </p>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{d.mensagem}</p>
            {d.empresa?.nome && (
              <Badge variant="secondary" className="mt-3">
                {d.empresa.nome}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
