"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/search/FilterPanel";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import {
  buildHomeHref,
  emptyInstitutionFilters,
  institutionFiltersFromSearchParams,
} from "@/lib/homeSearchParams";
import type { InstitutionFilters } from "@/types";

function AramaContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { institutions, tags, gradeLevels } = useDemoPlatform();
  const cities = [...new Set(institutions.map((i) => i.city))];

  const [filters, setFilters] = useState<InstitutionFilters>(() =>
    institutionFiltersFromSearchParams(params),
  );

  useEffect(() => {
    setFilters(institutionFiltersFromSearchParams(params));
  }, [params]);

  const apply = () => {
    router.push(buildHomeHref(filters));
  };

  const clearForm = () => {
    setFilters(emptyInstitutionFilters());
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            ← Ana sayfa
          </Link>
          <button
            type="button"
            className="text-xs font-medium text-slate-500 hover:text-slate-800"
            onClick={clearForm}
          >
            Formu temizle
          </button>
        </div>
        <h1 className="mx-auto mt-2 max-w-lg text-lg font-bold text-slate-900">Arama ve filtreler</h1>
        <p className="mx-auto mt-1 max-w-lg text-xs text-slate-500">
          Seçimlerinizi yapın; alttaki «Ara» ile ana sayfada sonuçları görüntüleyin.
        </p>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-28 sm:px-6">
        <FilterPanel
          filters={filters}
          cities={cities}
          institutions={institutions}
          tags={tags}
          gradeLevels={gradeLevels}
          onChange={setFilters}
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_28px_rgba(0,0,0,0.08)] backdrop-blur-sm [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:bg-slate-950"
            onClick={apply}
          >
            Ara
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AramaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-slate-500">Yükleniyor…</div>
      }
    >
      <AramaContent />
    </Suspense>
  );
}
