"use client";

import { notFound, useParams } from "next/navigation";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { RatingStars } from "@/components/ui/RatingStars";
import { TagBadge } from "@/components/ui/TagBadge";
import { getInstitutionScore } from "@/lib/institutions";
import { ReviewSection } from "@/components/review/ReviewSection";
import { PageNav } from "@/components/ui/PageNav";
import { instructors } from "@/data/instructors";

export default function InstitutionDetailPage() {
  const params = useParams<{ id: string }>();
  const { institutions, tags, reviews } = useDemoPlatform();
  const institution = institutions.find((item) => item.id === params.id);
  if (!institution) return notFound();
  const institutionInstructors = instructors.filter((item) => item.institutionId === institution.id);

  const score = getInstitutionScore(reviews, institution.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <PageNav />
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <img src={institution.coverImage} alt={institution.name} className="h-72 w-full object-cover" />
        <div className="space-y-3 p-6">
          <h1 className="text-3xl font-bold">{institution.name}</h1>
          <p className="text-slate-600">
            {institution.city} / {institution.district} • {institution.type}
          </p>
          <div className="flex items-center gap-2">
            <RatingStars value={score.average} />
            <span className="text-sm text-slate-500">
              {score.average.toFixed(1)} / 5 ({score.count} değerlendirme)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {institution.tags.map((tagId) => (
              <TagBadge key={tagId} label={tags.find((t) => t.id === tagId)?.name ?? tagId} />
            ))}
          </div>
          <p className="text-slate-700">{institution.longDescription}</p>
          <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>Programlar: {institution.programs.join(", ")}</p>
            <p>Eğitmen sayısı: {institution.teacherCount}</p>
            <p>
              Fiyat aralığı: ₺{institution.minPrice.toLocaleString("tr-TR")} - ₺
              {institution.maxPrice.toLocaleString("tr-TR")}
            </p>
            <p>Adres: {institution.address}</p>
            <a href={`tel:${institution.phone}`}>Telefon: {institution.phone}</a>
            <a href={institution.website} target="_blank" rel="noreferrer">
              Web sitesi
            </a>
          </div>
          <div className="pt-2">
            <h2 className="mb-2 text-lg font-bold text-slate-900">Eğitmen Kadrosu</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {institutionInstructors.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">{item.branch}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <ReviewSection institutionId={institution.id} />
    </div>
  );
}
