"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { idDaCategoria, SLUGS_CATEGORIA, type SlugCategoria } from "@/lib/categorias";
import { parseReais } from "@/lib/dinheiro";
import { camposEditados } from "@/lib/campos-editados";
import { interpretarRespostaIA, LIMITE_TITULO } from "@/lib/ia/esquema";
import type { Atributo } from "@/lib/tipos";
import { lerRespostaIA } from "@/lib/produto-privado";

export type EstadoRevisao = { erro?: string; salvo?: "rascunho" | "publicado" };

type Campos = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: SlugCategoria | null;
  atributos: Atributo[];
  preco: number | null;
};

function lerCampos(form: FormData): Campos {
  let atributos: Atributo[] = [];
  try {
    const bruto = JSON.parse(String(form.get("atributos") ?? "[]"));
    if (Array.isArray(bruto)) {
      atributos = bruto
        .map((a) => ({ nome: String(a?.nome ?? "").trim().slice(0, 40), valor: String(a?.valor ?? "").trim().slice(0, 120) }))
        .filter((a) => a.nome && a.valor);
    }
  } catch {
    atributos = [];
  }
  const categoria = String(form.get("categoria") ?? "");
  return {
    id: String(form.get("id") ?? ""),
    titulo: String(form.get("titulo") ?? "").trim().slice(0, LIMITE_TITULO),
    descricao: String(form.get("descricao") ?? "").trim().slice(0, 2000),
    categoria: SLUGS_CATEGORIA.includes(categoria as SlugCategoria) ? (categoria as SlugCategoria) : null,
    atributos,
    preco: parseReais(String(form.get("preco") ?? "")),
  };
}

function colunas(c: Campos) {
  return {
    titulo: c.titulo || null,
    descricao: c.descricao || null,
    categoria_id: c.categoria ? idDaCategoria(c.categoria) : null,
    atributos: c.atributos,
    preco_centavos: c.preco,
  };
}

export async function salvarRascunho(_anterior: EstadoRevisao, form: FormData): Promise<EstadoRevisao> {
  const campos = lerCampos(form);
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("produtos").update(colunas(campos)).eq("id", campos.id);
  if (error) return { erro: "Não foi possível salvar agora. Tente de novo." };
  revalidatePath("/painel");
  return { salvo: "rascunho" };
}

export async function publicar(_anterior: EstadoRevisao, form: FormData): Promise<EstadoRevisao> {
  const campos = lerCampos(form);
  const faltando = [
    !campos.titulo && "o título",
    !campos.categoria && "a categoria",
    !campos.preco && "o preço",
  ].filter(Boolean);
  if (faltando.length) return { erro: `Falta preencher ${faltando.join(", ")}.` };

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sua sessão expirou. Entre de novo." };

  const { data: atual } = await supabase
    .from("produtos")
    .select("status, publicado_em")
    .eq("id", campos.id)
    .single();
  if (!atual) return { erro: "Produto não encontrado." };

  const agora = new Date().toISOString();
  const { error } = await supabase
    .from("produtos")
    .update({
      ...colunas(campos),
      status: "publicado",
      publicado_em: atual.publicado_em ?? agora,
    })
    .eq("id", campos.id);
  if (error) return { erro: "Não foi possível publicar agora. Tente de novo." };

  const { data: sessao } = await supabase
    .from("sessoes_cadastro")
    .select("id")
    .eq("produto_id", campos.id)
    .is("publicado_em", null)
    .maybeSingle();

  if (sessao) {
    const ia = interpretarRespostaIA(await lerRespostaIA(campos.id, user.id));
    const editados = camposEditados(
      {
        titulo: ia.titulo,
        descricao: ia.descricao,
        categoria: ia.categoria,
        atributos: ia.atributos,
        preco: ia.preco_mencionado_centavos,
      },
      {
        titulo: campos.titulo,
        descricao: campos.descricao,
        categoria: campos.categoria,
        atributos: campos.atributos,
        preco: campos.preco,
      },
    );
    await supabase
      .from("sessoes_cadastro")
      .update({ publicado_em: agora, campos_editados: editados })
      .eq("id", sessao.id);
  }

  revalidatePath("/painel");
  revalidatePath("/catalogo");
  return { salvo: "publicado" };
}

export async function arquivar(id: string): Promise<void> {
  const supabase = await criarClienteServidor();
  await supabase.from("produtos").update({ status: "arquivado" }).eq("id", id);
  revalidatePath("/painel");
}

export async function republicar(id: string): Promise<void> {
  const supabase = await criarClienteServidor();
  await supabase.from("produtos").update({ status: "publicado" }).eq("id", id).eq("status", "arquivado");
  revalidatePath("/painel");
}
