import type { InstitutionProgramCard } from "@/types";

export const INSTITUTION_PROGRAM_CARD_COUNT = 8;

export function createEmptyProgramCards(): InstitutionProgramCard[] {
  return Array.from({ length: INSTITUTION_PROGRAM_CARD_COUNT }, () => ({ title: "", body: "" }));
}

export function normalizeProgramCards(input: unknown): InstitutionProgramCard[] {
  const arr = Array.isArray(input) ? input : [];
  const out: InstitutionProgramCard[] = [];
  for (let i = 0; i < INSTITUTION_PROGRAM_CARD_COUNT; i++) {
    const x = arr[i] as { title?: unknown; body?: unknown } | undefined;
    out.push({
      title: typeof x?.title === "string" ? x.title : "",
      body: typeof x?.body === "string" ? x.body : "",
    });
  }
  return out;
}

/** Eski `programs` text[] → ilk satırlar kart başlığı olarak. */
export function programCardsFromDbRow(
  programCardsRaw: unknown,
  programsFallback: string[],
): InstitutionProgramCard[] {
  if (programCardsRaw != null) {
    const parsed = normalizeProgramCards(programCardsRaw);
    if (parsed.some((c) => c.title.trim() || c.body.trim())) return parsed;
  }
  const out = createEmptyProgramCards();
  const lines = programsFallback.map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(lines.length, INSTITUTION_PROGRAM_CARD_COUNT); i++) {
    out[i] = { title: lines[i], body: "" };
  }
  return out;
}

/** `programs` text[] sütunu — kart başlıklarından (boş olmayan). */
export function programsArrayFromProgramCards(cards: InstitutionProgramCard[]): string[] {
  return normalizeProgramCards(cards)
    .map((c) => c.title.trim())
    .filter(Boolean);
}
