"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { normalizarWhatsapp } from "@/lib/whatsapp";
import { caminhoPertenceAoUsuario } from "@/lib/caminhos";

export type EstadoPerfil = { erro?: string; salvo?: boolean };

export async function salvarPerfil(_anterior: EstadoPerfil, form: FormData): Promise<EstadoPerfil> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sua sessão expirou. Entre de novo." };

  const nome = String(form.get("nome") ?? "").trim().slice(0, 80);
  const whatsapp = normalizarWhatsapp(String(form.get("whatsapp") ?? ""));
  const cidade = String(form.get("cidade") ?? "").trim().slice(0, 80);
  const bio = String(form.get("bio") ?? "").trim();
  const fotoPath = String(form.get("foto_path") ?? "");

  if (!nome) return { erro: "Escreva seu nome." };
  if (!whatsapp) return { erro: "Confira o WhatsApp. Use o DDD, por exemplo (11) 98765-4321." };
  if (bio.length > 280) return { erro: "A frase sobre você pode ter até 280 letras." };
  if (fotoPath && !caminhoPertenceAoUsuario(fotoPath, user.id)) return { erro: "Foto inválida." };

  const { data: artesao, error } = await supabase
    .from("artesaos")
    .update({
      nome_exibicao: nome,
      whatsapp,
      cidade: cidade || null,
      bio: bio || null,
      ...(fotoPath ? { foto_path: fotoPath } : {}),
    })
    .eq("id", user.id)
    .select("slug")
    .single();
  if (error) return { erro: "Não foi possível salvar agora. Tente de novo." };

  revalidatePath("/painel");
  revalidatePath(`/artesao/${artesao.slug}`);
  return { salvo: true };
}
