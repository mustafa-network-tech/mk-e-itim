import type { Institution } from "@/types";

/** Kursiyera teklif / bilgi mesajı (WhatsApp ön doldurma) */
export const KURSIYERA_TEKLIF_WHATSAPP_MESSAGE =
  "Merhaba, Kursiyera üzerinden bu kurum hakkında bilgi ve teklif almak istiyorum.";

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

export function getDiscountRibbonText(institution: Institution): string {
  const t = institution.discountText?.trim();
  if (t) return t;
  const p = Math.round(institution.discountPercent);
  return `Kursiyera'ya özel %${p} indirim`;
}

export function formatTryAmount(amount: number): string {
  return `${amount.toLocaleString("tr-TR")} ₺`;
}
