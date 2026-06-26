"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface EmpresaOpcao {
  id: string;
  nome: string;
}

export function useEmpresasOpcoes() {
  const [empresas, setEmpresas] = useState<EmpresaOpcao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("empresas")
      .select("id, nome")
      .eq("ativa", true)
      .order("nome")
      .then(({ data }) => {
        setEmpresas(data ?? []);
        setCarregando(false);
      });
  }, []);

  return { empresas, carregando };
}
