"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { HeroSection } from "@/components/home/HeroSection";
import { InstitutionCard } from "@/components/institution/InstitutionCard";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { filterInstitutions, getPublicRating } from "@/lib/institutions";
import {
  buildAramaPrefillHref,
  hasActiveHomeSearch,
  institutionFiltersFromSearchParams,
} from "@/lib/homeSearchParams";

function HomeContent() {
  const params = useSearchParams();
  const { institutions, reviews } = useDemoPlatform();
  const hasInstitutions = institutions.length > 0;
  const searchActive = hasActiveHomeSearch(params);

  const filterState = useMemo(
    () => institutionFiltersFromSearchParams(params),
    [params],
  );

  const searchResults = useMemo(() => {
    if (!searchActive) return [];
    return filterInstitutions(institutions, reviews, filterState);
  }, [institutions, reviews, filterState, searchActive]);

  const featured = institutions.filter((item) => item.featured).slice(0, 6);
  const topRated = [...institutions]
    .sort((a, b) => getPublicRating(b, reviews).average - getPublicRating(a, reviews).average)
    .slice(0, 4);
  const latest = [...institutions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  const editSearchHref = buildAramaPrefillHref(filterState);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <HeroSection />
      {!hasInstitutions ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Henüz listelenen kurum yok</h2>
          <p className="mt-3 text-sm text-slate-600">
            Yerel listedeki demo kurumlar kaldırıldı. Kurumlar veritabanından (Supabase) bağlandığında bu
            bölümlerde görünecek. Hâlâ eski demo kartlarını görüyorsanız sayfayı tam yenileyin (Ctrl+F5) veya
            gizli pencerede açın; canlı sitede Vercel&apos;in son deploy&apos;unu kontrol edin.
          </p>
        </section>
      ) : (
        <>
          {searchActive ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Arama sonuçları</h2>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={editSearchHref}
                    className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Filtreleri değiştir
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Aramayı temizle
                  </Link>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                {searchResults.length} kurum listeleniyor.
              </p>
              {searchResults.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                  Bu filtrelere uygun kurum bulunamadı. Filtreleri değiştirmeyi deneyin.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {searchResults.map((institution) => (
                    <InstitutionCard key={institution.id} institution={institution} reviews={reviews} />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {!searchActive ? (
            <>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Öne Çıkan Kurslar</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {featured.map((institution) => (
                    <InstitutionCard key={institution.id} institution={institution} reviews={reviews} />
                  ))}
                </div>
              </section>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">En Yüksek Puanlı Kurumlar</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {topRated.map((institution) => (
                    <InstitutionCard key={institution.id} institution={institution} reviews={reviews} />
                  ))}
                </div>
              </section>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Yeni Eklenen Kurumlar</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {latest.map((institution) => (
                    <InstitutionCard key={institution.id} institution={institution} reviews={reviews} />
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </>
      )}
      <section className="rounded-3xl bg-slate-900 p-8 text-center text-white">
        <h3 className="text-3xl font-bold">Kurumunuzla kursiyera&apos;da yerinizi alın</h3>
        <p className="mt-3 text-slate-300">
          Kurum kartınızı yönetin, yorumları takip edin ve görünürlüğünüzü artırın.
        </p>
        <Link
          href="/kurumsal-giris"
          className="mt-5 inline-flex rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400"
        >
          Kurumsal Giriş
        </Link>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 text-slate-500">Yükleniyor…</div>}>
      <HomeContent />
    </Suspense>
  );
}
