-- Kurum görselleri: herkese açık okuma; admin ve kurum yöneticisi yükleme/güncelleme/silme.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'institution-images',
  'institution-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "institution_images_select_public" on storage.objects;
create policy "institution_images_select_public"
  on storage.objects for select
  using (bucket_id = 'institution-images');

drop policy if exists "institution_images_insert_staff" on storage.objects;
create policy "institution_images_insert_staff"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'institution-images'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'institution_manager'::public.app_role
      )
    )
  );

drop policy if exists "institution_images_update_staff" on storage.objects;
create policy "institution_images_update_staff"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'institution-images'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'institution_manager'::public.app_role
      )
    )
  )
  with check (
    bucket_id = 'institution-images'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'institution_manager'::public.app_role
      )
    )
  );

drop policy if exists "institution_images_delete_staff" on storage.objects;
create policy "institution_images_delete_staff"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'institution-images'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'institution_manager'::public.app_role
      )
    )
  );
