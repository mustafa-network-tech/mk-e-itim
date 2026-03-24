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
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0e]"
    >
      <article
        className="relative flex min-h-[340px] flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0c0c0e] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45),0_4px_12px_-4px_rgba(0,0,0,0.2)] transition duration-300 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.015] hover:border-white/[0.12] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55),0_8px_20px_-6px_rgba(0,0,0,0.35)] md:min-h-[360px]"
      >
        {cover ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <Image
              src={cover}
              alt=""
              fill
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              loading="lazy"
            />
          </div>
        ) : null}

        {/* Kirli gri gradient (sıcak taş gri) — siyah yerine çamurumsu nötr ton */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-900/[0.07] via-stone-800/18 to-stone-700/46"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[340px] flex-1 flex-col px-6 pb-7 pt-8 md:min-h-[360px] md:px-7 md:pb-8 md:pt-9">
          <p className="text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.14em] text-white/50">
            {categoryLabel}
          </p>

          <h3 className="mt-4 line-clamp-2 text-[1.375rem] font-bold leading-[1.2] tracking-[-0.02em] text-white md:text-2xl md:leading-tight">
            {institution.name}
          </h3>

          <p className="mt-3 text-[0.8125rem] leading-snug text-white/48">
            {institution.city} / {institution.district}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <RatingStars value={average} size="sm" tone="dark" />
            <span className="text-[0.8125rem] tabular-nums text-white/58">
              {average.toFixed(1)}
              <span className="mx-1 text-white/35">·</span>
              {count} yorum
            </span>
          </div>

          <p className="mt-5 line-clamp-2 flex-1 text-[0.8125rem] leading-relaxed text-white/62">
            {institution.shortDescription}
          </p>

          <div className="mt-8 border-t border-white/[0.1] pt-6">
            <p className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.01em] text-white">
              {priceLine}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
