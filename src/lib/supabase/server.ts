import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route Handlers.
 * Lê/escreve cookies de sessão automaticamente usando o padrão getAll/setAll.
 */
export function createClient() {
  const cookieStore = cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Chamado de um Server Component sem permissão de escrita.
        // Seguro ignorar se houver middleware atualizando a sessão.
      }
    },
  };

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );
}

/**
 * Cliente Supabase com a Service Role Key — ignora RLS.
 * USAR APENAS em código server-side de confiança (API routes internas,
 * cron jobs, webhooks). NUNCA expor ao client.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
