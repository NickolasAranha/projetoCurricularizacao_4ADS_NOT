import { beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { comoAnonimo, criarBanco, MARIA } from "./banco";

let db: PGlite;

type Tempo = { media_min: string; concluidas: number; abandonadas: number; iniciadas: number };

beforeAll(async () => {
  db = await criarBanco();
  await db.exec(`
    insert into public.sessoes_cadastro (artesao_id, iniciado_em, publicado_em) values
      ('${MARIA}', now() - interval '3 days', now() - interval '3 days' + interval '4 minutes'),
      ('${MARIA}', now() - interval '3 days', now() - interval '3 days' + interval '6 minutes'),
      ('${MARIA}', now() - interval '3 days', now() - interval '2 days' + interval '1 hour'),
      ('${MARIA}', now() - interval '2 days', null),
      ('${MARIA}', now() - interval '5 minutes', null);
  `);
}, 60_000);

describe("kpi_tempo_cadastro", () => {
  it("publicação depois de 24 h conta como abandono, não entra na média", async () => {
    const [tempo] = await comoAnonimo<Tempo>(db, "select * from public.kpi_tempo_cadastro()");
    expect(tempo.concluidas).toBe(2);
    expect(Number(tempo.media_min)).toBe(5);
    expect(tempo.abandonadas).toBe(2);
    expect(tempo.iniciadas).toBe(5);
  });
});
