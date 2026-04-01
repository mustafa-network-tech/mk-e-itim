import type { InstitutionProgramCard } from "@/types";

export const INSTITUTION_PROGRAM_CARD_COUNT = 8;
export const PROGRAM_MODAL_ITEM_COUNT = 8;

export function createEmptyModalItems(): string[] {
  return Array.from({ length: PROGRAM_MODAL_ITEM_COUNT }, () => "");
}

export function createEmptyProgramCards(): InstitutionProgramCard[] {
  return Array.from({ length: INSTITUTION_PROGRAM_CARD_COUNT }, () => ({
    title: "",
    body: "",
    modalItems: createEmptyModalItems(),
  }));
}

function parseModalItemsFromUnknown(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const out = raw.map((v) => (typeof v === "string" ? v : "")).slice(0, PROGRAM_MODAL_ITEM_COUNT);
  while (out.length < PROGRAM_MODAL_ITEM_COUNT) out.push("");
  return out;
}

function bodyFromItems(items: string[]): string {
  return items
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

export function normalizeProgramCards(input: unknown): InstitutionProgramCard[] {
  const arr = Array.isArray(input) ? input : [];
  const out: InstitutionProgramCard[] = [];
  for (let i = 0; i < INSTITUTION_PROGRAM_CARD_COUNT; i++) {
    const x = arr[i] as
      | { title?: unknown; body?: unknown; modalItems?: unknown }
      | undefined;
    const title = typeof x?.title === "string" ? x.title : "";
    const bodyRaw = typeof x?.body === "string" ? x.body : "";
    let modalItems = parseModalItemsFromUnknown(x?.modalItems);
    if (!modalItems) {
      modalItems = createEmptyModalItems();
      const lines = bodyRaw
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (let j = 0; j < Math.min(lines.length, PROGRAM_MODAL_ITEM_COUNT); j++) {
        modalItems[j] = lines[j];
      }
    }
    const body = bodyFromItems(modalItems) || bodyRaw;
    out.push({ title, body, modalItems });
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
    if (parsed.some((c) => c.title.trim() || c.body.trim() || c.modalItems.some((m) => m.trim()))) {
      return parsed;
    }
  }
  const out = createEmptyProgramCards();
  const lines = programsFallback.map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(lines.length, INSTITUTION_PROGRAM_CARD_COUNT); i++) {
    out[i] = { title: lines[i], body: "", modalItems: createEmptyModalItems() };
  }
  return out;
}

/** `programs` text[] sütunu — kart başlıklarından (boş olmayan). */
export function programsArrayFromProgramCards(cards: InstitutionProgramCard[]): string[] {
  return normalizeProgramCards(cards)
    .map((c) => c.title.trim())
    .filter(Boolean);
}
