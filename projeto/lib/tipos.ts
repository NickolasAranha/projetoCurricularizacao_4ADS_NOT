export type Categoria = { id: number; slug: string; nome: string; ordem: number };

export type Artesao = {
  id: string;
  slug: string;
  nome_exibicao: string;
  whatsapp: string;
  cidade: string | null;
  bio: string | null;
  foto_path: string | null;
  criado_em: string;
};

export type StatusProduto = "rascunho" | "publicado" | "arquivado";

export type Atributo = { nome: string; valor: string };

export type Produto = {
  id: string;
  artesao_id: string;
  titulo: string | null;
  descricao: string | null;
  categoria_id: number | null;
  preco_centavos: number | null;
  atributos: Atributo[];
  status: StatusProduto;
  entrada_texto: string | null;
  audio_path: string | null;
  ia_resposta: unknown;
  criado_em: string;
  atualizado_em: string;
  publicado_em: string | null;
};

export type ProdutoFoto = { id: string; produto_id: string; storage_path: string; ordem: number };

export type TipoEvento = "visita_catalogo" | "visita_vitrine" | "visita_produto" | "clique_whatsapp";
