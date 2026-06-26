"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmpresasOpcoes } from "@/lib/hooks/use-empresas-opcoes";

export function FiltroEmpresa() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { empresas } = useEmpresasOpcoes();
  const empresaAtual = searchParams.get("empresa_id") ?? "todas";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todas") {
      params.delete("empresa_id");
    } else {
      params.set("empresa_id", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={empresaAtual} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-60">
        <SelectValue placeholder="Filtrar por empresa" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todas">Todas as empresas</SelectItem>
        {empresas.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
