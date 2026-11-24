// Cada operação que o app faz no banco, com o papel que a faz.
// O banco de teste começa sem permissões nas tabelas, como um projeto novo do Supabase.
import { beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { comoAnonimo, comoServico, comoUsuario, criarBanco, MARIA } from "./banco";

const ANA = "00000000-0000-0000-0000-00000000000c";
let db: PGlite;
let produtoId: string;
let sessaoId: string;

beforeAll(async () => {
  db = await criarBanco();
  await db.exec(`insert into auth.users values ('${ANA}')`);
}, 60_000);

describe("visitante", () => {
  it("lê categorias, perfis e fotos de produtos publicados", async () => {
    await comoAnonimo(db, "select id, slug, nome from public.categorias");
    await comoAnonimo(db, "select id, slug, nome_exibicao, whatsapp, cidade, bio, foto_path from public.artesaos");
    await comoAnonimo(db, "select storage_path, ordem from public.produto_fotos");
  });

  it("não lê sessões de cadastro nem respostas de usabilidade", async () => {
    await expect(comoAnonimo(db, "select id from public.sessoes_cadastro")).rejects.toThrow(/permission denied/);
    await expect(comoAnonimo(db, "select id from public.respostas_usabilidade")).rejects.toThrow(/permission denied/);
  });
});

describe("artesão logado", () => {
  it("cria o próprio perfil e edita", async () => {
    await comoUsuario(
      db,
      ANA,
      `insert into public.artesaos (id, slug, nome_exibicao, whatsapp) values ('${ANA}', 'ana-doces', 'Ana', '5511900000000')`,
    );
    await comoUsuario(db, ANA, `update public.artesaos set bio = 'Doces caseiros' where id = '${ANA}'`);
  });

  it("abre sessão, cria produto com fotos, revisa e publica", async () => {
    [{ id: sessaoId }] = await comoUsuario<{ id: string }>(
      db,
      MARIA,
      `insert into public.sessoes_cadastro (artesao_id) values ('${MARIA}') returning id`,
    );
    [{ id: produtoId }] = await comoUsuario<{ id: string }>(
      db,
      MARIA,
      `insert into public.produtos (artesao_id, entrada_texto, ia_resposta) values ('${MARIA}', 'bolo', '{}') returning id`,
    );
    await comoUsuario(
      db,
      MARIA,
      `insert into public.produto_fotos (produto_id, storage_path, ordem) values ('${produtoId}', '${MARIA}/f.jpg', 0)`,
    );
    await comoUsuario(
      db,
      MARIA,
      `update public.sessoes_cadastro set produto_id = '${produtoId}', ia_concluida_em = now() where id = '${sessaoId}'`,
    );
    await comoUsuario(
      db,
      MARIA,
      `update public.produtos set titulo = 'Bolo', categoria_id = 1, preco_centavos = 1200,
         status = 'publicado', publicado_em = now() where id = '${produtoId}'`,
    );
    const sessoes = await comoUsuario(db, MARIA, `select id from public.sessoes_cadastro where produto_id = '${produtoId}'`);
    expect(sessoes).toHaveLength(1);
    await comoUsuario(db, MARIA, `update public.sessoes_cadastro set publicado_em = now() where id = '${sessaoId}'`);
  });
});

describe("servidor com a chave secreta", () => {
  it("lê a resposta da IA do produto", async () => {
    const linhas = await comoServico<{ ia_resposta: unknown }>(
      db,
      `select ia_resposta from public.produtos where id = '${produtoId}'`,
    );
    expect(linhas).toHaveLength(1);
  });

  it("importa respostas de usabilidade", async () => {
    await comoServico(
      db,
      `insert into public.respostas_usabilidade (participante, sus_respostas, sus_pontuacao)
       values ('p1', '{5,1,5,1,5,1,5,1,5,1}', 100)
       on conflict (participante) do update set sus_pontuacao = excluded.sus_pontuacao`,
    );
  });

  it("lê e apaga eventos", async () => {
    await comoServico(db, "select id from public.eventos");
    await comoServico(db, "delete from public.eventos where false");
  });
});
