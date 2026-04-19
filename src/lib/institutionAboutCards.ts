import type { InstitutionAboutCard, InstitutionSegment } from "@/types";

export const INSTITUTION_ABOUT_CARD_COUNT = 8;

/** Eğitim kurumları: dershane / sınav hazırlık odaklı sabit başlıklar. */
export const INSTITUTION_ABOUT_CARD_TITLES_EDUCATION: readonly string[] = [
  "Kuruluş Yılı",
  "Toplam Derslik Sayısı",
  "Tek Seans Öğrenci Kapasitesi",
  "Kütüphane Kapasitesi",
  "Sınıf Mevcutları",
  "Bir Rehber (Koç Öğretmene Düşen Öğrenci Sayısı)",
  "Öğretmen Kadrosunun Ortalama Deneyimi",
  "Aktif Kurs Programları",
];

/**
 * @deprecated Sürücü kursunda 8 kartın başlığı artık sabit değil; kurum elle yazar.
 * Eski kayıtlar / dokümantasyon için referans metinleri.
 */
export const INSTITUTION_ABOUT_CARD_TITLES_DRIVING_LEGACY: readonly string[] = [
  "Teorik dersler (haftalık program ve saatler)",
  "Direksiyon eğitimi (toplam saat, güzergâh, araç)",
  "Ehliyet sınıfı ve başvuru (B, C, CE, D vb.)",
  "SRC belgesi ve mesleki yeterlilik eğitimleri",
  "Operatörlük ve iş makinesi operatörlük belgesi",
  "Sınav hazırlığı ve uygulama",
  "Kayıt, süre, ücret ve taksit",
  "Eğitmen kadrosu ve ek hizmetler",
];

/** Geriye dönük uyumluluk: eğitim kurumu başlıkları. */
export const INSTITUTION_ABOUT_CARD_TITLES = INSTITUTION_ABOUT_CARD_TITLES_EDUCATION;

export function aboutCardTitlesForSegment(segment: InstitutionSegment): readonly string[] {
  return segment === "driving_school" ? INSTITUTION_ABOUT_CARD_TITLES_DRIVING_LEGACY : INSTITUTION_ABOUT_CARD_TITLES_EDUCATION;
}

export function createEmptyAboutCards(segment: InstitutionSegment = "education"): InstitutionAboutCard[] {
  if (segment === "driving_school") {
    return Array.from({ length: INSTITUTION_ABOUT_CARD_COUNT }, () => ({ title: "", body: "" }));
  }
  return aboutCardTitlesForSegment(segment).map((title) => ({ title, body: "" }));
}

export function normalizeAboutCards(
  input: unknown,
  segment: InstitutionSegment = "education",
): InstitutionAboutCard[] {
  const arr = Array.isArray(input) ? input : [];
  const out: InstitutionAboutCard[] = [];
  if (segment === "driving_school") {
    for (let i = 0; i < INSTITUTION_ABOUT_CARD_COUNT; i++) {
      const x = arr[i] as { title?: unknown; body?: unknown } | undefined;
      out.push({
        title: typeof x?.title === "string" ? x.title : "",
        body: typeof x?.body === "string" ? x.body : "",
      });
    }
    return out;
  }
  const titles = aboutCardTitlesForSegment(segment);
  for (let i = 0; i < INSTITUTION_ABOUT_CARD_COUNT; i++) {
    const x = arr[i] as { title?: unknown; body?: unknown } | undefined;
    const title = titles[i] ?? "";
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
  segment: InstitutionSegment = "education",
): InstitutionAboutCard[] {
  if (aboutCardsRaw != null) {
    const parsed = normalizeAboutCards(aboutCardsRaw, segment);
    const hasAny = parsed.some((c) => c.title.trim() || c.body.trim());
    if (hasAny) return parsed;
  }
  const cards = createEmptyAboutCards(segment);
  const ld = longDescriptionFallback.trim();
  if (ld && segment !== "driving_school") cards[0] = { ...cards[0], body: ld };
  return cards;
}

/** Arama / `long_description` sütunu senkronu için düz metin. */
export function longDescriptionFromAboutCards(
  cards: InstitutionAboutCard[],
  segment: InstitutionSegment = "education",
): string {
  return normalizeAboutCards(cards, segment)
    .map((c) => {
      const t = c.title.trim();
      const b = c.body.trim();
      if (!b) return "";
      return t ? `${t}\n${b}` : b;
    })
    .filter(Boolean)
    .join("\n\n");
}
