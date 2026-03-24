import Image from "next/image";
import Link from "next/link";
import { Institution, Review } from "@/types";
import { getPublicRating, institutionCoverImage, institutionWhatsAppHref } from "@/lib/institutions";
import { isDiscountCurrentlyActive, KURSIYERA_TEKLIF_WHATSAPP_MESSAGE } from "@/lib/discount";
import { RatingStars } from "@/components/ui/RatingStars";
import { InstitutionDiscountBadge, InstitutionPriceBlock } from "@/components/institution/InstitutionPriceBlock";

interface InstitutionCardProps {
  institution: Institution;
  reviews: Review[];
}

export function InstitutionCard({ institution, reviews }: InstitutionCardProps) {
  const { average, count } = getPublicRating(institution, reviews);
  const cover = institutionCoverImage(institution);
  const categoryLabel = institution.category;
  const waHref = institutionWhatsAppHref(institution, KURSIYERA_TEKLIF_WHATSAPP_MESSAGE);
  const hasDiscountBadge = isDiscountCurrentlyActive(institution);

  return (
    <article className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0c0c0e] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45),0_4px_12px_-4px_rgba(0,0,0,0.2)] transition duration-300 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.015] hover:border-white/[0.12] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55),0_8px_20px_-6px_rgba(0,0,0,0.35)] md:min-h-[380px]">
      <Link
        href={`/institutions/${institution.id}`}
        className="relative z-10 flex min-h-0 flex-1 flex-col px-6 pb-4 pt-6 md:px-7 md:pt-7"
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

        {/* Okunabilirlik: daha koyu katmanlar (görsel hâlâ seçilebilir) */}
        <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/72"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
          aria-hidden
        />

        <InstitutionDiscountBadge institution={institution} />

        <div
          className={`relative z-10 flex min-h-[280px] flex-1 flex-col md:min-h-[300px] ${hasDiscountBadge ? "pt-10 sm:pt-11" : ""}`}
        >
          <p className="text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.14em] text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]">
            {categoryLabel}
          </p>

          <h3 className="mt-4 line-clamp-2 text-[1.375rem] font-bold leading-[1.2] tracking-[-0.02em] text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.75)] md:text-2xl md:leading-tight">
            {institution.name}
          </h3>

          <p className="mt-3 text-[0.8125rem] leading-snug text-white/80 [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]">
            {institution.city} / {institution.district}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <RatingStars value={average} size="sm" tone="dark" />
            <span className="text-[0.8125rem] tabular-nums text-white/88 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]">
              {average.toFixed(1)}
              <span className="mx-1 text-white/50">·</span>
              {count} yorum
            </span>
          </div>

          <p className="mt-5 line-clamp-2 flex-1 text-[0.8125rem] leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            {institution.shortDescription}
          </p>

          <div className="mt-8 border-t border-white/15 pt-5">
            <InstitutionPriceBlock institution={institution} variant="cardDark" />
          </div>
        </div>
      </Link>

      <div className="relative z-20 border-t border-white/[0.08] px-6 pb-6 pt-3 md:px-7">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600/95 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Teklif Al
        </a>
      </div>
    </article>
  );
}
