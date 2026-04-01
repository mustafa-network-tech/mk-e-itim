"use client";

import type { Institution } from "@/types";
import {
  formatTryPriceRange,
  getDiscountRibbonText,
  getDiscountedPriceFromMin,
  isDiscountCurrentlyActive,
  normalizeInstitutionPrices,
} from "@/lib/discount";

type Variant = "cardDark" | "detailLight";

/** Detay sayfası — görselin altında açık zemin şerit */
export function InstitutionDetailDiscountBand({ institution }: { institution: Institution }) {
  if (!isDiscountCurrentlyActive(institution)) return null;
  return (
    <div className="border-b border-amber-200/50 bg-gradient-to-r from-[#faf7ef] via-amber-50/90 to-[#faf7ef] px-4 py-3 text-center">
      <p className="text-sm font-semibold tracking-tight text-amber-950/90">
        {getDiscountRibbonText(institution)}
      </p>
    </div>
  );
}

/** Kart üstü — mavi pill, admin metni; hafif glow pulse (globals.css) */
export function InstitutionDiscountBadge({ institution }: { institution: Institution }) {
  if (!isDiscountCurrentlyActive(institution)) return null;
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-[min(100%-2rem,18rem)] md:left-5 md:top-5">
      <span className="institution-discount-badge-pulse inline-flex rounded-full border border-white/25 bg-gradient-to-r from-sky-600 to-blue-700 px-3 py-1.5 text-[0.6875rem] font-semibold leading-snug text-white shadow-md sm:text-[0.75rem]">
        <span className="line-clamp-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
          {getDiscountRibbonText(institution)}
        </span>
      </span>
    </div>
  );
}

export function InstitutionPriceBlock({ institution, variant }: { institution: Institution; variant: Variant }) {
  const active = isDiscountCurrentlyActive(institution);
  const { minPrice: lo, maxPrice: hi } = normalizeInstitutionPrices(institution.minPrice, institution.maxPrice);
  const rangeLabel = formatTryPriceRange(lo, hi);
  const p = institution.discountPercent;
  const discLo = getDiscountedPriceFromMin(lo, p);
  const discHi = getDiscountedPriceFromMin(hi, p);
  const discountedRangeLabel = formatTryPriceRange(discLo, discHi);

  if (variant === "cardDark") {
    if (!active) {
      return (
        <p className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.01em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
          {rangeLabel}
        </p>
      );
    }
    return (
      <div className="space-y-1.5">
        <p className="text-[0.8125rem] font-medium text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
          Fiyat aralığı
        </p>
        <p className="text-[0.9375rem] font-medium text-white/50 line-through decoration-white/40 [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]">
          {rangeLabel}
        </p>
        <p className="text-[1.2rem] font-bold tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">
          {discountedRangeLabel}
        </p>
      </div>
    );
  }

  /* detailLight */
  if (!active) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fiyat aralığı</p>
        <p className="text-lg font-semibold text-slate-900">{rangeLabel}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fiyat aralığı</p>
      <p className="text-base text-slate-400 line-through">{rangeLabel}</p>
      <p className="text-2xl font-bold tracking-tight text-slate-900">{discountedRangeLabel}</p>
    </div>
  );
}
