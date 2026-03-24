/** Eğitim Danışmanı → listeleme URL’si (query parametreleri listings ile uyumlu). */

export type AdvisorPriceRangeId = "p2000_4000" | "p4000_6000" | "p6000_plus";

export const ADVISOR_SUBJECT_TAG_IDS = [
  "matematik",
  "fizik",
  "ingilizce",
  "yazilim",
  "robotik",
  "resim",
  "muzik",
  "dil-egitimi",
] as const;

export const PRICE_RANGE_OPTIONS: {
  id: AdvisorPriceRangeId;
  label: string;
  minPrice: number;
  maxPrice?: number;
}[] = [
  { id: "p2000_4000", label: "2.000 – 4.000 ₺", minPrice: 2000, maxPrice: 4000 },
  { id: "p4000_6000", label: "4.000 – 6.000 ₺", minPrice: 4000, maxPrice: 6000 },
  { id: "p6000_plus", label: "6.000 ₺ ve üzeri", minPrice: 6000 },
];

export function normalizeCityInput(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** Veri setindeki tam şehir adını döndürür; yoksa null. */
export function resolveCity(input: string, cities: string[]): string | null {
  const n = normalizeCityInput(input);
  if (!n) return null;
  const lower = n.toLocaleLowerCase("tr-TR");
  for (const c of cities) {
    if (c.toLocaleLowerCase("tr-TR") === lower) return c;
  }
  return null;
}

export function buildAdvisorListingsHref(params: {
  city: string;
  district: string;
  gradeLevelId: string;
  subjectTagId?: string | null;
  minPrice: number;
  maxPrice?: number;
}): string {
  const q = new URLSearchParams();
  q.set("city", params.city);
  q.set("district", params.district);
  q.set("grade", params.gradeLevelId);
  q.set("minPrice", String(params.minPrice));
  if (typeof params.maxPrice === "number") {
    q.set("maxPrice", String(params.maxPrice));
  }
  if (params.subjectTagId) {
    q.set("subject", params.subjectTagId);
  }
  q.set("advisor", "1");
  return `/listings?${q.toString()}`;
}
