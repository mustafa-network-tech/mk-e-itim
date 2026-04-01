import type { InstitutionAboutCard } from "@/types";

export const INSTITUTION_ABOUT_CARD_COUNT = 8;

export function createEmptyAboutCards(): InstitutionAboutCard[] {
  return Array.from({ length: INSTITUTION_ABOUT_CARD_COUNT }, () => ({ title: "", body: "" }));
}

export function normalizeAboutCards(input: unknown): InstitutionAboutCard[] {
  const arr = Array.isArray(input) ? input : [];
  const out: InstitutionAboutCard[] = [];
  for (let i = 0; i < INSTITUTION_ABOUT_CARD_COUNT; i++) {
    const x = arr[i] as { title?: unknown; body?: unknown } | undefined;
    out.push({
      title: typeof x?.title === "string" ? x.title : "",
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
  if (ld) cards[0] = { title: "", body: ld };
  return cards;
}

/** Arama / `long_description` sütunu senkronu için düz metin. */
export function longDescriptionFromAboutCards(cards: InstitutionAboutCard[]): string {
  return normalizeAboutCards(cards)
    .map((c) => {
      const t = c.title.trim();
      const b = c.body.trim();
      if (t && b) return `${t}\n${b}`;
      return t || b;
    })
    .filter(Boolean)
    .join("\n\n");
}
