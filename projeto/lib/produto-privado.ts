import "server-only";
import { criarClienteAdmin } from "@/lib/supabase/admin";

// As colunas privadas (resposta da IA) não são expostas pela API pública.
// O servidor lê com a service role, sempre filtrando pelo dono.
export async function lerRespostaIA(produtoId: string, artesaoId: string): Promise<unknown> {
  const { data } = await criarClienteAdmin()
    .from("produtos")
    .select("ia_resposta")
    .eq("id", produtoId)
    .eq("artesao_id", artesaoId)
    .maybeSingle();
  return data?.ia_resposta ?? null;
}
