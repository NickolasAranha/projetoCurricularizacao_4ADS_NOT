import { describe, expect, it } from "vitest";
import { adicionarItem, agruparPorArtesao, alterarQuantidade, removerArtesao, type ItemCarrinho } from "@/lib/carrinho";
import { montarMensagemPedido } from "@/lib/whatsapp";

const maria = { id: "a1", slug: "dona-maria", nome: "Maria", whatsapp: "5511987654321" };
const jose = { id: "a2", slug: "seu-jose", nome: "José", whatsapp: "5511912345678" };
const bolo: ItemCarrinho = {
  produtoId: "p1",
  titulo: "Bolo de pote de morango",
  precoCentavos: 1200,
  quantidade: 2,
  capa: null,
  artesao: maria,
};
const pano: ItemCarrinho = {
  produtoId: "p2",
  titulo: "Pano de prato bordado",
  precoCentavos: 1800,
  quantidade: 1,
  capa: null,
  artesao: maria,
};
const banco: ItemCarrinho = { produtoId: "p3", titulo: "Banco", precoCentavos: 9000, quantidade: 1, capa: null, artesao: jose };

describe("carrinho", () => {
  it("soma o total do grupo", () => {
    expect(agruparPorArtesao([bolo, pano])[0].totalCentavos).toBe(4200);
  });
  it("separa artesãos diferentes em grupos na ordem de chegada", () => {
    const grupos = agruparPorArtesao([bolo, banco, pano]);
    expect(grupos.map((g) => g.artesao.id)).toEqual(["a1", "a2"]);
    expect(grupos[0].itens.map((i) => i.produtoId)).toEqual(["p1", "p2"]);
  });
  it("soma quantidade ao adicionar produto repetido", () => {
    expect(adicionarItem([bolo], { ...bolo, quantidade: 1 })[0].quantidade).toBe(3);
  });
  it("remove item com quantidade zero", () => {
    expect(alterarQuantidade([bolo], "p1", 0)).toEqual([]);
  });
  it("altera quantidade", () => {
    expect(alterarQuantidade([bolo], "p1", 5)[0].quantidade).toBe(5);
  });
  it("remove só os itens de um artesão", () => {
    expect(removerArtesao([bolo, banco, pano], "a1")).toEqual([banco]);
  });
});

describe("montarMensagemPedido", () => {
  it("monta a mensagem com itens, preços e total", () => {
    const [grupo] = agruparPorArtesao([bolo, pano]);
    expect(montarMensagemPedido(grupo)).toBe(
      "Olá, Maria! Vi seu catálogo e quero fazer um pedido:\n" +
        "- 2x Bolo de pote de morango (R$ 12,00 cada) = R$ 24,00\n" +
        "- 1x Pano de prato bordado (R$ 18,00) = R$ 18,00\n" +
        "Total: R$ 42,00",
    );
  });
});
