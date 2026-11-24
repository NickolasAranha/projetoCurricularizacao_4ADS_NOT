"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function iniciarSessaoCadastro(): Promise<string> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada");

  const { data, error } = await supabase
    .from("sessoes_cadastro")
    .insert({ artesao_id: user.id })
    .select("id")
    .single();
  if (error || !data) throw new Error("Não foi possível iniciar o cadastro");
  return data.id;
}
