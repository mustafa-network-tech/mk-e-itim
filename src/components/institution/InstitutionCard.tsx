import Image from "next/image";
import Link from "next/link";
import { Institution, Review } from "@/types";
import { getPublicRating, institutionCoverImage } from "@/lib/institutions";
import { RatingStars } from "@/components/ui/RatingStars";

interface InstitutionCardProps {
  institution: Institution;
  reviews: Review[];
}

export function InstitutionCard({ institution, reviews }: InstitutionCardProps) {
  const { average, count } = getPublicRating(institution, reviews);
  const cover = institutionCoverImage(institution);
  const categoryLabel = institution.category;
  const priceLine = institution.price.trim() ? institution.price : institution.priceRange;

  return (
    <Link
      href={`/institutions/${institution.id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 ease-out hover:scale-[1.02] hover:shadow-xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200">
          {cover ? (
            <Image
              src={cover}
              alt={institution.name}
              fill
              className="object-cover transition duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              loading="lazy"
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">{categoryLabel}</p>
            <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-white drop-shadow-sm">
              {institution.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <p className="text-sm text-slate-600">
            {institution.city} / {institution.district}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <RatingStars value={average} size="sm" />
            <span className="text-sm text-slate-500">
              {average.toFixed(1)} · {count} yorum
            </span>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-slate-700">{institution.shortDescription}</p>

          <p className="mt-auto text-sm font-semibold text-slate-900">{priceLine}</p>
        </div>
      </article>
    </Link>
  );
}
