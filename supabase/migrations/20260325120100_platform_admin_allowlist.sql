-- =============================================================================
-- Platform admin e-postalarÄ± (sistem atamasÄ±)
-- Bu migration, 20260325120000_profiles.sql Ã§alÄ±ÅŸtÄ±ktan SONRA uygulanmalÄ±dÄ±r.
-- Dashboard â†’ SQL Editor â†’ Run
-- =============================================================================

-- E-postalar her zaman kÃ¼Ã§Ã¼k harf saklanÄ±r; Authâ€™taki adresle eÅŸleÅŸir.
create table if not exists public.platform_admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

comment on table public.platform_admin_emails is
  'Bu listede olan auth.users kayÄ±tlarÄ± profiles.role = admin olur (yeni kayÄ±t + gÃ¼ncelleme).';

alter table public.platform_admin_emails enable row level security;

-- Kimse doÄŸrudan okuyamaz; tetikleyici SECURITY DEFINER ile iÅŸler.
-- (Supabase service_role / dashboard SQL yine eriÅŸir.)

insert into public.platform_admin_emails (email) values
  (lower(trim('mustafa82oner@gmail.com'))),
  (lower(trim('ekenra@gmail.com')))
on conflict (email) do nothing;

create or replace function public.kursiyera_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_role public.app_role;
  disp_name text;
begin
  if exists (
    select 1
    from public.platform_admin_emails e
    where e.email = lower(trim(coalesce(new.email, '')))
  ) then
    next_role := 'admin';
  else
    next_role := 'institution_manager';
  end if;

  disp_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );

  insert into public.profiles (id, full_name, role)
  values (new.id, disp_name, next_role)
  on conflict (id) do update set
    role = excluded.role,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists kursiyera_on_auth_user_created on auth.users;
create trigger kursiyera_on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.kursiyera_handle_new_user();

-- Mevcut kullanÄ±cÄ±lar: profil yoksa oluÅŸtur
insert into public.profiles (id, full_name, role)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    split_part(coalesce(u.email, ''), '@', 1)
  ),
  case
    when exists (
      select 1
      from public.platform_admin_emails e
      where e.email = lower(trim(coalesce(u.email, '')))
    ) then 'admin'::public.app_role
    else 'institution_manager'::public.app_role
  end
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- Zaten profili olanlar: allowlistâ€™teki adresleri admin yap
update public.profiles p
set
  role = 'admin'::public.app_role,
  updated_at = now()
where exists (
  select 1
  from auth.users u
  inner join public.platform_admin_emails e on e.email = lower(trim(coalesce(u.email, '')))
  where u.id = p.id
);

