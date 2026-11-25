// Formulário Depois respondido dentro do painel (migração 0008).
import { beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { comoAnonimo, comoServico, comoUsuario, criarBanco, JOSE, MARIA } from "./banco";

let db: PGlite;

beforeAll(async () => {
  db = await criarBanco();
}, 60_000);

function inserir(artesaoId: string, extra = "") {
  // Sem sus_pontuacao, como o painel envia: o banco preenche.
  return `insert into public.respostas_usabilidade (artesao_id, sus_respostas, satisfacao, recomendacao${extra ? ", participante" : ""})
    values ('${artesaoId}', '{5,1,5,2,4,1,5,1,5,2}', 5, 9${extra ? `, '${extra}'` : ""}) returning sus_pontuacao`;
}

describe("artesão responde no painel", () => {
  it("envia a própria resposta e o banco calcula a pontuação SUS", async () => {
    const [linha] = await comoUsuario<{ sus_pontuacao: string }>(db, MARIA, inserir(MARIA));
    expect(Number(linha.sus_pontuacao)).toBe(92.5);
  });

  it("vê que já respondeu", async () => {
    const linhas = await comoUsuario(db, MARIA, "select id from public.respostas_usabilidade");
    expect(linhas).toHaveLength(1);
  });

  it("não responde duas vezes", async () => {
    await expect(comoUsuario(db, MARIA, inserir(MARIA))).rejects.toThrow(/unique|duplicate/);
  });

  it("não envia resposta em nome de outro artesão nem com código de participante", async () => {
    await expect(comoUsuario(db, JOSE, inserir(MARIA))).rejects.toThrow(/row-level security/);
    await expect(comoUsuario(db, JOSE, inserir(JOSE, "P1"))).rejects.toThrow(/row-level security/);
  });

  it("não lê a resposta de outro artesão nem altera a própria", async () => {
    expect(await comoUsuario(db, JOSE, "select id from public.respostas_usabilidade")).toEqual([]);
    await expect(
      comoUsuario(db, MARIA, "update public.respostas_usabilidade set satisfacao = 1"),
    ).rejects.toThrow(/permission denied/);
  });

  it("visitante continua sem ler as respostas, só os números agregados", async () => {
    await expect(comoAnonimo(db, "select id from public.respostas_usabilidade")).rejects.toThrow(/permission denied/);
    const [kpi] = await comoAnonimo<{ n: number; sus_medio: string }>(db, "select * from public.kpi_usabilidade()");
    expect(kpi.n).toBe(1);
    expect(Number(kpi.sus_medio)).toBe(92.5);
  });

  it("recusa nota SUS fora da escala", async () => {
    await expect(
      comoUsuario(
        db,
        JOSE,
        `insert into public.respostas_usabilidade (artesao_id, sus_respostas, sus_pontuacao)
         values ('${JOSE}', '{5,1,5,2,4,1,5,1,5,9}', 0)`,
      ),
    ).rejects.toThrow(/1 a 5/);
  });
});

describe("importação do CSV continua funcionando", () => {
  it("grava pelo código do participante, sem artesão", async () => {
    const [linha] = await comoServico<{ sus_pontuacao: string }>(
      db,
      `insert into public.respostas_usabilidade (participante, sus_respostas, sus_pontuacao)
       values ('P2', '{5,1,5,1,5,1,5,1,5,1}', 100)
       on conflict (participante) do update set sus_pontuacao = excluded.sus_pontuacao
       returning sus_pontuacao`,
    );
    expect(Number(linha.sus_pontuacao)).toBe(100);
  });

  it("recusa resposta sem código e sem artesão", async () => {
    await expect(
      comoServico(
        db,
        `insert into public.respostas_usabilidade (sus_respostas, sus_pontuacao) values ('{5,1,5,1,5,1,5,1,5,1}', 100)`,
      ),
    ).rejects.toThrow(/identificada/);
  });
});
