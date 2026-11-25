-- Formulário Depois respondido dentro do painel.
-- A resposta fica ligada à conta do artesão (sem código P1, P2...). As respostas
-- importadas do CSV continuam usando o código do participante.

alter table public.respostas_usabilidade
  alter column participante drop not null,
  add column artesao_id uuid unique references public.artesaos (id) on delete cascade,
  add column descricoes_atrativas smallint check (descricoes_atrativas between 1 and 5),
  add column texto_qualidade smallint check (texto_qualidade between 1 and 5),
  add column texto_mudanca text check (texto_mudanca in ('nada', 'pouca', 'bastante', 'quase_tudo')),
  add column info_errada text check (info_errada in ('nao', 'uma_vez', 'mais_de_uma')),
  add column info_errada_qual text check (char_length(info_errada_qual) <= 500),
  add column modo_preferido text check (modo_preferido in ('audio', 'texto', 'ambos')),
  add column comparado_antes smallint check (comparado_antes between 1 and 5),
  add column pedidos_whatsapp text check (pedidos_whatsapp in ('nenhum', '1_a_2', '3_a_5', 'mais_de_5')),
  add column recomendacao smallint check (recomendacao between 0 and 10),
  add column mais_ajudou text check (char_length(mais_ajudou) <= 2000),
  add column mais_atrapalhou text check (char_length(mais_atrapalhou) <= 2000),
  add column faltou text check (char_length(faltou) <= 2000),
  add column autorizacao_uso text check (autorizacao_uso in ('nome_e_foto', 'so_foto', 'so_codigo')),
  add constraint respostas_usabilidade_identificada check (participante is not null or artesao_id is not null);

-- A pontuação SUS é sempre calculada pelo banco, nunca aceita de quem envia.
-- Mesma conta de lib/kpi.ts: ímpares valem nota - 1, pares valem 5 - nota, soma × 2,5.
create or replace function public.calcular_sus()
returns trigger language plpgsql as $$
declare
  i int;
  nota smallint;
  soma int := 0;
begin
  if coalesce(array_length(new.sus_respostas, 1), 0) <> 10 then
    raise exception 'O SUS tem 10 respostas';
  end if;
  for i in 1..10 loop
    nota := new.sus_respostas[i];
    if nota is null or nota not between 1 and 5 then
      raise exception 'Notas do SUS vão de 1 a 5';
    end if;
    soma := soma + case when i % 2 = 1 then nota - 1 else 5 - nota end;
  end loop;
  new.sus_pontuacao := soma * 2.5;
  return new;
end;
$$;

create trigger respostas_usabilidade_sus
before insert or update on public.respostas_usabilidade
for each row execute function public.calcular_sus();

-- O artesão logado envia a própria resposta uma vez e consegue ver se já respondeu.
-- Não edita nem apaga; outras pessoas continuam sem ler nada (só os números de /metricas).
create policy usabilidade_inserir_propria on public.respostas_usabilidade
  for insert to authenticated with check (artesao_id = auth.uid() and participante is null);
create policy usabilidade_leitura_propria on public.respostas_usabilidade
  for select to authenticated using (artesao_id = auth.uid());

grant select, insert on public.respostas_usabilidade to authenticated;
