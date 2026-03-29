-- =============================================================================
-- Kurum yöneticisi: yayında (listed) kurumlarda doğrudan satır güncellemesi
-- yerine onay kuyruğu (pending_manager_payload). Admin onaylar / reddeder.
-- Taslak kurum (listed = false) yöneticisi doğrudan düzenler.
-- =============================================================================

alter table public.institutions
  add column if not exists pending_manager_payload jsonb null,
  add column if not exists pending_submitted_at timestamptz null;

comment on column public.institutions.pending_manager_payload is
  'Yönetici onay talebi: { "body": Partial alanlar, "tags": uuid[] }.';
comment on column public.institutions.pending_submitted_at is
  'Son onay talebinin zamanı.';

-- Kurum yöneticisi: yalnızca kendi yayında kurumuna pending yazar (admin hariç)
create or replace function public.submit_institution_pending_changes(
  p_institution_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    raise exception 'Admin doğrudan institutions güncellemesi kullanmalı';
  end if;
  if not exists (
    select 1
    from public.institutions i
    where i.id = p_institution_id
      and i.listed = true
      and (
        i.owner_user_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'institution_manager'::public.app_role
            and p.institution_id = p_institution_id
        )
      )
  ) then
    raise exception 'Yetkisiz veya kurum taslak / bulunamadı';
  end if;

  update public.institutions
  set
    pending_manager_payload = p_payload,
    pending_submitted_at = now()
  where id = p_institution_id;
end;
$$;

comment on function public.submit_institution_pending_changes(uuid, jsonb) is
  'Yayında kurum için yönetici değişiklik talebini kaydeder; canlı kolonlara yazmaz.';

grant execute on function public.submit_institution_pending_changes(uuid, jsonb) to authenticated;

create or replace function public.clear_institution_pending(p_institution_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Yalnızca admin';
  end if;
  update public.institutions
  set
    pending_manager_payload = null,
    pending_submitted_at = null
  where id = p_institution_id;
end;
$$;

comment on function public.clear_institution_pending(uuid) is
  'Onay bekleyen yönetici taslağını siler (onay veya red sonrası).';

grant execute on function public.clear_institution_pending(uuid) to authenticated;

-- Yönetici: yalnızca listed = false kurumda doğrudan UPDATE
drop policy if exists "institutions_update_managers" on public.institutions;
drop policy if exists "institutions_update_managers_unlisted" on public.institutions;
create policy "institutions_update_managers_unlisted"
  on public.institutions
  for update
  to authenticated
  using (
    public.manages_institution(id)
    and not public.is_admin()
    and coalesce(institutions.listed, true) = false
  )
  with check (
    public.manages_institution(id)
    and not public.is_admin()
    and coalesce(institutions.listed, true) = false
  );

-- Etiket / sınıf: admin her zaman; yönetici yalnızca listed = false kurumda (taslak kart)
drop policy if exists "institution_tags_write" on public.institution_tags;
drop policy if exists "institution_tags_write_admin" on public.institution_tags;
drop policy if exists "institution_tags_write_admin_or_unlisted_manager" on public.institution_tags;
create policy "institution_tags_write_admin_or_unlisted_manager"
  on public.institution_tags
  for all
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.institutions i
      where i.id = institution_tags.institution_id
        and coalesce(i.listed, true) = false
        and public.manages_institution(i.id)
        and not public.is_admin()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.institutions i
      where i.id = institution_tags.institution_id
        and coalesce(i.listed, true) = false
        and public.manages_institution(i.id)
        and not public.is_admin()
    )
  );

drop policy if exists "institution_grade_levels_write" on public.institution_grade_levels;
drop policy if exists "institution_grade_levels_write_admin" on public.institution_grade_levels;
drop policy if exists "institution_grade_levels_write_admin_or_unlisted_manager"
  on public.institution_grade_levels;
create policy "institution_grade_levels_write_admin_or_unlisted_manager"
  on public.institution_grade_levels
  for all
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.institutions i
      where i.id = institution_grade_levels.institution_id
        and coalesce(i.listed, true) = false
        and public.manages_institution(i.id)
        and not public.is_admin()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.institutions i
      where i.id = institution_grade_levels.institution_id
        and coalesce(i.listed, true) = false
        and public.manages_institution(i.id)
        and not public.is_admin()
    )
  );

-- Yönetici kendi taslak kurumunu oluşturabilir (listed = false, owner = kendisi)
drop policy if exists "institutions_insert_manager_unlisted_own" on public.institutions;
create policy "institutions_insert_manager_unlisted_own"
  on public.institutions
  for insert
  to authenticated
  with check (
    not public.is_admin()
    and owner_user_id = auth.uid()
    and coalesce(listed, false) = false
  );
