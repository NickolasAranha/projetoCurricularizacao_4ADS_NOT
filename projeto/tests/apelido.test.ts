import { describe, expect, it } from "vitest";
import { apelidoValido, emailDoApelido, normalizarApelido } from "@/lib/apelido";

describe("normalizarApelido", () => {
  it("troca espaços por hífen e usa minúsculas", () => {
    expect(normalizarApelido("Dona Maria")).toBe("dona-maria");
  });
  it("remove acentos e colapsa espaços", () => {
    expect(normalizarApelido("  João  da   Silva ")).toBe("joao-da-silva");
  });
  it("troca símbolos por hífen", () => {
    expect(normalizarApelido("Ateliê_Ç@ 2")).toBe("atelie-c-2");
  });
  it("apara hífens nas pontas", () => {
    expect(normalizarApelido("--ana--")).toBe("ana");
  });
});

describe("apelidoValido", () => {
  it("exige de 3 a 30 caracteres", () => {
    expect(apelidoValido("ab")).toBe(false);
    expect(apelidoValido("a".repeat(31))).toBe(false);
    expect(apelidoValido("dona-maria")).toBe(true);
  });
  it("recusa caracteres fora de a-z, 0-9 e hífen", () => {
    expect(apelidoValido("Dona-Maria")).toBe(false);
  });
});

describe("emailDoApelido", () => {
  it("usa o domínio fictício", () => {
    expect(emailDoApelido("dona-maria")).toBe("dona-maria@catalogo.local");
  });
});
