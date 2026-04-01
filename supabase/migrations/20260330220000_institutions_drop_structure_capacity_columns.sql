-- Eğitim yapısı ve fiziksel imkan sütunları (panelden kaldırıldı).

alter table public.institutions
  drop column if exists weekly_hours,
  drop column if exists total_hours,
  drop column if exists one_to_one_lesson_count,
  drop column if exists classroom_count,
  drop column if exists capacity,
  drop column if exists class_size,
  drop column if exists library_capacity;
