import { BookOpen, HandHeart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatarDataHora } from "@/lib/utils/format";
import type { Devocional } from "@/types/database";

const TOM_LABEL: Record<string, string> = {
  encorajador: "Encorajador",
  reflexivo: "Reflexivo",
  celebrativo: "Celebrativo",
  intercessao: "Intercessão",
};

export function DevocionalCard({ devocional }: { devocional: Devocional }) {
  return (
    <Card className="card-premium overflow-hidden">
      <div className="bg-navy-gradient px-6 py-5">
        <div className="flex items-center gap-2 text-pib-gold-300">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Devocional</span>
        </div>
        <h2 className="mt-1.5 font-serif text-xl font-semibold text-white">{devocional.titulo}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="gold">{TOM_LABEL[devocional.tom ?? "encorajador"]}</Badge>
          {devocional.empresa?.nome && <Badge variant="secondary">{devocional.empresa.nome}</Badge>}
        </div>
      </div>

      <CardContent className="space-y-5 p-6">
        <div className="rounded-lg bg-pib-gold-50 p-4 dark:bg-pib-gold-900/10">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-pib-gold-700 dark:text-pib-gold-400">
            <BookOpen className="h-3.5 w-3.5" /> {devocional.versiculo_referencia}
          </p>
          <p className="mt-1.5 text-sm italic text-foreground">"{devocional.versiculo_texto}"</p>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          {devocional.mensagem.split("\n").filter(Boolean).map((paragrafo, i) => (
            <p key={i}>{paragrafo}</p>
          ))}
        </div>

        <Separator />

        <div className="rounded-lg border border-border bg-secondary/40 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
            <HandHeart className="h-3.5 w-3.5" /> Oração
          </p>
          <p className="mt-1.5 text-sm italic text-foreground">{devocional.oracao}</p>
        </div>

        <p className="text-right text-[11px] text-muted-foreground">
          Gerado em {formatarDataHora(devocional.criado_em)}
        </p>
      </CardContent>
    </Card>
  );
}
