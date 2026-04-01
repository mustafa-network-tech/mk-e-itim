-- Hero slayt görselleri: public okuma, yalnızca admin yükleme.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-images',
  'hero-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "hero_images_select_public" on storage.objects;
create policy "hero_images_select_public"
  on storage.objects for select
  using (bucket_id = 'hero-images');

drop policy if exists "hero_images_insert_admin" on storage.objects;
create policy "hero_images_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'hero-images'
    and public.is_admin()
  );

drop policy if exists "hero_images_update_admin" on storage.objects;
create policy "hero_images_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'hero-images' and public.is_admin())
  with check (bucket_id = 'hero-images' and public.is_admin());

drop policy if exists "hero_images_delete_admin" on storage.objects;
create policy "hero_images_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'hero-images' and public.is_admin());
