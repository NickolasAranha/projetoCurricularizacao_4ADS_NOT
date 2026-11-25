"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { lerAvaliacao } from "@/lib/avaliacao";

export type EstadoAvaliacao = { erro?: string; enviado?: boolean };

export async function enviarAvaliacao(_anterior: EstadoAvaliacao, form: FormData): Promise<EstadoAvaliacao> {
  const lido = lerAvaliacao(form);
  if ("erro" in lido) return { erro: lido.erro };

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sua sessão expirou. Entre de novo." };

  // A pontuação SUS é calculada pelo banco (migração 0008).
  const { error } = await supabase
    .from("respostas_usabilidade")
    .insert({ ...lido.dados, artesao_id: user.id, respondido_em: new Date().toISOString() });

  // 23505: já existe uma resposta deste artesão.
  if (error && error.code !== "23505") return { erro: "Não foi possível enviar agora. Tente de novo." };

  revalidatePath("/painel");
  revalidatePath("/metricas");
  return { enviado: true };
}
