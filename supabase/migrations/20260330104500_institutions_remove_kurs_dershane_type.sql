-- Kurs/dershane ayrımı kaldırıldı; kurum sınıflandırması exam_nav_ids (LGS, YKS, …) ile.
-- Eski YGS kanonik değerini YKS yap (üst menü URL uyumu).

update public.institutions
set exam_nav_ids = array(
  select case when u = 'YGS' then 'YKS' else u end
  from unnest(exam_nav_ids) as u
)
where exam_nav_ids is not null
  and 'YGS' = any (exam_nav_ids);

alter table public.institutions drop constraint if exists institutions_type_check;

alter table public.institutions drop column if exists type;

-- Satır tipi değişince fonksiyon imzası güncellenir
create or replace function public.institution_visible(i public.institutions)
returns boolean
language sql
stable
as $$
  select coalesce(i.listed, true)
    or public.is_admin()
    or i.owner_user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.institution_id = i.id
    );
$$;
