"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/search/FilterPanel";
import { InstitutionCard } from "@/components/institution/InstitutionCard";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { filterInstitutions, getPublicRating } from "@/lib/institutions";
import type { InstitutionFilters } from "@/types";
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

function buildListingsHref(
  filters: InstitutionFilters,
  base: { get(name: string): string | null },
): string {
  const qs = new URLSearchParams();
  for (const key of ["section", "featured", "sort"] as const) {
    const v = base.get(key);
    if (v) qs.set(key, v);
  }
  if (filters.city) qs.set("city", filters.city);
  if (filters.district) qs.set("district", filters.district);
  if (filters.tags[0]) qs.set("subject", filters.tags[0]);
  if (filters.gradeLevelId) qs.set("grade", filters.gradeLevelId);
  if (filters.minPrice != null && Number.isFinite(filters.minPrice)) {
    qs.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
    qs.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.type) qs.set("type", filters.type);
  const q = qs.toString();
  return q ? `/listings?${q}` : "/listings";
}

function ListingsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { institutions, reviews, tags, gradeLevels } = useDemoPlatform();
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filtersOpen]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  const section = params.get("section");
  const featuredOnly =
    section === "featured" || (section === null && params.get("featured") === "true");
  const sortTop = section === "top" || (section === null && params.get("sort") === "top");

  const cities = [...new Set(institutions.map((i) => i.city))];
  const filtered = useMemo(() => {
    let list = filterInstitutions(institutions, reviews, filters);
    if (featuredOnly) {
      list = list.filter((i) => i.featured);
    }
    if (sortTop) {
      list = [...list].sort(
        (a, b) => getPublicRating(b, reviews).average - getPublicRating(a, reviews).average,
      );
    }
    return list;
  }, [institutions, reviews, filters, featuredOnly, sortTop]);

  const filterPanel = (
    <FilterPanel
      filters={filters}
      cities={cities}
      institutions={institutions}
      tags={tags}
      gradeLevels={gradeLevels}
      onChange={setFilters}
    />
  );

  const applySearch = () => {
    router.push(buildListingsHref(filters, params));
    setFiltersOpen(false);
  };

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[300px_1fr] lg:pb-8">
        <aside className="hidden lg:block">{filterPanel}</aside>
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

      {/* Mobil: altta Arama çubuğu + açılır filtre paneli */}
      <div className="lg:hidden">
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_28px_rgba(0,0,0,0.08)] backdrop-blur-sm [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:bg-slate-950"
            onClick={() => setFiltersOpen(true)}
          >
            Arama
          </button>
        </div>

        {filtersOpen ? (
          <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
              aria-label="Kapat"
              onClick={() => setFiltersOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="listings-filter-sheet-title"
              className="relative z-[51] flex max-h-[min(78vh,560px)] w-full flex-col rounded-t-2xl border border-slate-200 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.18)]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 id="listings-filter-sheet-title" className="text-sm font-semibold text-slate-900">
                  Arama ve filtreler
                </h2>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  onClick={() => setFiltersOpen(false)}
                >
                  Kapat
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                {filterPanel}
              </div>
              <div className="shrink-0 border-t border-slate-100 p-3 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={applySearch}
                >
                  Ara
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10">Yükleniyor...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
