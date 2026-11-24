"use server";

import { redirect } from "next/navigation";
import { apelidoValido, emailDoApelido, normalizarApelido } from "@/lib/apelido";
import { normalizarWhatsapp } from "@/lib/whatsapp";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export type EstadoForm = { erro?: string };

const APELIDO_EXISTE = "Esse apelido já existe. Tente outro.";

export async function criarConta(_anterior: EstadoForm, form: FormData): Promise<EstadoForm> {
  const nome = String(form.get("nome") ?? "").trim();
  const apelido = normalizarApelido(String(form.get("apelido") ?? ""));
  const whatsapp = normalizarWhatsapp(String(form.get("whatsapp") ?? ""));
  const pin = String(form.get("pin") ?? "");
  const pinConfirmacao = String(form.get("pin_confirmacao") ?? "");

  if (!nome) return { erro: "Escreva seu nome." };
  if (!apelidoValido(apelido)) return { erro: "O apelido precisa ter de 3 a 30 letras ou números." };
  if (!whatsapp) return { erro: "Confira o WhatsApp. Use o DDD, por exemplo (11) 98765-4321." };
  if (!/^[0-9]{6}$/.test(pin)) return { erro: "O PIN precisa ter 6 números." };
  if (pin !== pinConfirmacao) return { erro: "Os dois PINs estão diferentes." };

  const supabase = await criarClienteServidor();

  const { data: existente } = await supabase.from("artesaos").select("id").eq("slug", apelido).maybeSingle();
  if (existente) return { erro: APELIDO_EXISTE };

  const { data, error } = await supabase.auth.signUp({ email: emailDoApelido(apelido), password: pin });
  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already")) return { erro: APELIDO_EXISTE };
    return { erro: "Não foi possível criar a conta agora. Tente de novo em instantes." };
  }

  const { error: erroPerfil } = await supabase
    .from("artesaos")
    .insert({ id: data.user.id, slug: apelido, nome_exibicao: nome, whatsapp });

  if (erroPerfil) {
    await criarClienteAdmin().auth.admin.deleteUser(data.user.id);
    await supabase.auth.signOut();
    if (erroPerfil.code === "23505") return { erro: APELIDO_EXISTE };
    return { erro: "Não foi possível criar a conta agora. Tente de novo em instantes." };
  }

  redirect("/painel");
}
