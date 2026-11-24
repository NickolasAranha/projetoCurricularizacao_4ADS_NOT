-- Permissões explícitas nas tabelas.
-- Projetos novos do Supabase não liberam automaticamente as tabelas de public para a API.
-- O RLS (0002) decide quais linhas cada um vê; aqui fica só o que cada papel pode fazer.
-- As colunas de produtos que o público lê continuam definidas em 0006.

grant select on public.categorias to anon, authenticated;

grant select on public.artesaos to anon, authenticated;
grant insert, update on public.artesaos to authenticated;

grant insert, update, delete on public.produtos to authenticated;

grant select on public.produto_fotos to anon, authenticated;
grant insert, update, delete on public.produto_fotos to authenticated;

grant select, insert, update on public.sessoes_cadastro to authenticated;

-- Servidor (chave secreta): leitura da resposta da IA, importação do CSV e manutenção.
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
