-- Kurum başına üst menü başlıkları (çoklu); boş satırlar uygulama tarafında legacy category'den türetilir.
alter table public.institutions
  add column if not exists exam_nav_ids text[] not null default '{}';

comment on column public.institutions.exam_nav_ids is
  'LGS, YGS, YABANCI DİL, EHLİYET, KPSS, DIGER — en az biri zorunlu; category görünen metin ile senkron.';
