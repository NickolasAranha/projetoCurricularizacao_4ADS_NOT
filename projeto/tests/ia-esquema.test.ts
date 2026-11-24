import { describe, expect, it } from "vitest";
import { interpretarRespostaIA } from "@/lib/ia/esquema";

describe("interpretarRespostaIA", () => {
  it("corta título acima de 60 caracteres", () => {
    expect(interpretarRespostaIA({ titulo: "x".repeat(80) }).titulo.length).toBe(60);
  });
  it("troca categoria desconhecida por outros", () => {
    expect(interpretarRespostaIA({ categoria: "eletronicos" }).categoria).toBe("outros");
  });
  it("mantém categoria válida", () => {
    expect(interpretarRespostaIA({ categoria: "doces-e-salgados" }).categoria).toBe("doces-e-salgados");
  });
  it("transforma atributos inválidos em lista vazia", () => {
    expect(interpretarRespostaIA({ atributos: null }).atributos).toEqual([]);
  });
  it("descarta atributos sem nome ou valor", () => {
    expect(
      interpretarRespostaIA({ atributos: [{ nome: "Sabor", valor: "Morango" }, { nome: "", valor: "x" }, "lixo"] })
        .atributos,
    ).toEqual([{ nome: "Sabor", valor: "Morango" }]);
  });
  it("não quebra com entrada que não é objeto", () => {
    const r = interpretarRespostaIA("lixo");
    expect(r.titulo).toBe("");
    expect(r.descricao).toBe("");
    expect(r.categoria).toBe("outros");
    expect(r.transcricao).toBeNull();
    expect(r.preco_mencionado_centavos).toBeNull();
  });
  it("mantém preço mencionado positivo e inteiro", () => {
    expect(interpretarRespostaIA({ preco_mencionado_centavos: 1200 }).preco_mencionado_centavos).toBe(1200);
  });
  it("descarta preço negativo", () => {
    expect(interpretarRespostaIA({ preco_mencionado_centavos: -5 }).preco_mencionado_centavos).toBeNull();
  });
});
