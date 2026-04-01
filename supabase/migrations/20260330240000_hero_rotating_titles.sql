-- Ana sayfa hero: 4 dönüşümlü başlık (uygulama 7 sn + daktilo).

create table if not exists public.hero_rotating_titles (
  slot smallint primary key check (slot >= 1 and slot <= 4),
  title text not null default ''
);

comment on table public.hero_rotating_titles is 'Ana sayfa hero ana başlığı: slot 1–4, sırayla gösterilir.';

insert into public.hero_rotating_titles (slot, title) values
  (1, 'Aradığın eğitim kurumunu hemen bul'),
  (2, 'Şehrine ve bütçene uygun kurumları keşfet'),
  (3, 'Yorumlar ve fiyatlarla güvenle karşılaştır'),
  (4, 'Tek tıkla iletişime geç, hemen bilgi al')
on conflict (slot) do nothing;

alter table public.hero_rotating_titles enable row level security;

drop policy if exists "hero_rotating_titles_select" on public.hero_rotating_titles;
create policy "hero_rotating_titles_select"
  on public.hero_rotating_titles for select
  to anon, authenticated
  using (true);

drop policy if exists "hero_rotating_titles_write_admin" on public.hero_rotating_titles;
create policy "hero_rotating_titles_write_admin"
  on public.hero_rotating_titles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.hero_rotating_titles to anon;
grant select, insert, update, delete on public.hero_rotating_titles to authenticated;
