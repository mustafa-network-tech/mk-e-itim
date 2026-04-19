-- Eğitim kurumu vs sürücü kursu ayrımı (kart + detay tasarımı).

alter table public.institutions
  add column if not exists institution_segment text not null default 'education';

alter table public.institutions
  drop constraint if exists institutions_institution_segment_check;

alter table public.institutions
  add constraint institutions_institution_segment_check
  check (institution_segment in ('education', 'driving_school'));

comment on column public.institutions.institution_segment is
  'education = genel eğitim kurumu; driving_school = sürücü kursu (ehliyet) — sitede ayrı kart/detay tasarımı.';
