-- Políticas de acesso (RLS)

alter table public.categorias enable row level security;
alter table public.artesaos enable row level security;
alter table public.produtos enable row level security;
alter table public.produto_fotos enable row level security;
alter table public.sessoes_cadastro enable row level security;
alter table public.eventos enable row level security;
alter table public.respostas_usabilidade enable row level security;

-- categorias: leitura para todos
create policy categorias_leitura on public.categorias
  for select to anon, authenticated using (true);

-- artesaos: perfil público; cada um edita o seu
create policy artesaos_leitura on public.artesaos
  for select to anon, authenticated using (true);
create policy artesaos_inserir_proprio on public.artesaos
  for insert to authenticated with check (id = auth.uid());
create policy artesaos_atualizar_proprio on public.artesaos
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- produtos: publicados para todos; o dono vê e altera todos os seus
create policy produtos_leitura_publicados on public.produtos
  for select to anon, authenticated using (status = 'publicado');
create policy produtos_leitura_proprios on public.produtos
  for select to authenticated using (artesao_id = auth.uid());
create policy produtos_inserir_proprios on public.produtos
  for insert to authenticated with check (artesao_id = auth.uid());
create policy produtos_atualizar_proprios on public.produtos
  for update to authenticated using (artesao_id = auth.uid()) with check (artesao_id = auth.uid());
create policy produtos_apagar_proprios on public.produtos
  for delete to authenticated using (artesao_id = auth.uid());

-- produto_fotos: segue o produto
create policy fotos_leitura_publicadas on public.produto_fotos
  for select to anon, authenticated using (
    exists (select 1 from public.produtos p where p.id = produto_id and p.status = 'publicado')
  );
create policy fotos_tudo_proprias on public.produto_fotos
  for all to authenticated
  using (exists (select 1 from public.produtos p where p.id = produto_id and p.artesao_id = auth.uid()))
  with check (exists (select 1 from public.produtos p where p.id = produto_id and p.artesao_id = auth.uid()));

-- sessoes_cadastro: só o próprio artesão
create policy sessoes_leitura_proprias on public.sessoes_cadastro
  for select to authenticated using (artesao_id = auth.uid());
create policy sessoes_inserir_proprias on public.sessoes_cadastro
  for insert to authenticated with check (artesao_id = auth.uid());
create policy sessoes_atualizar_proprias on public.sessoes_cadastro
  for update to authenticated using (artesao_id = auth.uid()) with check (artesao_id = auth.uid());

-- eventos: qualquer um insere, ninguém lê pela API
create policy eventos_inserir on public.eventos
  for insert to anon, authenticated with check (true);

-- respostas_usabilidade: sem políticas (só service role)

-- Permissões de tabela (o RLS filtra as linhas)
revoke all on public.eventos from anon, authenticated;
grant insert on public.eventos to anon, authenticated;
revoke all on public.respostas_usabilidade from anon, authenticated;
