-- =============================================================================
-- manages_institution: COALESCE(is_admin(), kurum_yöneticisi_exists) hatalı.
-- is_admin() FALSE döndüğünde COALESCE ikinci argümana bakmaz (FALSE null değildir);
-- kurum yöneticisi hiç kurumunu güncelleyemezdi.
-- Düzeltme: OR ile birleştirme + institutions.owner_user_id (profil eşleşmesi yoksa).
-- Admin: is_admin() ile tüm kurumlarda INSERT dışı yazma (DELETE ayrı politikada).
-- =============================================================================

create or replace function public.manages_institution(target_institution uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.institutions i
      where i.id = target_institution
        and i.owner_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'institution_manager'::public.app_role
        and p.institution_id = target_institution
    );
$$;

comment on function public.manages_institution(uuid) is
  'Admin; veya kurum satırı owner_user_id; veya profiles.institution_id eşleşen kurum yöneticisi.';

-- Açık admin UPDATE politikası (fonksiyon zaten is_admin içerir; denetçiler için netlik).
drop policy if exists "institutions_update_admin" on public.institutions;
create policy "institutions_update_admin"
  on public.institutions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
