-- 1. Colunas privadas de produtos: transcrição, texto original e caminho do áudio
--    ficam fora da API pública. O servidor lê essas colunas com a service role,
--    sempre filtrando pelo dono.
revoke select on public.produtos from anon, authenticated;
grant select (
  id, artesao_id, titulo, descricao, categoria_id, preco_centavos, atributos,
  status, criado_em, atualizado_em, publicado_em
) on public.produtos to anon, authenticated;

-- 2. Storage: arquivos de buckets públicos continuam acessíveis pela URL pública,
--    mas ninguém lista o conteúdo das pastas (rascunhos e uploads abandonados).
drop policy if exists storage_leitura_publica on storage.objects;

-- 3. Tempo de cadastro: publicação depois de 24 h conta como abandono, como diz o design.
create or replace function public.kpi_tempo_cadastro()
returns table (
  media_min numeric,
  mediana_min numeric,
  media_min_com_ia numeric,
  mediana_min_com_ia numeric,
  concluidas int,
  abandonadas int,
  iniciadas int,
  media_min_ate_ia numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select
      extract(epoch from (publicado_em - iniciado_em)) / 60.0 as minutos,
      extract(epoch from (ia_concluida_em - iniciado_em)) / 60.0 as minutos_ate_ia,
      ia_falhou,
      publicado_em is not null and publicado_em - iniciado_em <= interval '24 hours' as concluida,
      iniciado_em < now() - interval '24 hours'
        and (publicado_em is null or publicado_em - iniciado_em > interval '24 hours') as abandonada
    from sessoes_cadastro
  )
  select
    round(avg(minutos) filter (where concluida)::numeric, 1),
    round((percentile_cont(0.5) within group (order by minutos) filter (where concluida))::numeric, 1),
    round(avg(minutos) filter (where concluida and not ia_falhou)::numeric, 1),
    round((percentile_cont(0.5) within group (order by minutos) filter (where concluida and not ia_falhou))::numeric, 1),
    (count(*) filter (where concluida))::int,
    (count(*) filter (where abandonada))::int,
    count(*)::int,
    round(avg(minutos_ate_ia) filter (where minutos_ate_ia is not null)::numeric, 1)
  from s;
$$;
