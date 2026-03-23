"use client";

import Link from "next/link";
import { Institution, Review, Tag } from "@/types";
import { getInstitutionScore } from "@/lib/institutions";
import { RatingStars } from "@/components/ui/RatingStars";
import { TagBadge } from "@/components/ui/TagBadge";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";

interface InstitutionCardProps {
  institution: Institution;
  reviews: Review[];
  tags: Tag[];
}

export function InstitutionCard({ institution, reviews, tags }: InstitutionCardProps) {
  const { instructors } = useDemoPlatform();
  const score = getInstitutionScore(reviews, institution.id);
  const institutionInstructors = instructors.filter((item) => item.institutionId === institution.id);
  const previewInstructors =
    institutionInstructors.length > 0
      ? institutionInstructors.slice(0, 2)
      : [
          { id: `${institution.id}-f1`, name: "Demo Eğitmen 1", branch: "Matematik" },
          { id: `${institution.id}-f2`, name: "Demo Eğitmen 2", branch: "İngilizce" },
        ];
  const mappedTags = institution.tags
    .map((tagId) => tags.find((item) => item.id === tagId)?.name ?? tagId)
    .slice(0, 3);
  const hiddenCount = Math.max(institution.tags.length - 3, 0);
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <img src={institution.coverImage} alt={institution.name} className="h-44 w-full object-cover" />
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-bold text-slate-900">{institution.name}</h3>
        <p className="text-sm text-slate-600">
          {institution.city} / {institution.district} • {institution.type}
        </p>
        <div className="flex items-center gap-2">
          <RatingStars value={score.average} size="sm" />
          <span className="text-sm text-slate-500">
            {score.average.toFixed(1)} ({score.count})
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-slate-700">{institution.shortDescription}</p>
        <div className="flex flex-wrap gap-2">
          {mappedTags.map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
          {hiddenCount > 0 && <span className="text-sm text-slate-500">+{hiddenCount} etiket</span>}
        </div>
        <p className="text-sm font-semibold text-slate-800">
          ₺{institution.minPrice.toLocaleString("tr-TR")} - ₺
          {institution.maxPrice.toLocaleString("tr-TR")} • {institution.teacherCount} eğitmen
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
          <p className="mb-1 text-xs font-semibold text-slate-700">Demo Eğitmenler</p>
          {previewInstructors.map((instructor) => (
            <p key={instructor.id} className="text-xs text-slate-600">
              {instructor.name} - {instructor.branch}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/institutions/${institution.id}`}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Detay
          </Link>
          <a href={`tel:${institution.phone}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            Ara
          </a>
          <a
            href={institution.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            Web Sitesi
          </a>
        </div>
      </div>
    </article>
  );
}
