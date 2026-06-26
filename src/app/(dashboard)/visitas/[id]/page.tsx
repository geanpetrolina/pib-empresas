import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, User, Pencil, HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { PedidoOracaoCard } from "@/components/visitas/pedido-oracao-card";
import { AdicionarPedidoOracaoForm } from "@/components/visitas/adicionar-pedido-oracao-form";
import { formatarData, VISITA_STATUS_LABEL } from "@/lib/utils/format";
import type { Visita, PedidoOracao } from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "secondary" | "success" | "warning" | "destructive"> = {
  agendada: "warning",
  realizada: "success",
  cancelada: "destructive",
  remarcada: "secondary",
};

export default async function VisitaDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [visitaRes, pedidosRes] = await Promise.all([
    supabase
      .from("visitas")
      .select("*, empresa:empresas(id, nome), responsavel:profiles(id, nome_completo)")
      .eq("id", params.id)
      .single(),
    supabase
      .from("pedidos_oracao")
      .select("*")
      .eq("visita_id", params.id)
      .order("criado_em", { ascending: false }),
  ]);

  if (!visitaRes.data) {
    notFound();
  }

  const visita = visitaRes.data as Visita;
  const pedidos = (pedidosRes.data as PedidoOracao[]) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/visitas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para visitas
      </Link>

      <Card className="card-premium">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <Link href={`/empresas/${visita.empresa_id}`} className="hover:underline">
                  {visita.empresa?.nome}
                </Link>
              </p>
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {formatarData(visita.data_visita)}
              </h1>
              {visita.responsavel?.nome_completo && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> {visita.responsavel.nome_completo}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={STATUS_VARIANT[visita.status]}>{VISITA_STATUS_LABEL[visita.status]}</Badge>
              <Button asChild variant="outline" size="sm">
                <Link href={`/visitas/${visita.id}/editar`}>
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Link>
              </Button>
            </div>
          </div>

          {visita.observacoes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Observações</p>
                <p className="mt-1 text-sm text-foreground">{visita.observacoes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartHandshake className="h-4 w-4 text-pib-gold-500" /> Pedidos de oração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {pedidos.length === 0 ? (
            <EmptyState icon={HeartHandshake} titulo="Nenhum pedido de oração registrado nesta visita" />
          ) : (
            pedidos.map((p) => <PedidoOracaoCard key={p.id} pedido={p} />)
          )}
          <AdicionarPedidoOracaoForm visitaId={visita.id} empresaId={visita.empresa_id} />
        </CardContent>
      </Card>
    </div>
  );
}
