import type { InstitutionFilters } from "@/types";

export function emptyInstitutionFilters(): InstitutionFilters {
  return {
    query: "",
    examMenu: undefined,
    city: "",
    district: undefined,
    neighborhood: undefined,
    tags: [],
    gradeLevelId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: 0,
  };
}

export function institutionFiltersFromSearchParams(
  sp: { get(name: string): string | null },
): InstitutionFilters {
  const subject = sp.get("subject");
  const tagsRaw = sp.get("tags");
  let tags: string[] = [];
  if (tagsRaw) tags = tagsRaw.split(",").filter(Boolean);
  else if (subject) tags = [subject];

  const minR = sp.get("minRating");
  return {
    query: sp.get("q") ?? "",
    examMenu: sp.get("exam") || undefined,
    city: sp.get("city") ?? "",
    district: sp.get("district") || undefined,
    neighborhood: sp.get("neighborhood") || undefined,
    tags,
    gradeLevelId: sp.get("grade") || undefined,
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    minRating: minR != null && minR !== "" ? Number(minR) : 0,
  };
}

export function institutionFiltersToSearchParams(f: InstitutionFilters): URLSearchParams {
  const qs = new URLSearchParams();
  if (f.query.trim()) qs.set("q", f.query.trim());
  if (f.examMenu) qs.set("exam", f.examMenu);
  if (f.city) qs.set("city", f.city);
  if (f.district) qs.set("district", f.district);
  if (f.neighborhood) qs.set("neighborhood", f.neighborhood);
  if (f.gradeLevelId) qs.set("grade", f.gradeLevelId);
  if (f.minPrice != null && Number.isFinite(f.minPrice)) qs.set("minPrice", String(f.minPrice));
  if (f.maxPrice != null && Number.isFinite(f.maxPrice)) qs.set("maxPrice", String(f.maxPrice));
  if (f.minRating > 0) qs.set("minRating", String(f.minRating));
  if (f.tags.length > 0) qs.set("tags", f.tags.join(","));
  return qs;
}

export function buildHomeHref(f: InstitutionFilters): string {
  const qs = institutionFiltersToSearchParams(f);
  const s = qs.toString();
  return s ? `/?${s}` : "/";
}

export function buildAramaPrefillHref(f: InstitutionFilters): string {
  const qs = institutionFiltersToSearchParams(f);
  const s = qs.toString();
  return s ? `/arama?${s}` : "/arama";
}

export function hasActiveHomeSearch(sp: { get(name: string): string | null }): boolean {
  const keys = [
    "q",
    "exam",
    "city",
    "district",
    "neighborhood",
    "grade",
    "minPrice",
    "maxPrice",
    "tags",
    "subject",
  ] as const;
  for (const k of keys) {
    const v = sp.get(k);
    if (v != null && v !== "") return true;
  }
  const mr = sp.get("minRating");
  if (mr != null && mr !== "" && Number(mr) > 0) return true;
  return false;
}
