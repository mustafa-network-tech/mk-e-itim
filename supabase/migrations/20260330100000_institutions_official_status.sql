-- Kurum adının altında gösterilen resmi ünvan / statü satırı (kart + detay sayfası).

alter table public.institutions
  add column if not exists official_status text not null default '';

comment on column public.institutions.official_status is
  'İsim altında ince yazı: tabela ünvanı, resmi statü vb.';
