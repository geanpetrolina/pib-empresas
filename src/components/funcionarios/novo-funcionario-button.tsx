"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FuncionarioFormDialog } from "@/components/funcionarios/funcionario-form-dialog";

export function NovoFuncionarioButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const empresaId = searchParams.get("empresa_id");

  return (
    <>
      <Button variant="gold" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Novo colaborador
      </Button>
      <FuncionarioFormDialog
        open={open}
        onOpenChange={setOpen}
        empresaIdPadrao={empresaId}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
