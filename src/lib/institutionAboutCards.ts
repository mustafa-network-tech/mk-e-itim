import type { InstitutionAboutCard } from "@/types";

export const INSTITUTION_ABOUT_CARD_COUNT = 8;

/** Kurum genel bilgileri: sabit başlıklar; yalnızca `body` düzenlenir. */
export const INSTITUTION_ABOUT_CARD_TITLES: readonly string[] = [
  "Kuruluş Yılı",
  "Toplam Derslik Sayısı",
  "Tek Seans Öğrenci Kapasitesi",
  "Kütüphane Kapasitesi",
  "Sınıf Mevcutları",
  "Bir Rehber (Koç Öğretmene Düşen Öğrenci Sayısı)",
  "Öğretmen Kadrosunun Ortalama Deneyimi",
  "Aktif Kurs Programları",
];

export function createEmptyAboutCards(): InstitutionAboutCard[] {
  return INSTITUTION_ABOUT_CARD_TITLES.map((title) => ({ title, body: "" }));
}

export function normalizeAboutCards(input: unknown): InstitutionAboutCard[] {
  const arr = Array.isArray(input) ? input : [];
  const out: InstitutionAboutCard[] = [];
  for (let i = 0; i < INSTITUTION_ABOUT_CARD_COUNT; i++) {
    const x = arr[i] as { title?: unknown; body?: unknown } | undefined;
    const title = INSTITUTION_ABOUT_CARD_TITLES[i] ?? "";
    out.push({
      title,
      body: typeof x?.body === "string" ? x.body : "",
    });
  }
  return out;
}

/** Eski `long_description` ile doldurma: sütun yok / boşken tek kart gövdesi. */
export function aboutCardsFromDbRow(
  aboutCardsRaw: unknown,
  longDescriptionFallback: string,
): InstitutionAboutCard[] {
  if (aboutCardsRaw != null) {
    const parsed = normalizeAboutCards(aboutCardsRaw);
    const hasAny = parsed.some((c) => c.title.trim() || c.body.trim());
    if (hasAny) return parsed;
  }
  const cards = createEmptyAboutCards();
  const ld = longDescriptionFallback.trim();
  if (ld) cards[0] = { ...cards[0], body: ld };
  return cards;
}

/** Arama / `long_description` sütunu senkronu için düz metin. */
export function longDescriptionFromAboutCards(cards: InstitutionAboutCard[]): string {
  return normalizeAboutCards(cards)
    .map((c) => {
      const t = c.title.trim();
      const b = c.body.trim();
      if (!b) return "";
      return t ? `${t}\n${b}` : b;
    })
    .filter(Boolean)
    .join("\n\n");
}
