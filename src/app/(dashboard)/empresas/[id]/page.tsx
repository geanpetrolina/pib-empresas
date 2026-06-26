import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, Users, ClipboardList, HeartHandshake, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { FuncionarioMiniCard } from "@/components/funcionarios/funcionario-mini-card";
import { formatarData, formatarDataHora, VISITA_STATUS_LABEL, ORACAO_STATUS_LABEL } from "@/lib/utils/format";
import type { Funcionario, Visita, PedidoOracao } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EmpresaDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [empresaRes, funcionariosRes, visitasRes, oracoesRes] = await Promise.all([
    supabase.from("empresas").select("*").eq("id", params.id).single(),
    supabase
      .from("funcionarios")
      .select("*")
      .eq("empresa_id", params.id)
      .eq("ativo", true)
      .order("nome"),
    supabase
      .from("visitas")
      .select("*, responsavel:profiles(id, nome_completo)")
      .eq("empresa_id", params.id)
      .order("data_visita", { ascending: false })
      .limit(10),
    supabase
      .from("pedidos_oracao")
      .select("*, funcionario:funcionarios(id, nome)")
      .eq("empresa_id", params.id)
      .order("criado_em", { ascending: false })
      .limit(10),
  ]);

  if (!empresaRes.data) {
    notFound();
  }

  const empresa = empresaRes.data;
  const funcionarios = (funcionariosRes.data as Funcionario[]) ?? [];
  const visitas = (visitasRes.data as Visita[]) ?? [];
  const pedidosOracao = (oracoesRes.data as PedidoOracao[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/empresas" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para empresas
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-foreground">{empresa.nome}</h1>
              {!empresa.ativa && <Badge variant="outline">Inativa</Badge>}
              {empresa.segmento && <Badge variant="secondary">{empresa.segmento}</Badge>}
            </div>
            {empresa.responsavel && (
              <p className="mt-1 text-sm text-muted-foreground">Responsável: {empresa.responsavel}</p>
            )}
          </div>
          <Button asChild variant="gold">
            <Link href={`/visitas/novo?empresa_id=${empresa.id}`}>
              <Plus className="h-4 w-4" /> Registrar visita
            </Link>
          </Button>
        </div>
      </div>

      {/* Informações de contato */}
      <Card className="card-premium">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <InfoItem icon={Phone} label="Telefone" valor={empresa.telefone} />
          <InfoItem icon={Mail} label="E-mail" valor={empresa.email} />
          <InfoItem icon={MapPin} label="Endereço" valor={empresa.endereco ? `${empresa.endereco}${empresa.cidade ? `, ${empresa.cidade}` : ""}` : null} />
        </CardContent>
        {empresa.observacoes && (
          <>
            <Separator />
            <CardContent className="p-5 pt-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Observações</p>
              <p className="mt-1 text-sm text-foreground">{empresa.observacoes}</p>
            </CardContent>
          </>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funcionários */}
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-pib-navy-500" /> Funcionários ({funcionarios.length})
            </CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/funcionarios/novo?empresa_id=${empresa.id}`}>
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {funcionarios.length === 0 ? (
              <EmptyState icon={Users} titulo="Nenhum funcionário cadastrado" />
            ) : (
              funcionarios.map((f) => <FuncionarioMiniCard key={f.id} funcionario={f} />)
            )}
          </CardContent>
        </Card>

        {/* Visitas */}
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-pib-navy-500" /> Histórico de visitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {visitas.length === 0 ? (
              <EmptyState icon={ClipboardList} titulo="Nenhuma visita registrada" />
            ) : (
              visitas.map((v) => (
                <Link
                  key={v.id}
                  href={`/visitas/${v.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-secondary/60"
                >
                  <div>
                    <p className="font-medium text-foreground">{formatarData(v.data_visita)}</p>
                    {v.responsavel?.nome_completo && (
                      <p className="text-xs text-muted-foreground">{v.responsavel.nome_completo}</p>
                    )}
                  </div>
                  <Badge variant="secondary">{VISITA_STATUS_LABEL[v.status]}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pedidos de oração */}
      <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartHandshake className="h-4 w-4 text-pib-gold-500" /> Pedidos de oração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {pedidosOracao.length === 0 ? (
            <EmptyState icon={HeartHandshake} titulo="Nenhum pedido de oração registrado" />
          ) : (
            pedidosOracao.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground">{p.descricao}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {ORACAO_STATUS_LABEL[p.status]}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {p.funcionario?.nome && `${p.funcionario.nome} · `}
                  {formatarDataHora(p.criado_em)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  valor,
}: {
  icon: React.ElementType;
  label: string;
  valor: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{valor ?? "Não informado"}</p>
      </div>
    </div>
  );
}
