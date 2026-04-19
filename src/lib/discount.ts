import type { Institution } from "@/types";

/** @deprecated İsim uyumu için; metin `institutions.ts` ile aynı. */
export { INSTITUTION_WHATSAPP_TEKLIF_MESSAGE as KURSIYERA_TEKLIF_WHATSAPP_MESSAGE } from "@/lib/institutions";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** İndirim kuralları ve tarih aralığına göre şu an geçerli mi */
export function isDiscountCurrentlyActive(institution: Institution): boolean {
  if (!institution.discountActive || institution.discountPercent <= 0) return false;
  const today = todayISO();
  const start = institution.discountStartDate?.trim();
  const end = institution.discountEndDate?.trim();
  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
}

/** minPrice üzerinden indirimli tutar (yuvarlanmış) */
export function getDiscountedPriceFromMin(minPrice: number, discountPercent: number): number {
  if (discountPercent <= 0 || discountPercent >= 100) return minPrice;
  return Math.round(minPrice - (minPrice * discountPercent) / 100);
}

/** Kart / detay / filtre için tutarlı alt–üst sınır. Ters girilmişse yer değiştirir; tek taraf 0 ise diğerini korur (panelde geçici 0 ile ikisini aynı yapmayız). */
export function normalizeInstitutionPrices(
  minPrice: number,
  maxPrice: number,
): { minPrice: number; maxPrice: number } {
  const a = Number.isFinite(minPrice) ? Math.max(0, minPrice) : 0;
  const b = Number.isFinite(maxPrice) ? Math.max(0, maxPrice) : 0;
  if (a <= 0 && b <= 0) return { minPrice: 0, maxPrice: 0 };
  if (a <= 0 && b > 0) return { minPrice: 0, maxPrice: b };
  if (b <= 0 && a > 0) return { minPrice: a, maxPrice: a };
  if (a > b) return { minPrice: b, maxPrice: a };
  return { minPrice: a, maxPrice: b };
}

export function formatTryPriceRange(minPrice: number, maxPrice: number): string {
  const { minPrice: lo, maxPrice: hi } = normalizeInstitutionPrices(minPrice, maxPrice);
  if (lo <= 0 && hi <= 0) return "—";
  if (lo > 0 && hi > 0) {
    if (lo === hi) return formatTryAmount(lo);
    return `${formatTryAmount(lo)} – ${formatTryAmount(hi)}`;
  }
  if (lo <= 0 && hi > 0) return formatTryAmount(hi);
  if (lo > 0 && hi <= 0) return formatTryAmount(lo);
  return "—";
}

/** Yönetici paneli: 50.000, 50 000, 50000 gibi girişleri tam sayı ₺’ye çevirir (rakam dışını atar). */
export function parseTryPriceInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

/** DB’de price metni kullanılmıyor; priceRange aralık metnini sayılardan üretir. */
export function syncInstitutionPriceDisplayFields(
  minPrice: number,
  maxPrice: number,
): { minPrice: number; maxPrice: number; price: string; priceRange: string } {
  const n = normalizeInstitutionPrices(minPrice, maxPrice);
  return {
    minPrice: n.minPrice,
    maxPrice: n.maxPrice,
    price: "",
    priceRange: formatTryPriceRange(n.minPrice, n.maxPrice),
  };
}

export function getDiscountRibbonText(institution: Institution): string {
  const t = institution.discountText?.trim();
  if (t) return t;
  const p = Math.round(institution.discountPercent);
  return `Kursiyera'ya özel %${p} indirim`;
}

export function formatTryAmount(amount: number): string {
  return `${amount.toLocaleString("tr-TR")} ₺`;
}
