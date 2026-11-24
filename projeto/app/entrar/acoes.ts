"use server";

import { redirect } from "next/navigation";
import { emailDoApelido, normalizarApelido } from "@/lib/apelido";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type EstadoForm = { erro?: string };

export async function entrar(_anterior: EstadoForm, form: FormData): Promise<EstadoForm> {
  const apelido = normalizarApelido(String(form.get("apelido") ?? ""));
  const pin = String(form.get("pin") ?? "");

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: emailDoApelido(apelido), password: pin });
  if (error) return { erro: "Apelido ou PIN incorretos." };

  redirect("/painel");
}

export async function sair(): Promise<void> {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/entrar");
}
