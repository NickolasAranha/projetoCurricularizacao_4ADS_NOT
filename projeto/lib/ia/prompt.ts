import { CATEGORIAS } from "@/lib/categorias";
import { LIMITE_DESCRICAO, LIMITE_TITULO } from "./esquema";

export const ESQUEMA_JSON = {
  type: "object",
  properties: {
    transcricao: {
      type: ["string", "null"],
      description: "Transcrição fiel do áudio, se houver áudio. Null se não houver.",
    },
    titulo: { type: "string", description: `Título do anúncio, no máximo ${LIMITE_TITULO} caracteres.` },
    descricao: { type: "string", description: `Descrição de venda, no máximo ${LIMITE_DESCRICAO} caracteres.` },
    categoria: { type: "string", enum: CATEGORIAS.map((c) => c.slug) },
    atributos: {
      type: "array",
      items: {
        type: "object",
        properties: { nome: { type: "string" }, valor: { type: "string" } },
        required: ["nome", "valor"],
      },
    },
    preco_mencionado_centavos: {
      type: ["integer", "null"],
      description: "Preço em centavos SOMENTE se o artesão disse ou escreveu o preço. Caso contrário, null.",
    },
  },
  required: ["transcricao", "titulo", "descricao", "categoria", "atributos", "preco_mencionado_centavos"],
} as const;

export function montarPrompt(texto: string | null): string {
  const categorias = CATEGORIAS.map((c) => `- ${c.slug}: ${c.nome}`).join("\n");
  return [
    "Você ajuda pequenos produtores e artesãos brasileiros a montar o anúncio de um produto feito por eles.",
    "Você recebe foto(s) do produto e a descrição do artesão, em áudio e/ou texto.",
    "",
    "Monte o anúncio seguindo estas regras:",
    `1. Título com no máximo ${LIMITE_TITULO} caracteres, claro e atraente, dizendo o que é o produto.`,
    `2. Descrição com no máximo ${LIMITE_DESCRICAO} caracteres, em português do Brasil, tom acolhedor e simples, em 2 ou 3 frases curtas ou um parágrafo.`,
    "3. Use SOMENTE o que o artesão disse ou escreveu e o que se vê claramente na foto.",
    "4. NUNCA invente preço, ingredientes, medidas, peso, materiais, prazos, validade, promessas de saúde ou de entrega.",
    "5. Se faltar informação, escreva algo curto e verdadeiro em vez de inventar.",
    "6. Sem emojis, sem pontos de exclamação, sem palavras como 'incrível', 'imperdível', 'revolucionário', sem letras maiúsculas para enfatizar.",
    "7. Em atributos, liste só fatos ditos pelo artesão ou visíveis (ex.: Sabor: Morango; Tamanho: 15 cm). No máximo 6.",
    "8. Escolha a categoria mais adequada desta lista (use o slug):",
    categorias,
    "9. Preço: preencha preco_mencionado_centavos só se o artesão falou ou escreveu o preço (ex.: 'doze reais' = 1200). Caso contrário, null.",
    "10. Se houver áudio, coloque em transcricao o que foi falado, sem corrigir o sentido.",
    "",
    texto ? `Texto escrito pelo artesão:\n"""${texto}"""` : "O artesão não escreveu texto.",
  ].join("\n");
}
