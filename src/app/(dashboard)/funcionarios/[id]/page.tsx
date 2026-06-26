import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, Building2, Cake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatarData,
  formatarDataExtensa,
  calcularIdade,
  calcularProximaIdade,
  obterIniciais,
} from "@/lib/utils/format";
import type { Funcionario } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function FuncionarioDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: funcionario } = await supabase
    .from("funcionarios")
    .select("*, empresa:empresas(id, nome)")
    .eq("id", params.id)
    .single();

  if (!funcionario) {
    notFound();
  }

  const f = funcionario as Funcionario;

  return (
    <div className="space-y-6">
      <Link href="/funcionarios" className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para funcionários
      </Link>

      <Card className="card-premium">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <Avatar className="h-20 w-20 border-2 border-pib-gold-400/40">
            <AvatarFallback className="text-xl">{obterIniciais(f.nome)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">{f.nome}</h1>
            <p className="text-sm text-muted-foreground">{f.cargo ?? "Sem cargo informado"}</p>
            {f.empresa?.nome && (
              <Link
                href={`/empresas/${f.empresa.id}`}
                className="mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                <Building2 className="h-3.5 w-3.5" /> {f.empresa.nome}
              </Link>
            )}
          </div>
          {!f.ativo && <Badge variant="outline" className="sm:ml-auto">Inativo</Badge>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={Cake} label="Aniversário" valor={formatarDataExtensa(f.data_nascimento)} />
        <InfoCard icon={Cake} label="Idade atual" valor={`${calcularIdade(f.data_nascimento)} anos`} />
        <InfoCard icon={Phone} label="Telefone" valor={f.telefone ?? "Não informado"} />
        <InfoCard icon={Mail} label="E-mail" valor={f.email ?? "Não informado"} />
      </div>

      <Card className="card-premium bg-pib-gold-50/50 dark:bg-pib-gold-900/10">
        <CardContent className="p-5">
          <p className="text-sm text-foreground">
            No próximo aniversário, em <strong>{formatarData(f.data_nascimento)}</strong>, {f.nome.split(" ")[0]} fará{" "}
            <strong>{calcularProximaIdade(f.data_nascimento)} anos</strong>.
          </p>
        </CardContent>
      </Card>

      {f.observacoes && (
        <Card className="card-premium">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Observações</p>
            <Separator className="my-2" />
            <p className="text-sm text-foreground">{f.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, valor }: { icon: React.ElementType; label: string; valor: string }) {
  return (
    <Card className="card-premium">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <p className="text-xs font-medium uppercase">{label}</p>
        </div>
        <p className="mt-1.5 text-sm font-semibold text-foreground">{valor}</p>
      </CardContent>
    </Card>
  );
}
