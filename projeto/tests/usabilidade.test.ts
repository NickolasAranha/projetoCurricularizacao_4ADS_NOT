import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lerCsv, respostasDoCsv } from "@/lib/usabilidade";

const csv = readFileSync(path.join(__dirname, "fixtures/depois_exemplo.csv"), "utf8");

describe("lerCsv", () => {
  it("respeita aspas, aspas duplicadas e vírgulas dentro do campo", () => {
    expect(lerCsv('a,"b, c","d ""e"""\n1,2,3\n')).toEqual([
      ["a", "b, c", 'd "e"'],
      ["1", "2", "3"],
    ]);
  });
  it("aceita quebra de linha CRLF", () => {
    expect(lerCsv("a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("respostasDoCsv", () => {
  it("ignora quem não consentiu", () => {
    expect(respostasDoCsv(csv).map((r) => r.participante)).toEqual(["P1"]);
  });
  it("lê SUS, pontuação, facilidade e satisfação", () => {
    const [p1] = respostasDoCsv(csv);
    expect(p1.sus_respostas).toEqual([5, 1, 5, 2, 4, 1, 5, 1, 5, 2]);
    expect(p1.sus_pontuacao).toBe(92.5);
    expect(p1.facilidade).toBe(4);
    expect(p1.satisfacao).toBe(5);
  });
  it("falha com mensagem clara quando falta coluna", () => {
    expect(() => respostasDoCsv("a,b\n1,2\n")).toThrow(/Código do participante/);
  });
});
