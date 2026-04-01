-- Programlar: 8 tıklanabilir kart (jsonb); eski `programs` satırları uygulama okumasında karta yansıtılır.
alter table public.institutions
  add column if not exists program_cards jsonb not null default '[]'::jsonb;

comment on column public.institutions.program_cards is
  '8 {title, body} program kartı; detayda modal. programs text[] başlık listesi olarak senkron kalır.';
