import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GerarDevocionalPanel } from "@/components/devocional/gerar-devocional-panel";
import { HistoricoDevocionais } from "@/components/devocional/historico-devocionais";
import type { Devocional } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DevocionalPage() {
  const supabase = createClient();
  const { data: devocionais } = await supabase
    .from("devocionais")
    .select("*, empresa:empresas(id, nome)")
    .order("criado_em", { ascending: false })
    .limit(30);

  return (
    <div>
      <PageHeader
        titulo="Devocional IA"
        descricao="Gere devocionais cristãos personalizados com versículo e oração para suas visitas"
      />

      <Tabs defaultValue="gerar">
        <TabsList>
          <TabsTrigger value="gerar">Gerar novo</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="gerar" className="pt-4">
          <GerarDevocionalPanel />
        </TabsContent>
        <TabsContent value="historico" className="pt-4">
          <HistoricoDevocionais devocionais={(devocionais as Devocional[]) ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
