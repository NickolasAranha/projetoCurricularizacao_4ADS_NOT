import { describe, expect, it } from "vitest";
import { pontuacaoSus } from "@/lib/kpi";

describe("pontuacaoSus", () => {
  it("dá 100 para a melhor resposta possível", () => {
    expect(pontuacaoSus([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
  });
  it("dá 0 para a pior resposta possível", () => {
    expect(pontuacaoSus([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0);
  });
  it("dá 50 para respostas neutras", () => {
    expect(pontuacaoSus([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  });
  it("exige 10 respostas", () => {
    expect(() => pontuacaoSus([3, 3])).toThrow();
  });
  it("exige notas de 1 a 5", () => {
    expect(() => pontuacaoSus([6, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toThrow();
  });
});
