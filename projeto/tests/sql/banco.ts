// Banco Postgres em memória (PGlite) com as partes do Supabase que as migrações usam.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const PASTA_MIGRACOES = path.join(__dirname, "../../supabase/migrations");

const STUBS_SUPABASE = `
create role anon; create role authenticated; create role service_role;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable
  as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable
  as $$ select string_to_array(name, '/') $$;
grant usage on schema public, auth, storage to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
grant all on all tables in schema storage to anon, authenticated;
`;

export const MARIA = "00000000-0000-0000-0000-00000000000a";
export const JOSE = "00000000-0000-0000-0000-00000000000b";

export async function criarBanco(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(STUBS_SUPABASE);
  for (const arquivo of readdirSync(PASTA_MIGRACOES).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(path.join(PASTA_MIGRACOES, arquivo), "utf8"));
  }
  await db.exec(`
    insert into auth.users values ('${MARIA}'), ('${JOSE}');
    insert into public.artesaos (id, slug, nome_exibicao, whatsapp) values
      ('${MARIA}', 'dona-maria', 'Maria', '5511987654321'),
      ('${JOSE}', 'seu-jose', 'José', '5511912345678');
  `);
  return db;
}

export async function comoAnonimo<T>(db: PGlite, sql: string): Promise<T[]> {
  await db.exec("reset test.uid; set role anon;");
  try {
    return (await db.query<T>(sql)).rows;
  } finally {
    await db.exec("reset role;");
  }
}

export async function comoUsuario<T>(db: PGlite, uid: string, sql: string): Promise<T[]> {
  await db.exec(`set test.uid = '${uid}'; set role authenticated;`);
  try {
    return (await db.query<T>(sql)).rows;
  } finally {
    await db.exec("reset role; reset test.uid;");
  }
}
