-- =============================================================================
-- Kursiyera — platform veri modeli (tablolar + tohum veriler)
-- ÖNCE şunlar çalışmış olmalı: 20260325120000, 20100, 20200
-- Sonra çalıştırın: 20260325131100_platform_rls_and_grants.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enum: yorum durumu
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum (
      'onay_bekliyor',
      'onaylandi',
      'reddedildi'
    );
  end if;
end$$;

-- -----------------------------------------------------------------------------
-- Etiketler ve sınıf seviyeleri (admin yönetir; herkese okuma)
-- -----------------------------------------------------------------------------
create table if not exists public.tags (
  id text primary key,
  name text not null,
  category text,
  created_at timestamptz not null default now()
);

create unique index if not exists tags_name_lower_idx on public.tags (lower(name));

create table if not exists public.grade_levels (
  id text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Kurumlar (Institution tipi ile uyumlu alanlar)
-- -----------------------------------------------------------------------------
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('kurs', 'dershane')),
  category text not null default 'Genel',
  city text not null,
  district text not null,
  neighborhood text not null default '',
  address text not null default '',
  phone text not null default '',
  website text not null default '',
  whatsapp text not null default '',
  short_description text not null default '',
  long_description text not null default '',
  price text not null default '',
  price_range text not null default '',
  min_price integer not null default 0,
  max_price integer not null default 0,
  rating numeric(4, 2) not null default 0,
  review_count integer not null default 0,
  teacher_count integer not null default 0,
  teacher_info text not null default '',
  programs text[] not null default '{}',
  images text[] not null default '{}',
  weekly_hours integer not null default 0,
  total_hours integer not null default 0,
  one_to_one_lesson_count integer not null default 0,
  classroom_count integer not null default 0,
  capacity integer not null default 0,
  class_size integer not null default 0,
  library_capacity integer not null default 0,
  has_publication_support boolean not null default false,
  exam_count integer not null default 0,
  has_digital_platform boolean not null default false,
  digital_platform_info text not null default '',
  coaching_ratio text not null default '',
  featured boolean not null default false,
  top_visible boolean not null default true,
  -- Listede ve anonim aramada görünsün mü (false = taslak)
  listed boolean not null default true,
  created_at date not null default (current_date),
  owner_user_id uuid not null references auth.users (id) on delete restrict,
  discount_active boolean not null default false,
  discount_percent integer not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  discount_text text not null default '',
  discount_start_date date,
  discount_end_date date,
  updated_at timestamptz not null default now()
);

create index if not exists institutions_listed_idx on public.institutions (listed) where listed = true;
create index if not exists institutions_owner_idx on public.institutions (owner_user_id);
create index if not exists institutions_city_idx on public.institutions (city);

-- -----------------------------------------------------------------------------
-- profiles.institution_id: text → uuid FK (kurum yöneticisi ataması)
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'institution_id'
      and data_type = 'text'
  ) then
    alter table public.profiles rename column institution_id to institution_id_legacy;
  end if;
end$$;

alter table public.profiles
  add column if not exists institution_id uuid references public.institutions (id) on delete set null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'institution_id_legacy'
  ) then
    update public.profiles p
    set institution_id = p.institution_id_legacy::uuid
    where p.institution_id_legacy is not null
      and p.institution_id_legacy ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    alter table public.profiles drop column institution_id_legacy;
  end if;
end$$;

-- -----------------------------------------------------------------------------
-- Kurum ↔ etiket / sınıf (çoktan çoğa)
-- -----------------------------------------------------------------------------
create table if not exists public.institution_tags (
  institution_id uuid not null references public.institutions (id) on delete cascade,
  tag_id text not null references public.tags (id) on delete cascade,
  primary key (institution_id, tag_id)
);

create table if not exists public.institution_grade_levels (
  institution_id uuid not null references public.institutions (id) on delete cascade,
  grade_level_id text not null references public.grade_levels (id) on delete cascade,
  primary key (institution_id, grade_level_id)
);

-- -----------------------------------------------------------------------------
-- Yorumlar, eğitmenler, hero, statik sayfalar, danışman soruları
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  user_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz not null default now(),
  status public.review_status not null default 'onay_bekliyor'
);

create index if not exists reviews_institution_idx on public.reviews (institution_id);
create index if not exists reviews_status_idx on public.reviews (status);

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  name text not null,
  branch text not null
);

create index if not exists instructors_institution_idx on public.instructors (institution_id);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  image text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.static_pages (
  slug text primary key check (slug in ('about', 'privacy', 'contact')),
  body text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.advisor_questions (
  id text primary key,
  step_key text not null check (
    step_key in ('city', 'district', 'grade', 'subject', 'price')
  ),
  prompt text not null,
  sort_order integer not null
);

-- -----------------------------------------------------------------------------
-- Başlangıç etiketleri / sınıflar (isteğe bağlı; admin panelden genişletilir)
-- -----------------------------------------------------------------------------
insert into public.tags (id, name) values
  ('tyt', 'TYT'),
  ('ayt', 'AYT'),
  ('kpss', 'KPSS'),
  ('lgs', 'LGS'),
  ('ingilizce', 'İngilizce'),
  ('matematik', 'Matematik'),
  ('fizik', 'Fizik'),
  ('yazilim', 'Yazılım'),
  ('robotik', 'Robotik'),
  ('resim', 'Resim'),
  ('muzik', 'Müzik'),
  ('dil-egitimi', 'Dil Eğitimi')
on conflict (id) do nothing;

insert into public.grade_levels (id, label) values
  ('g-5', '5. sınıf'),
  ('g-6', '6. sınıf'),
  ('g-7', '7. sınıf'),
  ('g-8', '8. sınıf'),
  ('g-9', '9. sınıf'),
  ('g-10', '10. sınıf'),
  ('g-11', '11. sınıf'),
  ('g-12', '12. sınıf'),
  ('g-mezun', 'Mezun')
on conflict (id) do nothing;

insert into public.static_pages (slug, body) values
  ('about', 'Admin panelinden düzenlenecektir.'),
  ('privacy', 'Admin panelinden düzenlenecektir.'),
  ('contact', 'Admin panelinden düzenlenecektir.')
on conflict (slug) do nothing;

insert into public.advisor_questions (id, step_key, prompt, sort_order) values
  (
    'q-city',
    'city',
    'Merhaba, ben eğitim danışmanınızım. Önce şunu öğreneyim: hangi şehirde kurs veya dershane arıyorsunuz? Lütfen şehir adını yazın.',
    1
  ),
  (
    'q-district',
    'district',
    'Teşekkürler. Bu şehirde hangi ilçeyi düşünüyorsunuz? Aşağıdan seçin.',
    2
  ),
  (
    'q-grade',
    'grade',
    'Hangi sınıf düzeyi için arama yapıyorsunuz? Aşağıdaki seçeneklerden birini seçin.',
    3
  ),
  (
    'q-subject',
    'subject',
    'Belirli bir ders veya branş önceliğiniz var mı? Varsa seçin; yoksa «Atla» ile devam edebilirsiniz.',
    4
  ),
  (
    'q-price',
    'price',
    'Son olarak aylık bütçe aralığınız hangisine yakın? Bir seçenek seçin.',
    5
  )
on conflict (id) do nothing;

comment on table public.institutions is 'Eğitim kurumu kartı; owner_user_id = atanan kurum yöneticisi (auth.users).';
comment on table public.profiles is 'auth.users ile 1:1; institution_id = yöneticinin bağlı olduğu kurum (uuid).';
comment on column public.institutions.listed is 'false ise yalnızca admin ve ilgili yönetici görür (taslak).';
