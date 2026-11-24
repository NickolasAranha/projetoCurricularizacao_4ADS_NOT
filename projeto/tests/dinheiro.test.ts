import { describe, expect, it } from "vitest";
import { formatarReais, parseReais } from "@/lib/dinheiro";

describe("formatarReais", () => {
  it("formata milhar e centavos", () => {
    expect(formatarReais(123456)).toBe("R$ 1.234,56");
  });
  it("formata valor inteiro", () => {
    expect(formatarReais(500)).toBe("R$ 5,00");
  });
});

describe("parseReais", () => {
  it("lê inteiro", () => expect(parseReais("12")).toBe(1200));
  it("lê uma casa decimal", () => expect(parseReais("12,5")).toBe(1250));
  it("lê com prefixo R$", () => expect(parseReais("R$ 12,50")).toBe(1250));
  it("lê milhar com ponto", () => expect(parseReais("1.234,56")).toBe(123456));
  it("lê ponto decimal", () => expect(parseReais("12.50")).toBe(1250));
  it("recusa zero", () => expect(parseReais("0")).toBeNull());
  it("recusa vazio", () => expect(parseReais("")).toBeNull());
  it("recusa texto", () => expect(parseReais("abc")).toBeNull());
  it("recusa negativo", () => expect(parseReais("-3")).toBeNull());
});
