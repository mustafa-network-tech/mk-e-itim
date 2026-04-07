import type { InstitutionProgramCard, InstitutionProgramModalItem } from "@/types";

/** Her program kartının modaldaki satır sayısı (şeffaf kutular). */
export const PROGRAM_MODAL_ITEM_COUNT = 8;

/** Kurum başına program kartı: en az bu kadar (varsayılan). */
export const INSTITUTION_PROGRAM_CARD_MIN = 2;
/** Kurum başına program kartı: en fazla. */
export const INSTITUTION_PROGRAM_CARD_MAX = 8;

/** @deprecated INSTITUTION_PROGRAM_CARD_MAX kullanın. */
export const INSTITUTION_PROGRAM_CARD_COUNT = INSTITUTION_PROGRAM_CARD_MAX;

export function createEmptyModalItems(): InstitutionProgramModalItem[] {
  return Array.from({ length: PROGRAM_MODAL_ITEM_COUNT }, () => ({ title: "", subtitle: "" }));
}

export function createEmptyProgramCardRow(): InstitutionProgramCard {
  return {
    title: "",
    body: "",
    modalItems: createEmptyModalItems(),
  };
}

export function createEmptyProgramCards(): InstitutionProgramCard[] {
  return [createEmptyProgramCardRow(), createEmptyProgramCardRow()];
}

function isProgramCardWhollyEmpty(c: InstitutionProgramCard): boolean {
  if (c.title.trim() || c.body.trim()) return false;
  return !c.modalItems.some((m) => m.title.trim() || m.subtitle.trim());
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

function parseOneProgramCard(x: unknown): InstitutionProgramCard {
  const raw = x as { title?: unknown; body?: unknown; modalItems?: unknown } | undefined;
  const title = typeof raw?.title === "string" ? raw.title : "";
  const bodyRaw = typeof raw?.body === "string" ? raw.body : "";
  let modalItems = parseModalItemsFromUnknown(raw?.modalItems);
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
  return { title, body, modalItems };
}

export function normalizeProgramCards(input: unknown): InstitutionProgramCard[] {
  const arr = Array.isArray(input) ? input : [];
  let out = arr.slice(0, INSTITUTION_PROGRAM_CARD_MAX).map((x) => parseOneProgramCard(x));
  while (
    out.length > INSTITUTION_PROGRAM_CARD_MIN &&
    isProgramCardWhollyEmpty(out[out.length - 1]!)
  ) {
    out.pop();
  }
  while (out.length < INSTITUTION_PROGRAM_CARD_MIN) {
    out.push(createEmptyProgramCardRow());
  }
  return out;
}

/** Eski `programs` text[] → satır başlıkları kart olarak (en fazla MAX). */
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
  const lines = programsFallback.map((s) => s.trim()).filter(Boolean);
  if (lines.length === 0) {
    return normalizeProgramCards([]);
  }
  const fromLines = lines.slice(0, INSTITUTION_PROGRAM_CARD_MAX).map((title) => ({
    title,
    body: "",
    modalItems: createEmptyModalItems(),
  }));
  return normalizeProgramCards(fromLines);
}

/** `programs` text[] sütunu — kart başlıklarından (boş olmayan). */
export function programsArrayFromProgramCards(cards: InstitutionProgramCard[]): string[] {
  return normalizeProgramCards(cards)
    .map((c) => c.title.trim())
    .filter(Boolean);
}
