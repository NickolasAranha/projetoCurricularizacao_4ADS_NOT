-- Indicadores agregados (só números, nunca linhas brutas)

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
      publicado_em,
      iniciado_em
    from sessoes_cadastro
  )
  select
    round(avg(minutos) filter (where publicado_em is not null)::numeric, 1),
    round((percentile_cont(0.5) within group (order by minutos) filter (where publicado_em is not null))::numeric, 1),
    round(avg(minutos) filter (where publicado_em is not null and not ia_falhou)::numeric, 1),
    round((percentile_cont(0.5) within group (order by minutos) filter (where publicado_em is not null and not ia_falhou))::numeric, 1),
    (count(*) filter (where publicado_em is not null))::int,
    (count(*) filter (where publicado_em is null and iniciado_em < now() - interval '24 hours'))::int,
    count(*)::int,
    round(avg(minutos_ate_ia) filter (where minutos_ate_ia is not null)::numeric, 1)
  from s;
$$;

create or replace function public.kpi_conversao()
returns table (artesao_slug text, artesao_nome text, visitantes int, convertidos int, taxa numeric)
language sql
stable
security definer
set search_path = public
as $$
  with geral as (
    select
      null::text as artesao_slug,
      null::text as artesao_nome,
      (count(distinct visitante_id) filter (where tipo <> 'clique_whatsapp'))::int as visitantes,
      (count(distinct visitante_id) filter (where tipo = 'clique_whatsapp'))::int as convertidos
    from eventos
  ),
  por_artesao as (
    select
      a.slug,
      a.nome_exibicao,
      (count(distinct e.visitante_id) filter (where e.tipo in ('visita_vitrine', 'visita_produto')))::int,
      (count(distinct e.visitante_id) filter (where e.tipo = 'clique_whatsapp'))::int
    from artesaos a
    left join eventos e on e.artesao_id = a.id
    group by a.slug, a.nome_exibicao
  ),
  tudo as (
    select * from geral
    union all
    select * from por_artesao
  )
  select
    artesao_slug,
    artesao_nome,
    visitantes,
    convertidos,
    case when visitantes > 0 then round(100.0 * convertidos / visitantes, 1) else null end
  from tudo
  order by artesao_slug nulls first;
$$;

create or replace function public.kpi_usabilidade()
returns table (sus_medio numeric, satisfacao_media numeric, facilidade_media numeric, n int)
language sql
stable
security definer
set search_path = public
as $$
  select
    round(avg(sus_pontuacao), 1),
    round(avg(satisfacao), 1),
    round(avg(facilidade), 1),
    count(*)::int
  from respostas_usabilidade;
$$;

grant execute on function public.kpi_tempo_cadastro() to anon, authenticated;
grant execute on function public.kpi_conversao() to anon, authenticated;
grant execute on function public.kpi_usabilidade() to anon, authenticated;
