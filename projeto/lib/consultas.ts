import "server-only";
import { cache } from "react";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CATEGORIAS } from "@/lib/categorias";
import type { Artesao, Atributo, Produto } from "@/lib/tipos";

export type ArtesaoResumo = Pick<Artesao, "id" | "slug" | "nome_exibicao" | "whatsapp">;

export type ProdutoComCapa = Pick<
  Produto,
  "id" | "titulo" | "descricao" | "preco_centavos" | "categoria_id" | "publicado_em"
> & {
  capa: string | null;
  artesao: ArtesaoResumo;
};

export type ProdutoCompleto = ProdutoComCapa & { atributos: Atributo[]; fotos: string[] };

const SELECAO =
  "id, titulo, descricao, preco_centavos, categoria_id, publicado_em, atributos, artesao:artesaos(id, slug, nome_exibicao, whatsapp), produto_fotos(storage_path, ordem)";

type Linha = {
  id: string;
  titulo: string | null;
  descricao: string | null;
  preco_centavos: number | null;
  categoria_id: number | null;
  publicado_em: string | null;
  atributos: Atributo[] | null;
  artesao: ArtesaoResumo | ArtesaoResumo[];
  produto_fotos: { storage_path: string; ordem: number }[] | null;
};

function montar(linha: Linha): ProdutoCompleto {
  const fotos = [...(linha.produto_fotos ?? [])].sort((a, b) => a.ordem - b.ordem).map((f) => f.storage_path);
  const artesao = Array.isArray(linha.artesao) ? linha.artesao[0] : linha.artesao;
  return {
    id: linha.id,
    titulo: linha.titulo,
    descricao: linha.descricao,
    preco_centavos: linha.preco_centavos,
    categoria_id: linha.categoria_id,
    publicado_em: linha.publicado_em,
    atributos: linha.atributos ?? [],
    artesao,
    fotos,
    capa: fotos[0] ?? null,
  };
}

export async function listarPublicados(filtro: { categoriaSlug?: string; artesaoId?: string } = {}): Promise<ProdutoComCapa[]> {
  const supabase = await criarClienteServidor();
  let consulta = supabase
    .from("produtos")
    .select(SELECAO)
    .eq("status", "publicado")
    .order("publicado_em", { ascending: false })
    .limit(200);

  if (filtro.categoriaSlug) {
    const categoria = CATEGORIAS.find((c) => c.slug === filtro.categoriaSlug);
    if (!categoria) return [];
    consulta = consulta.eq("categoria_id", categoria.id);
  }
  if (filtro.artesaoId) consulta = consulta.eq("artesao_id", filtro.artesaoId);

  const { data } = await consulta;
  return ((data ?? []) as unknown as Linha[]).map(montar);
}

export const buscarArtesaoPorSlug = cache(async (slug: string): Promise<Artesao | null> => {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("artesaos").select("*").eq("slug", slug).maybeSingle();
  return (data as Artesao | null) ?? null;
});

export const buscarProdutoPublicado = cache(async (id: string): Promise<ProdutoCompleto | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("produtos").select(SELECAO).eq("id", id).eq("status", "publicado").maybeSingle();
  return data ? montar(data as unknown as Linha) : null;
});
