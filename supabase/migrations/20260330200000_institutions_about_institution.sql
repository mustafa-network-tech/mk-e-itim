-- Serbest metin: detay sayfasında «Kurum hakkında» bölümü (kurum panelinden).

alter table public.institutions
  add column if not exists about_institution text not null default '';

comment on column public.institutions.about_institution is
  'Kurum detayında «Kurum hakkında» başlığı altında gösterilen serbest metin.';
