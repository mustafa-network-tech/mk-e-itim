-- Kurum türü sabit kodları (exam_nav_ids / ?exam=) — yalnızca görünen ad ve sıra admin tarafından düzenlenir.
create table if not exists public.institution_types (
  id text primary key,
  label text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.institution_types is
  'Kurum türleri: id sabit (LGS, YKS, …); label üst menü ve formlarda gösterilir.';

insert into public.institution_types (id, label, sort_order) values
  ('LGS', 'LGS', 1),
  ('YKS', 'YKS', 2),
  ('YABANCI DİL', 'Yabancı dil', 3),
  ('EHLİYET', 'Ehliyet', 4),
  ('KPSS', 'KPSS', 5),
  ('DIGER', 'Diğer', 6)
on conflict (id) do nothing;

alter table public.institution_types enable row level security;

drop policy if exists "institution_types_select_public" on public.institution_types;
create policy "institution_types_select_public"
  on public.institution_types for select
  to anon, authenticated
  using (true);

drop policy if exists "institution_types_update_admin" on public.institution_types;
create policy "institution_types_update_admin"
  on public.institution_types for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.institution_types to anon;
grant select, update on public.institution_types to authenticated;
