-- İş makinesi = operatörlük: eski IS_MAKINESI kodunu OPERATORLUK ile birleştir; institution_types satırını kaldır.

update public.institutions i
set exam_nav_ids = sub.new_ids
from (
  select
    i2.id,
    coalesce((
      select array_agg(x.v order by x.first_ord)
      from (
        select
          case when elem = 'IS_MAKINESI' then 'OPERATORLUK' else elem end as v,
          min(ord) as first_ord
        from unnest(i2.exam_nav_ids) with ordinality as t(elem, ord)
        group by case when elem = 'IS_MAKINESI' then 'OPERATORLUK' else elem end
      ) x
    ), '{}') as new_ids
  from public.institutions i2
  where i2.exam_nav_ids && array['IS_MAKINESI']::text[]
) sub
where i.id = sub.id;

delete from public.institution_types where id = 'IS_MAKINESI';
