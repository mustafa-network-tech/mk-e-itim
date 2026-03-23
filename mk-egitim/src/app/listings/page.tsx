"use client";

import { Suspense, useEffect } from "react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/search/FilterPanel";
import { InstitutionCard } from "@/components/institution/InstitutionCard";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { filterInstitutions } from "@/lib/institutions";
import { InstitutionFilters } from "@/types";
import { PageNav } from "@/components/ui/PageNav";

function ListingsContent() {
  const params = useSearchParams();
  const { institutions, reviews, tags } = useDemoPlatform();
  const [filters, setFilters] = useState<InstitutionFilters>({
    query: "",
    city: params.get("city") ?? "",
    tags: params.get("tags") ? (params.get("tags") ?? "").split(",").filter(Boolean) : [],
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: undefined,
    type: "",
    minRating: 0,
  });
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      city: params.get("city") ?? "",
      tags: params.get("tags") ? (params.get("tags") ?? "").split(",").filter(Boolean) : [],
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    }));
  }, [params]);

  const cities = [...new Set(institutions.map((i) => i.city))];
  const filtered = useMemo(
    () => filterInstitutions(institutions, reviews, filters),
    [institutions, reviews, filters],
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr]">
      <FilterPanel filters={filters} cities={cities} tags={tags} onChange={setFilters} />
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
              <InstitutionCard
                key={institution.id}
                institution={institution}
                reviews={reviews}
                tags={tags}
              />
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
