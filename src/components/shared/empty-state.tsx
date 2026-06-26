import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

export function EmptyState({ icon: Icon, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pib-navy-100 dark:bg-pib-navy-800/50">
        <Icon className="h-7 w-7 text-pib-navy-500 dark:text-pib-navy-300" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{titulo}</h3>
      {descricao && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
