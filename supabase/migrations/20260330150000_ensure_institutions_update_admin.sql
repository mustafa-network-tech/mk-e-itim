-- =============================================================================
-- Admin kurum güncellemesi: 0 satır (RLS) — institutions_update_admin eksikliği
-- =============================================================================
-- 20260330140000, eski "institutions_update_managers" politikasını kaldırır ve
-- yalnızca taslak kurum için "institutions_update_managers_unlisted" ekler.
-- Eğer 20260329120000_fix_manages_institution.sql hiç uygulanmadıysa veya
-- institutions_update_admin silindiyse, genel admin yayındaki kurumda UPDATE
-- edemez (PostgREST 0 satır, hata mesajı yok).
--
-- Bu dosya politikayı idempotent şekilde yeniden oluşturur.
-- =============================================================================

drop policy if exists "institutions_update_admin" on public.institutions;

create policy "institutions_update_admin"
  on public.institutions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "institutions_update_admin" on public.institutions is
  'Genel admin (profiles.role=admin / is_admin) tüm kurum satırlarını güncelleyebilir.';
