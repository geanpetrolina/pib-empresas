"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Church, Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/validations/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [carregando, setCarregando] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setCarregando(false);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("E-mail ou senha incorretos");
      } else {
        toast.error("Não foi possível entrar: " + error.message);
      }
      return;
    }

    toast.success("Bem-vindo(a) de volta!");
    const redirect = searchParams.get("redirect") ?? "/dashboard";
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient shadow-gold">
          <Church className="h-8 w-8 text-pib-navy-950" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-white">PIB Empresas</h1>
        <p className="mt-1 text-sm text-pib-navy-200">
          Primeira Igreja Batista de Petrolina
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-premium-lg backdrop-blur-xl">
        <h2 className="mb-1 text-lg font-semibold text-white">Acesse sua conta</h2>
        <p className="mb-6 text-sm text-pib-navy-300">
          Entre com as credenciais fornecidas pela coordenação do ministério.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-pib-navy-100">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pib-navy-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-pib-navy-400 focus-visible:ring-pib-gold-400"
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-pib-navy-100">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pib-navy-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-pib-navy-400 focus-visible:ring-pib-gold-400"
                {...register("password")}
              />
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <Button type="submit" variant="gold" className="w-full" disabled={carregando}>
            {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Entrar
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-pib-navy-400">
        Acesso restrito a pastores e líderes autorizados. Para solicitar uma conta,
        fale com a coordenação do ministério de empresas.
      </p>
    </div>
  );
}
