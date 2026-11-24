-- Schema do catálogo de artesãos

create table public.categorias (
  id smallint primary key,
  slug text not null unique,
  nome text not null,
  ordem smallint not null
);

insert into public.categorias (id, slug, nome, ordem) values
  (1, 'doces-e-salgados', 'Doces e Salgados', 1),
  (2, 'costura-e-moda', 'Costura e Moda', 2),
  (3, 'madeira-e-marcenaria', 'Madeira e Marcenaria', 3),
  (4, 'artesanato-e-decoracao', 'Artesanato e Decoração', 4),
  (5, 'beleza-e-cuidados', 'Beleza e Cuidados', 5),
  (6, 'outros', 'Outros', 6);

create table public.artesaos (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,30}$'),
  nome_exibicao text not null check (char_length(nome_exibicao) between 1 and 80),
  whatsapp text not null check (whatsapp ~ '^[0-9]{12,13}$'),
  cidade text check (char_length(cidade) <= 80),
  bio text check (char_length(bio) <= 280),
  foto_path text,
  criado_em timestamptz not null default now()
);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  artesao_id uuid not null references public.artesaos (id) on delete cascade,
  titulo text check (char_length(titulo) <= 60),
  descricao text check (char_length(descricao) <= 2000),
  categoria_id smallint references public.categorias (id),
  preco_centavos integer check (preco_centavos > 0),
  atributos jsonb not null default '[]'::jsonb,
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado', 'arquivado')),
  entrada_texto text,
  audio_path text,
  ia_resposta jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  publicado_em timestamptz,
  constraint produto_publicado_completo check (
    status <> 'publicado'
    or (titulo is not null and char_length(titulo) > 0 and categoria_id is not null and preco_centavos is not null)
  )
);

create index produtos_status_publicado_idx on public.produtos (status, publicado_em desc);
create index produtos_artesao_idx on public.produtos (artesao_id);

create table public.produto_fotos (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  storage_path text not null,
  ordem smallint not null default 0
);

create index produto_fotos_produto_idx on public.produto_fotos (produto_id, ordem);

create table public.sessoes_cadastro (
  id uuid primary key default gen_random_uuid(),
  artesao_id uuid not null references public.artesaos (id) on delete cascade,
  produto_id uuid references public.produtos (id) on delete set null,
  modo text check (modo in ('voz', 'texto')),
  iniciado_em timestamptz not null default now(),
  ia_concluida_em timestamptz,
  publicado_em timestamptz,
  ia_falhou boolean not null default false,
  campos_editados text[] not null default '{}'
);

create index sessoes_cadastro_artesao_idx on public.sessoes_cadastro (artesao_id);

create table public.eventos (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('visita_catalogo', 'visita_vitrine', 'visita_produto', 'clique_whatsapp')),
  visitante_id uuid not null,
  artesao_id uuid references public.artesaos (id) on delete set null,
  produto_id uuid references public.produtos (id) on delete set null,
  valor_centavos integer check (valor_centavos >= 0),
  criado_em timestamptz not null default now()
);

create index eventos_tipo_criado_idx on public.eventos (tipo, criado_em);
create index eventos_artesao_tipo_idx on public.eventos (artesao_id, tipo);

create table public.respostas_usabilidade (
  id bigint generated always as identity primary key,
  participante text not null,
  sus_respostas smallint[] not null check (array_length(sus_respostas, 1) = 10),
  sus_pontuacao numeric(5, 2) not null check (sus_pontuacao between 0 and 100),
  satisfacao smallint check (satisfacao between 1 and 5),
  facilidade smallint check (facilidade between 1 and 5),
  respondido_em timestamptz
);

create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger produtos_atualizado_em
before update on public.produtos
for each row execute function public.tocar_atualizado_em();
