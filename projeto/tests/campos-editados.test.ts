import { describe, expect, it } from "vitest";
import { camposEditados } from "@/lib/campos-editados";

describe("camposEditados", () => {
  it("lista só os campos diferentes", () => {
    expect(camposEditados({ titulo: "A", preco: 100 }, { titulo: "B", preco: 100 })).toEqual(["titulo"]);
  });
  it("compara atributos pelo conteúdo", () => {
    expect(
      camposEditados({ atributos: [{ nome: "Sabor", valor: "Uva" }] }, { atributos: [{ nome: "Sabor", valor: "Uva" }] }),
    ).toEqual([]);
  });
  it("mantém a ordem fixa", () => {
    expect(
      camposEditados({ preco: 1, titulo: "A", categoria: "x" }, { preco: 2, titulo: "B", categoria: "y" }),
    ).toEqual(["titulo", "categoria", "preco"]);
  });
});
