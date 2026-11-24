import { SLUGS_CATEGORIA, type SlugCategoria } from "@/lib/categorias";
import type { Atributo } from "@/lib/tipos";

export const LIMITE_TITULO = 60;
export const LIMITE_DESCRICAO = 600;

export type RespostaIA = {
  transcricao: string | null;
  titulo: string;
  descricao: string;
  categoria: SlugCategoria;
  atributos: Atributo[];
  preco_mencionado_centavos: number | null;
};

export const RESPOSTA_VAZIA: RespostaIA = {
  transcricao: null,
  titulo: "",
  descricao: "",
  categoria: "outros",
  atributos: [],
  preco_mencionado_centavos: null,
};

function texto(valor: unknown, limite?: number): string {
  if (typeof valor !== "string") return "";
  const limpo = valor.trim();
  return limite ? limpo.slice(0, limite).trim() : limpo;
}

export function interpretarRespostaIA(bruto: unknown): RespostaIA {
  if (!bruto || typeof bruto !== "object") return { ...RESPOSTA_VAZIA };
  const r = bruto as Record<string, unknown>;

  const categoria = SLUGS_CATEGORIA.includes(r.categoria as SlugCategoria)
    ? (r.categoria as SlugCategoria)
    : "outros";

  const atributos = Array.isArray(r.atributos)
    ? r.atributos
        .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === "object")
        .map((a) => ({ nome: texto(a.nome, 40), valor: texto(a.valor, 120) }))
        .filter((a) => a.nome && a.valor)
        .slice(0, 8)
    : [];

  const preco = r.preco_mencionado_centavos;
  const precoValido = typeof preco === "number" && Number.isInteger(preco) && preco > 0 ? preco : null;

  const transcricao = texto(r.transcricao);

  return {
    transcricao: transcricao || null,
    titulo: texto(r.titulo, LIMITE_TITULO),
    descricao: texto(r.descricao, LIMITE_DESCRICAO * 2),
    categoria,
    atributos,
    preco_mencionado_centavos: precoValido,
  };
}
