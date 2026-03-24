"use client";

import { Suspense, useEffect } from "react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/search/FilterPanel";
import { InstitutionCard } from "@/components/institution/InstitutionCard";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { filterInstitutions, getPublicRating } from "@/lib/institutions";
import { InstitutionFilters } from "@/types";
import { PageNav } from "@/components/ui/PageNav";

function tagsFromParams(params: URLSearchParams): string[] {
  const subject = params.get("subject");
  if (subject) return [subject];
  const raw = params.get("tags");
  return raw ? raw.split(",").filter(Boolean) : [];
}

function typeFromParams(params: URLSearchParams): "" | "kurs" | "dershane" {
  const section = params.get("section");
  if (section === "kurs") return "kurs";
  if (section === "dershane") return "dershane";
  const t = params.get("type");
  if (t === "kurs" || t === "dershane") return t;
  return "";
}

function ListingsContent() {
  const params = useSearchParams();
  const { institutions, reviews, tags, gradeLevels } = useDemoPlatform();
  const [filters, setFilters] = useState<InstitutionFilters>({
    query: "",
    city: params.get("city") ?? "",
    district: params.get("district") || undefined,
    tags: tagsFromParams(params),
    gradeLevelId: params.get("grade") ?? undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    type: typeFromParams(params),
    minRating: 0,
  });
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      city: params.get("city") ?? "",
      district: params.get("district") || undefined,
      tags: tagsFromParams(params),
      gradeLevelId: params.get("grade") || undefined,
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      type: typeFromParams(params),
    }));
  }, [params]);

  const section = params.get("section");
  const featuredOnly =
    section === "featured" ||
    (section === null && params.get("featured") === "true");
  const sortTop =
    section === "top" || (section === null && params.get("sort") === "top");

  const cities = [...new Set(institutions.map((i) => i.city))];
  const filtered = useMemo(() => {
    let list = filterInstitutions(institutions, reviews, filters);
    if (featuredOnly) {
      list = list.filter((i) => i.featured);
    }
    if (sortTop) {
      list = [...list].sort(
        (a, b) =>
          getPublicRating(b, reviews).average - getPublicRating(a, reviews).average,
      );
    }
    return list;
  }, [institutions, reviews, filters, featuredOnly, sortTop]);

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr]">
      <FilterPanel
        filters={filters}
        cities={cities}
        institutions={institutions}
        tags={tags}
        gradeLevels={gradeLevels}
        onChange={setFilters}
      />
      <section className="space-y-4">
        <PageNav />
        <h1 className="text-2xl font-bold text-slate-900">Kurs ve Dershane Listeleme</h1>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Seçtiğiniz filtrelere uygun kurum bulunamadı.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((institution) => (
              <InstitutionCard key={institution.id} institution={institution} reviews={reviews} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10">Yükleniyor...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
