export const CATEGORIAS = [
  { id: 1, slug: "doces-e-salgados", nome: "Doces e Salgados" },
  { id: 2, slug: "costura-e-moda", nome: "Costura e Moda" },
  { id: 3, slug: "madeira-e-marcenaria", nome: "Madeira e Marcenaria" },
  { id: 4, slug: "artesanato-e-decoracao", nome: "Artesanato e Decoração" },
  { id: 5, slug: "beleza-e-cuidados", nome: "Beleza e Cuidados" },
  { id: 6, slug: "outros", nome: "Outros" },
] as const;

export type SlugCategoria = (typeof CATEGORIAS)[number]["slug"];

export const SLUGS_CATEGORIA = CATEGORIAS.map((c) => c.slug) as SlugCategoria[];

export function idDaCategoria(slug: string): number {
  return CATEGORIAS.find((c) => c.slug === slug)?.id ?? 6;
}

export function categoriaPorId(id: number | null | undefined) {
  return CATEGORIAS.find((c) => c.id === id) ?? null;
}
