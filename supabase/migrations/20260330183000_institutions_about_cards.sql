-- Kurum detayında 8 sabit bilgi kartı (jsonb); yönetici panelinden düzenlenir.
alter table public.institutions
  add column if not exists about_cards jsonb not null default '[]'::jsonb;

comment on column public.institutions.about_cards is
  'Detay sayfası: 8 {title, body} kartı; long_description arama uyumu için uygulama senkronlar.';

update public.institutions
set
  about_cards = (
    select jsonb_agg(card order by ord)
    from (
      select
        1 as ord,
        jsonb_build_object(
          'title',
          '',
          'body',
          coalesce(nullif(trim(long_description), ''), '')
        ) as card
      union all
      select
        s.n + 1,
        jsonb_build_object('title', '', 'body', '')
      from generate_series(1, 7) as s(n)
    ) t
  )
where
  jsonb_typeof(about_cards) <> 'array'
  or jsonb_array_length(about_cards) = 0;
