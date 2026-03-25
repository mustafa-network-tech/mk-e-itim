-- =============================================================================
-- Kursiyera — kullanıcı profili ve rol (admin / kurum yöneticisi)
-- Çalıştırma: Supabase Dashboard → SQL Editor → bu dosyayı yapıştır → Run
-- =============================================================================

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'institution_manager');
  end if;
end$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.app_role not null default 'institution_manager',
  institution_id text null,
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Auth kullanıcısı başına bir satır; rol ve isteğe bağlı kurum kimliği.';

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- İsteğe bağlı: kullanıcı kendi adını güncelleyebilsin (ileride panel için)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =============================================================================
-- İKİ (veya daha fazla) ADMİN ATAMAK İÇİN:
-- 1) Dashboard → Authentication → Users → "Add user" ile e-posta + şifre oluşturun.
-- 2) O kullanıcının UUID’sini kopyalayın (kullanıcı satırına tıklayın).
-- 3) Aşağıdaki INSERT’te iki kez çalıştırın veya tek sorguda iki satır ekleyin:
--
-- insert into public.profiles (id, full_name, role)
-- values ('BURAYA_AUTH_USER_UUID', 'Admin Adı', 'admin');
--
-- Şifreleri ASLA repoya yazmayın; yalnızca Supabase Auth ekranında tanımlayın.
-- =============================================================================
