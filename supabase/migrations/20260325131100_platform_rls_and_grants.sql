-- =============================================================================
-- Kursiyera — RLS, yardımcı fonksiyonlar, GRANT
-- 20260325131000_platform_tables.sql dosyasından SONRA çalıştırın.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Yardımcı fonksiyonlar (JWT: auth.uid())
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'::public.app_role
  );
$$;

comment on function public.is_admin() is 'profiles.role = admin olan oturum.';

create or replace function public.manages_institution(target_institution uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_admin(),
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'institution_manager'::public.app_role
        and p.institution_id = target_institution
    )
  );
$$;

comment on function public.manages_institution(uuid) is 'Admin veya ilgili kurumun institution_manager''ı.';

-- Kurum satırı herkese açık mı (anon dahil)
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

-- -----------------------------------------------------------------------------
-- profiles: eski politikaları genişlet (admin tüm satırları görsün / güncellesin)
-- -----------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "profiles_insert_admin"
  on public.profiles
  for insert
  to authenticated
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- institutions
-- -----------------------------------------------------------------------------
alter table public.institutions enable row level security;

drop policy if exists "institutions_select" on public.institutions;
create policy "institutions_select"
  on public.institutions
  for select
  to anon, authenticated
  using (public.institution_visible(institutions));

drop policy if exists "institutions_insert_admin" on public.institutions;
create policy "institutions_insert_admin"
  on public.institutions
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "institutions_update_managers" on public.institutions;
create policy "institutions_update_managers"
  on public.institutions
  for update
  to authenticated
  using (public.manages_institution(id))
  with check (public.manages_institution(id));

drop policy if exists "institutions_delete_admin" on public.institutions;
create policy "institutions_delete_admin"
  on public.institutions
  for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- tags, grade_levels
-- -----------------------------------------------------------------------------
alter table public.tags enable row level security;
alter table public.grade_levels enable row level security;

drop policy if exists "tags_select_all" on public.tags;
create policy "tags_select_all"
  on public.tags for select to anon, authenticated using (true);

drop policy if exists "tags_write_admin" on public.tags;
create policy "tags_write_admin"
  on public.tags for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "grade_levels_select_all" on public.grade_levels;
create policy "grade_levels_select_all"
  on public.grade_levels for select to anon, authenticated using (true);

drop policy if exists "grade_levels_write_admin" on public.grade_levels;
create policy "grade_levels_write_admin"
  on public.grade_levels for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- institution_tags, institution_grade_levels
-- -----------------------------------------------------------------------------
alter table public.institution_tags enable row level security;
alter table public.institution_grade_levels enable row level security;

drop policy if exists "institution_tags_select" on public.institution_tags;
create policy "institution_tags_select"
  on public.institution_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.institutions i
      where i.id = institution_tags.institution_id
        and public.institution_visible(i)
    )
  );

drop policy if exists "institution_tags_write" on public.institution_tags;
create policy "institution_tags_write"
  on public.institution_tags
  for all
  to authenticated
  using (public.manages_institution(institution_id))
  with check (public.manages_institution(institution_id));

drop policy if exists "institution_grade_levels_select" on public.institution_grade_levels;
create policy "institution_grade_levels_select"
  on public.institution_grade_levels
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.institutions i
      where i.id = institution_grade_levels.institution_id
        and public.institution_visible(i)
    )
  );

drop policy if exists "institution_grade_levels_write" on public.institution_grade_levels;
create policy "institution_grade_levels_write"
  on public.institution_grade_levels
  for all
  to authenticated
  using (public.manages_institution(institution_id))
  with check (public.manages_institution(institution_id));

-- -----------------------------------------------------------------------------
-- reviews
-- -----------------------------------------------------------------------------
alter table public.reviews enable row level security;

drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select"
  on public.reviews
  for select
  to anon, authenticated
  using (
    public.is_admin()
    or public.manages_institution(institution_id)
    or (
      status = 'onaylandi'::public.review_status
      and exists (
        select 1
        from public.institutions i
        where i.id = reviews.institution_id
          and coalesce(i.listed, true)
      )
    )
  );

drop policy if exists "reviews_insert_public" on public.reviews;
create policy "reviews_insert_public"
  on public.reviews
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.institutions i
      where i.id = institution_id
        and coalesce(i.listed, true)
    )
  );

drop policy if exists "reviews_update_admin" on public.reviews;
create policy "reviews_update_admin"
  on public.reviews
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "reviews_delete_admin" on public.reviews;
create policy "reviews_delete_admin"
  on public.reviews
  for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- instructors
-- -----------------------------------------------------------------------------
alter table public.instructors enable row level security;

drop policy if exists "instructors_select" on public.instructors;
create policy "instructors_select"
  on public.instructors
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.institutions i
      where i.id = instructors.institution_id
        and public.institution_visible(i)
    )
  );

drop policy if exists "instructors_write" on public.instructors;
create policy "instructors_write"
  on public.instructors
  for all
  to authenticated
  using (public.manages_institution(institution_id))
  with check (public.manages_institution(institution_id));

-- -----------------------------------------------------------------------------
-- hero_slides, static_pages, advisor_questions
-- -----------------------------------------------------------------------------
alter table public.hero_slides enable row level security;
alter table public.static_pages enable row level security;
alter table public.advisor_questions enable row level security;

drop policy if exists "hero_slides_select" on public.hero_slides;
create policy "hero_slides_select"
  on public.hero_slides for select to anon, authenticated using (true);

drop policy if exists "hero_slides_write_admin" on public.hero_slides;
create policy "hero_slides_write_admin"
  on public.hero_slides for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "static_pages_select" on public.static_pages;
create policy "static_pages_select"
  on public.static_pages for select to anon, authenticated using (true);

drop policy if exists "static_pages_write_admin" on public.static_pages;
create policy "static_pages_write_admin"
  on public.static_pages for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "advisor_questions_select" on public.advisor_questions;
create policy "advisor_questions_select"
  on public.advisor_questions for select to anon, authenticated using (true);

drop policy if exists "advisor_questions_write_admin" on public.advisor_questions;
create policy "advisor_questions_write_admin"
  on public.advisor_questions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- GRANT (PostgREST + anon/authenticated)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.institutions to anon;
grant select, insert, update, delete on public.institutions to authenticated;

grant select on public.tags, public.grade_levels to anon;
grant select, insert, update, delete on public.tags, public.grade_levels to authenticated;

grant select on public.institution_tags, public.institution_grade_levels to anon;
grant select, insert, update, delete on public.institution_tags, public.institution_grade_levels to authenticated;

grant select, insert on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;

grant select on public.instructors to anon;
grant select, insert, update, delete on public.instructors to authenticated;

grant select on public.hero_slides, public.static_pages, public.advisor_questions to anon;
grant select, insert, update, delete on public.hero_slides, public.static_pages, public.advisor_questions to authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.manages_institution(uuid) to authenticated;
grant execute on function public.institution_visible(public.institutions) to anon, authenticated;
