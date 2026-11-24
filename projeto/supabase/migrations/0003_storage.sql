-- Buckets e políticas do Storage

insert into storage.buckets (id, name, public) values
  ('produtos-fotos', 'produtos-fotos', true),
  ('produtos-audio', 'produtos-audio', false),
  ('artesaos-fotos', 'artesaos-fotos', true)
on conflict (id) do nothing;

create policy storage_leitura_publica on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('produtos-fotos', 'artesaos-fotos'));

create policy storage_leitura_audio_proprio on storage.objects
  for select to authenticated
  using (bucket_id = 'produtos-audio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy storage_inserir_proprio on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('produtos-fotos', 'produtos-audio', 'artesaos-fotos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy storage_atualizar_proprio on storage.objects
  for update to authenticated
  using (
    bucket_id in ('produtos-fotos', 'produtos-audio', 'artesaos-fotos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy storage_apagar_proprio on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('produtos-fotos', 'produtos-audio', 'artesaos-fotos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
