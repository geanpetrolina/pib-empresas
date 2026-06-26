import { Building2, Users, Cake, CalendarHeart, ClipboardList, HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListaAniversariantes } from "@/components/dashboard/lista-aniversariantes";
import { ListaProximasVisitas } from "@/components/dashboard/lista-proximas-visitas";
import type { DashboardStats, Aniversariante, Visita } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [statsRes, aniversariantesHojeRes, proximosAniversariosRes, visitasRes] = await Promise.all([
    supabase.rpc("get_dashboard_stats"),
    supabase.rpc("get_aniversariantes", { dias_janela: 0 }),
    supabase.rpc("get_aniversariantes", { dias_janela: 7 }),
    supabase
      .from("visitas")
      .select("*, empresa:empresas(id, nome)")
      .eq("status", "agendada")
      .gte("data_visita", new Date().toISOString().split("T")[0])
      .order("data_visita", { ascending: true })
      .limit(5),
  ]);

  const stats = (statsRes.data as DashboardStats) ?? {
    total_empresas: 0,
    total_funcionarios: 0,
    aniversarios_hoje: 0,
    aniversarios_proximos: 0,
    visitas_agendadas: 0,
    pedidos_oracao_abertos: 0,
  };

  const aniversariantesHoje = (aniversariantesHojeRes.data as Aniversariante[]) ?? [];
  // Próximos (excluindo hoje, já mostrado em destaque separado)
  const proximosAniversarios = ((proximosAniversariosRes.data as Aniversariante[]) ?? []).filter(
    (a) => a.dias_restantes > 0
  );
  const proximasVisitas = (visitasRes.data as Visita[]) ?? [];

  return (
    <div className="space-y-6">
      {/* Faixa de destaque — aniversários de hoje */}
      {aniversariantesHoje.length > 0 && (
        <div className="rounded-xl bg-gold-gradient p-4 shadow-gold">
          <div className="flex items-center gap-2 text-pib-navy-950">
            <Cake className="h-5 w-5" />
            <p className="font-semibold">
              {aniversariantesHoje.length === 1
                ? `${aniversariantesHoje[0].nome} faz aniversário hoje! 🎉`
                : `${aniversariantesHoje.length} pessoas fazem aniversário hoje! 🎉`}
            </p>
          </div>
          <p className="mt-1 text-sm text-pib-navy-900/80">
            {aniversariantesHoje.map((a) => a.nome).join(", ")}
          </p>
        </div>
      )}

      {/* Grid de estatísticas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard titulo="Empresas" valor={stats.total_empresas} icon={Building2} />
        <StatCard titulo="Funcionários" valor={stats.total_funcionarios} icon={Users} />
        <StatCard
          titulo="Aniversários hoje"
          valor={stats.aniversarios_hoje}
          icon={Cake}
          variante={stats.aniversarios_hoje > 0 ? "gold" : "default"}
        />
        <StatCard titulo="Próx. 7 dias" valor={stats.aniversarios_proximos} icon={CalendarHeart} />
        <StatCard titulo="Visitas agendadas" valor={stats.visitas_agendadas} icon={ClipboardList} />
        <StatCard
          titulo="Pedidos de oração"
          valor={stats.pedidos_oracao_abertos}
          icon={HeartHandshake}
          variante={stats.pedidos_oracao_abertos > 0 ? "alerta" : "default"}
        />
      </div>

      {/* Widgets principais */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ListaAniversariantes aniversariantes={proximosAniversarios} />
        <ListaProximasVisitas visitas={proximasVisitas} />
      </div>
    </div>
  );
}
