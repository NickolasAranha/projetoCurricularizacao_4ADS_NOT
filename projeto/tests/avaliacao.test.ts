import { describe, expect, it } from "vitest";
import { lerAvaliacao, type Avaliacao } from "@/lib/avaliacao";

function formulario(mudar: Record<string, string | null> = {}): FormData {
  const valores: Record<string, string | null> = {
    consentimento: "sim",
    ...Object.fromEntries([5, 1, 5, 2, 4, 1, 5, 1, 5, 2].map((n, i) => [`sus_${i + 1}`, String(n)])),
    descricoes_atrativas: "5",
    facilidade: "4",
    texto_qualidade: "5",
    texto_mudanca: "pouca",
    info_errada: "nao",
    info_errada_qual: "",
    modo_preferido: "audio",
    comparado_antes: "5",
    pedidos_whatsapp: "1_a_2",
    satisfacao: "5",
    recomendacao: "10",
    mais_ajudou: "  Só falar  ",
    mais_atrapalhou: "",
    faltou: "",
    autorizacao_uso: "so_foto",
    ...mudar,
  };
  const form = new FormData();
  for (const [k, v] of Object.entries(valores)) if (v !== null) form.set(k, v);
  return form;
}

function dados(form: FormData): Avaliacao {
  const r = lerAvaliacao(form);
  if ("erro" in r) throw new Error(r.erro);
  return r.dados;
}

describe("lerAvaliacao", () => {
  it("lê todas as respostas", () => {
    const d = dados(formulario());
    expect(d.sus_respostas).toEqual([5, 1, 5, 2, 4, 1, 5, 1, 5, 2]);
    expect(d.facilidade).toBe(4);
    expect(d.recomendacao).toBe(10);
    expect(d.texto_mudanca).toBe("pouca");
    expect(d.mais_ajudou).toBe("Só falar");
    expect(d.mais_atrapalhou).toBeNull();
    expect(d.autorizacao_uso).toBe("so_foto");
  });

  it("não envia sem consentimento", () => {
    expect(lerAvaliacao(formulario({ consentimento: null }))).toEqual({
      erro: "Para enviar, é preciso concordar em participar.",
    });
  });

  it("aponta qual frase do SUS falta", () => {
    expect(lerAvaliacao(formulario({ sus_7: null }))).toEqual({
      erro: "Falta responder a frase 7 da primeira parte.",
    });
  });

  it("recusa nota fora da escala e opção que não existe", () => {
    expect("erro" in lerAvaliacao(formulario({ sus_1: "6" }))).toBe(true);
    expect("erro" in lerAvaliacao(formulario({ satisfacao: "2.5" }))).toBe(true);
    expect("erro" in lerAvaliacao(formulario({ recomendacao: "11" }))).toBe(true);
    expect("erro" in lerAvaliacao(formulario({ modo_preferido: "video" }))).toBe(true);
  });

  it("aceita recomendação zero", () => {
    expect(dados(formulario({ recomendacao: "0" })).recomendacao).toBe(0);
  });

  it("só guarda qual informação errada quando a resposta é sim", () => {
    expect(dados(formulario({ info_errada: "nao", info_errada_qual: "preço" })).info_errada_qual).toBeNull();
    expect(dados(formulario({ info_errada: "uma_vez", info_errada_qual: "preço" })).info_errada_qual).toBe("preço");
  });

  it("corta textos longos", () => {
    expect(dados(formulario({ faltou: "a".repeat(3000) })).faltou).toHaveLength(2000);
  });
});
