/** Kurum türleri — URL `?exam=` ve `Institution.examNavIds` ile birebir (Türkçe yerel eşleştirme). */

import type { InstitutionSegment } from "@/types";

export const EXAM_NAV_DIGER = "DIGER";

/** Sürücü kursu içindeki uzmanlık kodları (ehliyet, SRC, operatörlük / iş makinesi tek başlıkta). */
export const DRIVING_OFFERING_EXAM_IDS = ["EHLİYET", "SRC", "OPERATORLUK"] as const;

/**
 * Genel sitede üst menüde tek listeleme bağlantısı bu koda gider (`?exam=`).
 * SRC / operatörlük üst menüde ayrı satır değil; kurum kartı ve panelde aynı kurum içi «bölüm» olarak seçilir.
 */
export const SITE_HEADER_LISTINGS_EXAM_ID = "EHLİYET" as const;

/** Ana kategoriler + SRC / operatörlük + DİĞER; URL ?exam= ile aynı kodlar. İş makinesi = OPERATORLUK ile birleşik. */
export const EXAM_NAV_PRIMARY_VALUES = [
  "LGS",
  "YKS",
  "YABANCI DİL",
  "EHLİYET",
  "SRC",
  "OPERATORLUK",
  "KPSS",
] as const;
export type ExamNavPrimaryValue = (typeof EXAM_NAV_PRIMARY_VALUES)[number];

export const EXAM_NAV_ALL_VALUES = [...EXAM_NAV_PRIMARY_VALUES, EXAM_NAV_DIGER] as const;
export type ExamNavValue = (typeof EXAM_NAV_ALL_VALUES)[number];

/** Menü ve formlar için sabit sıra + görünen etiket. */
export const EXAM_NAV_MENU_ITEMS: { label: string; value: ExamNavValue }[] = [
  { label: "LGS", value: "LGS" },
  { label: "YKS", value: "YKS" },
  { label: "Yabancı dil", value: "YABANCI DİL" },
  { label: "Ehliyet", value: "EHLİYET" },
  { label: "SRC belgesi", value: "SRC" },
  { label: "Operatörlük / iş makinesi belgesi", value: "OPERATORLUK" },
  { label: "KPSS", value: "KPSS" },
  { label: "Diğer", value: EXAM_NAV_DIGER },
];

const DISPLAY_LABEL: Record<string, string> = Object.fromEntries(
  EXAM_NAV_MENU_ITEMS.map((item) => [item.value, item.label]),
);

export function defaultExamNavLabelMap(): Record<string, string> {
  return { ...DISPLAY_LABEL };
}

function isExamNavValue(v: string): v is ExamNavValue {
  return (EXAM_NAV_ALL_VALUES as readonly string[]).includes(v);
}

/** Geçerli değerleri menü sırasına göre tekilleştirir. Eski `IS_MAKINESI` → `OPERATORLUK` eşlenir. */
export function normalizeExamNavIds(ids: readonly string[]): ExamNavValue[] {
  const set = new Set<ExamNavValue>();
  for (const raw of ids) {
    const t = raw.trim();
    if (t === "YGS") {
      set.add("YKS");
      continue;
    }
    if (t === "IS_MAKINESI") {
      set.add("OPERATORLUK");
      continue;
    }
    if (isExamNavValue(t)) set.add(t);
  }
  return EXAM_NAV_ALL_VALUES.filter((v) => set.has(v));
}

/** Kart / kategori metni; `labelMap` admin panelinden gelen görünen adları kullanır. */
export function categoryDisplayFromExamNavIds(
  ids: readonly string[],
  labelMap: Record<string, string> = defaultExamNavLabelMap(),
): string {
  const n = normalizeExamNavIds(ids);
  return n.map((v) => labelMap[v] ?? DISPLAY_LABEL[v] ?? v).join(" · ");
}

/** Sürücü kursunda seçilen ehliyet / SRC / operatörlük etiketleri (gösterim için). */
export function drivingSchoolOfferingsLabels(
  examNavIds: readonly string[],
  labelMap: Record<string, string> = defaultExamNavLabelMap(),
): string[] {
  const n = normalizeExamNavIds(examNavIds);
  return DRIVING_OFFERING_EXAM_IDS.filter((id) => n.includes(id)).map(
    (id) => labelMap[id] ?? DISPLAY_LABEL[id] ?? id,
  );
}

/** Kart / detay: sürücü uzmanlık satırı (örn. «Ehliyet · SRC»). */
export function drivingSchoolOfferingsLine(
  examNavIds: readonly string[],
  labelMap: Record<string, string> = defaultExamNavLabelMap(),
): string {
  return drivingSchoolOfferingsLabels(examNavIds, labelMap).join(" · ");
}

/** `category` sütunu: sürücü kursu üst tür + alt uzmanlıklar. */
export function drivingSchoolCategoryForStorage(
  examNavIds: readonly string[],
  labelMap: Record<string, string> = defaultExamNavLabelMap(),
): string {
  const sub = drivingSchoolOfferingsLine(examNavIds, labelMap);
  return sub ? `Sürücü kursu — ${sub}` : "Sürücü kursu";
}

/** Segmente göre `Institution.category` metni (eğitim: eski davranış; sürücü: tek çatı). */
export function institutionCategoryFromExam(
  segment: InstitutionSegment,
  examNavIds: readonly string[],
  labelMap: Record<string, string> = defaultExamNavLabelMap(),
): string {
  if (segment === "driving_school") {
    return drivingSchoolCategoryForStorage(examNavIds, labelMap);
  }
  return categoryDisplayFromExamNavIds(examNavIds, labelMap);
}

function matchTokenToExamNav(token: string): ExamNavValue | null {
  const t = token.trim();
  if (!t) return null;
  if (/^diğer$/iu.test(t)) return EXAM_NAV_DIGER;

  const aliases: [string, ExamNavValue][] = [
    ["YGS", "YKS"],
    ["LYS", "LGS"],
  ];
  for (const [from, to] of aliases) {
    if (t.localeCompare(from, "tr", { sensitivity: "accent" }) === 0) return to;
  }

  for (const v of EXAM_NAV_ALL_VALUES) {
    if (t.localeCompare(v, "tr", { sensitivity: "accent" }) === 0) return v;
  }
  return null;
}

/**
 * Eski tek `category` metninden dizi üretir (virgül / · / | ile çoklu da okunur).
 * Tanınmayan metin → yalnızca DİĞER.
 */
export function legacyCategoryToExamNavIds(category: string): ExamNavValue[] {
  const c = category.trim();
  if (!c) return [EXAM_NAV_DIGER];

  const whole = matchTokenToExamNav(c);
  if (whole) return normalizeExamNavIds([whole]);

  const parts = c.split(/[·,|]/).map((p) => p.trim()).filter(Boolean);
  const found: ExamNavValue[] = [];
  for (const p of parts) {
    const m = matchTokenToExamNav(p);
    if (m) found.push(m);
  }
  return found.length > 0 ? normalizeExamNavIds(found) : [EXAM_NAV_DIGER];
}

export function institutionMatchesExamNav(
  examNavIds: readonly string[],
  exam: string | null | undefined,
): boolean {
  if (exam == null || exam === "") return true;
  const normalized = normalizeExamNavIds(examNavIds);
  if (exam === EXAM_NAV_DIGER) {
    return normalized.includes(EXAM_NAV_DIGER);
  }
  return normalized.some(
    (id) => id.localeCompare(exam, "tr", { sensitivity: "accent" }) === 0,
  );
}
