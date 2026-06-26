import { type ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

export function PageHeader({ titulo, descricao, acao }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {acao && <div className="flex shrink-0 gap-2">{acao}</div>}
    </div>
  );
}
