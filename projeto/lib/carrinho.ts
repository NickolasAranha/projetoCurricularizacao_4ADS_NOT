export type ArtesaoCarrinho = { id: string; slug: string; nome: string; whatsapp: string };

export type ItemCarrinho = {
  produtoId: string;
  titulo: string;
  precoCentavos: number;
  quantidade: number;
  capa: string | null;
  artesao: ArtesaoCarrinho;
};

export type GrupoCarrinho = { artesao: ArtesaoCarrinho; itens: ItemCarrinho[]; totalCentavos: number };

export function adicionarItem(itens: ItemCarrinho[], novo: ItemCarrinho): ItemCarrinho[] {
  const existente = itens.find((i) => i.produtoId === novo.produtoId);
  if (!existente) return [...itens, novo];
  return itens.map((i) => (i.produtoId === novo.produtoId ? { ...i, quantidade: i.quantidade + novo.quantidade } : i));
}

export function alterarQuantidade(itens: ItemCarrinho[], produtoId: string, quantidade: number): ItemCarrinho[] {
  if (quantidade <= 0) return itens.filter((i) => i.produtoId !== produtoId);
  return itens.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i));
}

export function removerArtesao(itens: ItemCarrinho[], artesaoId: string): ItemCarrinho[] {
  return itens.filter((i) => i.artesao.id !== artesaoId);
}

export function agruparPorArtesao(itens: ItemCarrinho[]): GrupoCarrinho[] {
  const grupos = new Map<string, GrupoCarrinho>();
  for (const item of itens) {
    const grupo = grupos.get(item.artesao.id) ?? { artesao: item.artesao, itens: [], totalCentavos: 0 };
    grupo.itens.push(item);
    grupo.totalCentavos += item.precoCentavos * item.quantidade;
    grupos.set(item.artesao.id, grupo);
  }
  return [...grupos.values()];
}
