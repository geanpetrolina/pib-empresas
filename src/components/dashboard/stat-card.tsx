import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  titulo: string;
  valor: number | string;
  icon: LucideIcon;
  variante?: "default" | "gold" | "alerta";
  href?: string;
}

export function StatCard({ titulo, valor, icon: Icon, variante = "default" }: StatCardProps) {
  return (
    <Card className="card-premium overflow-hidden">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {titulo}
          </p>
          <p className="font-serif text-3xl font-semibold tabular-nums text-foreground">
            {valor}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            variante === "gold" && "bg-gold-gradient shadow-gold",
            variante === "alerta" && "bg-pib-gold-100 dark:bg-pib-gold-900/30",
            variante === "default" && "bg-pib-navy-100 dark:bg-pib-navy-800/50"
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              variante === "gold" && "text-pib-navy-950",
              variante === "alerta" && "text-pib-gold-600 dark:text-pib-gold-400",
              variante === "default" && "text-pib-navy-600 dark:text-pib-navy-200"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
