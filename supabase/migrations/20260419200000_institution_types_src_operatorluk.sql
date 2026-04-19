-- SRC, operatörlük ve iş makinesi kurum türleri (exam_nav_ids / ?exam=)
-- Önce KPSS ve Diğer sırasını kaydır (EHLİYET 4’ten sonra 5–7 yeni türlere ayrılsın).
update public.institution_types set sort_order = 8 where id = 'KPSS';
update public.institution_types set sort_order = 9 where id = 'DIGER';

insert into public.institution_types (id, label, sort_order) values
  ('SRC', 'SRC belgesi', 5),
  ('OPERATORLUK', 'Operatörlük belgesi', 6)
on conflict (id) do nothing;
