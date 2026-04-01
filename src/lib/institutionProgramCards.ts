import type { InstitutionProgramCard, InstitutionProgramModalItem } from "@/types";

export const INSTITUTION_PROGRAM_CARD_COUNT = 8;
export const PROGRAM_MODAL_ITEM_COUNT = 8;

export function createEmptyModalItems(): InstitutionProgramModalItem[] {
  return Array.from({ length: PROGRAM_MODAL_ITEM_COUNT }, () => ({ title: "", subtitle: "" }));
}

export function createEmptyProgramCards(): InstitutionProgramCard[] {
  return Array.from({ length: INSTITUTION_PROGRAM_CARD_COUNT }, () => ({
    title: "",
    body: "",
    modalItems: createEmptyModalItems(),
  }));
}

function parseOneModalItem(raw: unknown): InstitutionProgramModalItem {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title : "";
    const subtitle =
      typeof o.subtitle === "string"
        ? o.subtitle
        : typeof o.body === "string"
          ? o.body
          : "";
    return { title, subtitle };
  }
  if (typeof raw === "string") {
    return { title: raw, subtitle: "" };
  }
  return { title: "", subtitle: "" };
}

function parseModalItemsFromUnknown(raw: unknown): InstitutionProgramModalItem[] | null {
  if (!Array.isArray(raw)) return null;
  const out = raw.map(parseOneModalItem).slice(0, PROGRAM_MODAL_ITEM_COUNT);
  while (out.length < PROGRAM_MODAL_ITEM_COUNT) {
    out.push({ title: "", subtitle: "" });
  }
  return out;
}

function bodyFromItems(items: InstitutionProgramModalItem[]): string {
  return items
    .map((it) => {
      const t = it.title.trim();
      const s = it.subtitle.trim();
      if (t && s) return `${t}\n${s}`;
      return t || s;
    })
    .filter(Boolean)
    .join("\n\n");
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
        modalItems[j] = { title: lines[j], subtitle: "" };
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
    if (
      parsed.some(
        (c) =>
          c.title.trim() ||
          c.body.trim() ||
          c.modalItems.some((m) => m.title.trim() || m.subtitle.trim()),
      )
    ) {
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
