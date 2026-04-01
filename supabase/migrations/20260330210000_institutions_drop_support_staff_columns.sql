-- Eğitim destekleri ve kadro/rehberlik alanları kaldırıldı (uygulama + panel).

alter table public.institutions
  drop column if exists has_publication_support,
  drop column if exists exam_count,
  drop column if exists has_digital_platform,
  drop column if exists digital_platform_info,
  drop column if exists teacher_count,
  drop column if exists teacher_info,
  drop column if exists coaching_ratio;
