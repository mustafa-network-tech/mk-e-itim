"use client";

import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { InstitutionCard } from "@/components/institution/InstitutionCard";
import { TagBadge } from "@/components/ui/TagBadge";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { getInstitutionScore } from "@/lib/institutions";

export default function Home() {
  const { institutions, tags, reviews } = useDemoPlatform();
  const featured = institutions.filter((item) => item.featured).slice(0, 6);
  const topRated = [...institutions]
    .sort((a, b) => getInstitutionScore(reviews, b.id).average - getInstitutionScore(reviews, a.id).average)
    .slice(0, 4);
  const latest = [...institutions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
      <HeroSection />
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Popüler Etiketler / Kategoriler</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag.id} label={tag.name} href={`/listings?tags=${tag.id}`} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Öne Çıkan Kurslar</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((institution) => (
            <InstitutionCard
              key={institution.id}
              institution={institution}
              reviews={reviews}
              tags={tags}
            />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">En Yüksek Puanlı Kurumlar</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topRated.map((institution) => (
            <InstitutionCard
              key={institution.id}
              institution={institution}
              reviews={reviews}
              tags={tags}
            />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Yeni Eklenen Kurumlar</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {latest.map((institution) => (
            <InstitutionCard
              key={institution.id}
              institution={institution}
              reviews={reviews}
              tags={tags}
            />
          ))}
        </div>
      </section>
      <section className="rounded-3xl bg-slate-900 p-8 text-center text-white">
        <h3 className="text-3xl font-bold">Kurumunuzla MK Eğitim&apos;de yerinizi alın</h3>
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
