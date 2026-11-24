export const CAMPOS_REVISAO = ["titulo", "descricao", "categoria", "atributos", "preco"] as const;

export type CampoRevisao = (typeof CAMPOS_REVISAO)[number];

export type ValoresRevisao = Partial<Record<CampoRevisao, unknown>>;

export function camposEditados(original: ValoresRevisao, final: ValoresRevisao): CampoRevisao[] {
  return CAMPOS_REVISAO.filter((campo) => JSON.stringify(original[campo] ?? null) !== JSON.stringify(final[campo] ?? null));
}
