import Link from "next/link";
import { Cake, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { obterIniciais, textoDiasRestantes, calcularProximaIdade } from "@/lib/utils/format";
import type { Aniversariante } from "@/types/database";

interface ListaAniversariantesProps {
  aniversariantes: Aniversariante[];
  titulo?: string;
  vazio?: string;
}

export function ListaAniversariantes({
  aniversariantes,
  titulo = "Próximos aniversários",
  vazio = "Nenhum aniversário nos próximos dias.",
}: ListaAniversariantesProps) {
  return (
    <Card className="card-premium">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cake className="h-4 w-4 text-pib-gold-500" />
          {titulo}
        </CardTitle>
        <Link href="/aniversarios" className="text-xs font-medium text-accent hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {aniversariantes.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">{vazio}</p>
        )}
        {aniversariantes.map((pessoa) => (
          <div
            key={pessoa.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/60"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>{obterIniciais(pessoa.nome)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{pessoa.nome}</p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                {pessoa.empresa_nome && (
                  <>
                    <Building2 className="h-3 w-3 shrink-0" />
                    {pessoa.empresa_nome}
                  </>
                )}
                {pessoa.cargo && <span>· {pessoa.cargo}</span>}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={pessoa.dias_restantes === 0 ? "gold" : "secondary"}>
                {textoDiasRestantes(pessoa.dias_restantes)}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                fará {calcularProximaIdade(pessoa.data_nascimento)} anos
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
