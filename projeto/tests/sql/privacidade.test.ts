import { beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { comoAnonimo, comoUsuario, criarBanco, JOSE, MARIA } from "./banco";

let db: PGlite;

beforeAll(async () => {
  db = await criarBanco();
  await db.exec(`
    insert into public.produtos (artesao_id, titulo, categoria_id, preco_centavos, status, ia_resposta, entrada_texto, audio_path)
    values ('${MARIA}', 'Bolo', 1, 1200, 'publicado', '{"transcricao":"segredo"}', 'texto privado', '${MARIA}/a.webm');
    insert into storage.objects (bucket_id, name) values
      ('produtos-fotos', '${MARIA}/rascunho.jpg'),
      ('produtos-audio', '${MARIA}/a.webm');
  `);
}, 60_000);

describe("colunas privadas de produtos", () => {
  it("visitante lê os campos públicos de um produto publicado", async () => {
    const linhas = await comoAnonimo<{ titulo: string }>(db, "select id, titulo, preco_centavos from public.produtos");
    expect(linhas.map((l) => l.titulo)).toEqual(["Bolo"]);
  });

  it("visitante não lê a transcrição do áudio", async () => {
    await expect(comoAnonimo(db, "select ia_resposta from public.produtos")).rejects.toThrow(/permission denied/);
  });

  it("visitante não lê o texto original nem o caminho do áudio", async () => {
    await expect(comoAnonimo(db, "select entrada_texto from public.produtos")).rejects.toThrow(/permission denied/);
    await expect(comoAnonimo(db, "select audio_path from public.produtos")).rejects.toThrow(/permission denied/);
  });

  it("outro artesão logado também não lê a transcrição", async () => {
    await expect(comoUsuario(db, JOSE, "select ia_resposta from public.produtos")).rejects.toThrow(/permission denied/);
  });

  it("artesão ainda consegue criar produto com os campos privados", async () => {
    const linhas = await comoUsuario<{ id: string }>(
      db,
      MARIA,
      `insert into public.produtos (artesao_id, entrada_texto, audio_path, ia_resposta)
       values ('${MARIA}', 'x', '${MARIA}/b.webm', '{}') returning id`,
    );
    expect(linhas).toHaveLength(1);
  });
});

describe("listagem do storage", () => {
  it("visitante não lista arquivos de nenhum bucket", async () => {
    const linhas = await comoAnonimo(db, "select name from storage.objects");
    expect(linhas).toEqual([]);
  });

  it("outro artesão não lista os arquivos da Maria", async () => {
    const linhas = await comoUsuario(db, JOSE, "select name from storage.objects");
    expect(linhas).toEqual([]);
  });
});
