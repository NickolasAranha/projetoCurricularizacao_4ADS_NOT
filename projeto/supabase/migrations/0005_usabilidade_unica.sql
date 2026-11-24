-- Um registro por participante (a importação pode ser repetida sem duplicar)
alter table public.respostas_usabilidade
  add constraint respostas_usabilidade_participante_unico unique (participante);
