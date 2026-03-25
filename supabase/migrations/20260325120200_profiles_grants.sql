-- =============================================================================
-- PostgREST: oturum açmış kullanıcıların profiles okuyup güncelleyebilmesi için
-- (RLS açık kalsa bile tablo üzerinde temel GRANT olmalıdır.)
-- Önceki migration’lardan sonra bir kez SQL Editor’da çalıştırın.
-- =============================================================================

grant usage on schema public to authenticated;

grant select, update on table public.profiles to authenticated;
