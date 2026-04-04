import type { Institution, InstitutionAboutCard, InstitutionManagerPendingPayload } from "@/types";
import { syncInstitutionPriceDisplayFields } from "@/lib/discount";
import { longDescriptionFromAboutCards, normalizeAboutCards } from "@/lib/institutionAboutCards";
import { normalizeProgramCards, programsArrayFromProgramCards } from "@/lib/institutionProgramCards";

/** Supabase/PostgREST hata metnini kullanıcıya daha anlaşılır Türkçe ile zenginleştirir. */
export function formatInstitutionSaveError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("0 satır") || m.includes("kurum güncellenemedi (0 satır)")) {
    return `${message} — Çoğunlukla veritabanında «institutions_update_admin» RLS politikası yoktur (20260329120000 atlanmış olabilir). Supabase’te migration «20260330150000_ensure_institutions_update_admin.sql» çalıştırın veya aynı CREATE POLICY’yi SQL Editor’de uygulayın. Ayrıca profiles.role gerçekten «admin» mi kontrol edin.`;
  }
  if (
    m.includes("row-level security") ||
    m.includes("42501") ||
    m.includes("violates row-level") ||
    (m.includes("policy") && m.includes("permission"))
  ) {
    return `${message} — Yetki reddedildi: Kurum yayındaysa yönetici doğrudan satır güncelleyemez (yalnızca «Onaya gönder»). Taslak kurumda kayıt için hesabınızın bu kuruma bağlı olduğundan ve migration’ların uygulandığından emin olun.`;
  }
  if (m.includes("submit_institution_pending_changes") || m.includes("function public.submit_institution")) {
    return `${message} — Veritabanında submit_institution_pending_changes RPC’si yok veya eski; migration uygulanmalı.`;
  }
  return message;
}

/** Admin / onay akışında kurum satırına yazılacak alanlar (etiketler ayrı). */
export function buildInstitutionPersistencePayload(d: Institution): Partial<Institution> {
  const priceFields = syncInstitutionPriceDisplayFields(d.minPrice, d.maxPrice);
  const aboutCards = normalizeAboutCards(d.aboutCards);
  const programCards = normalizeProgramCards(d.programCards);
  return {
    name: d.name,
    officialStatus: d.officialStatus,
    city: d.city,
    district: d.district,
    neighborhood: d.neighborhood,
    address: d.address,
    phone: d.phone,
    website: d.website,
    whatsapp: d.whatsapp,
    shortDescription: d.shortDescription,
    aboutCards,
    aboutInstitution: d.aboutInstitution.trim(),
    longDescription: longDescriptionFromAboutCards(aboutCards),
    programCards,
    programs: programsArrayFromProgramCards(programCards),
    examNavIds: d.examNavIds,
    ...priceFields,
    rating: d.rating,
    reviewCount: d.reviewCount,
    images: d.images,
    featured: d.featured,
    topVisible: d.topVisible,
    discountActive: d.discountActive,
    discountPercent: d.discountPercent,
    discountText: d.discountText,
    discountStartDate: d.discountStartDate,
    discountEndDate: d.discountEndDate,
    gradeLevelIds: d.gradeLevelIds,
  };
}

export function buildPendingPayloadFromDraft(d: Institution): InstitutionManagerPendingPayload {
  return {
    body: buildInstitutionPersistencePayload(d),
    tags: [...d.tags],
  };
}

export function mergeInstitutionWithPending(inst: Institution): Institution {
  const p = inst.pendingManagerPayload;
  if (!p?.body) return inst;
  const body = p.body;
  const aboutCards =
    body.aboutCards !== undefined ? normalizeAboutCards(body.aboutCards) : inst.aboutCards;
  const programCards =
    body.programCards !== undefined ? normalizeProgramCards(body.programCards) : inst.programCards;
  return {
    ...inst,
    ...body,
    aboutCards,
    longDescription:
      body.aboutCards !== undefined
        ? longDescriptionFromAboutCards(aboutCards)
        : (body.longDescription ?? inst.longDescription),
    programCards,
    programs:
      body.programCards !== undefined
        ? programsArrayFromProgramCards(programCards)
        : (body.programs ?? inst.programs),
    tags: p.tags ?? inst.tags,
    gradeLevelIds: body.gradeLevelIds ?? inst.gradeLevelIds,
  };
}

/** buildInstitutionPersistencePayload ile aynı alan anahtarları (sıra korunur). */
const PERSISTENCE_BODY_KEYS: (keyof Institution)[] = [
  "name",
  "officialStatus",
  "city",
  "district",
  "neighborhood",
  "address",
  "phone",
  "website",
  "whatsapp",
  "shortDescription",
  "longDescription",
  "aboutCards",
  "aboutInstitution",
  "programCards",
  "examNavIds",
  "price",
  "priceRange",
  "minPrice",
  "maxPrice",
  "rating",
  "reviewCount",
  "programs",
  "images",
  "featured",
  "topVisible",
  "discountActive",
  "discountPercent",
  "discountText",
  "discountStartDate",
  "discountEndDate",
  "gradeLevelIds",
];

const PENDING_FIELD_LABELS: Partial<Record<keyof Institution, string>> = {
  name: "Kurum adı",
  officialStatus: "Resmî statü",
  city: "Şehir",
  district: "İlçe",
  neighborhood: "Mahalle",
  address: "Adres",
  phone: "Telefon",
  website: "Web sitesi",
  whatsapp: "WhatsApp",
  shortDescription: "Kısa açıklama",
  longDescription: "Uzun açıklama (otomatik)",
  aboutCards: "Kurum genel bilgileri (8 kart)",
  aboutInstitution: "Kurum hakkında (metin)",
  programCards: "Programlar (8 kart)",
  examNavIds: "Kurum türleri (menü)",
  price: "Fiyat metni (kullanılmıyor)",
  priceRange: "Fiyat aralığı (otomatik)",
  minPrice: "En düşük (₺)",
  maxPrice: "En yüksek (₺)",
  rating: "Puan",
  reviewCount: "Yorum sayısı",
  programs: "Programlar",
  images: "Görseller",
  featured: "Öne çıkan",
  topVisible: "Üst görünürlük",
  discountActive: "İndirim aktif",
  discountPercent: "İndirim %",
  discountText: "İndirim metni",
  discountStartDate: "İndirim başlangıç",
  discountEndDate: "İndirim bitiş",
  gradeLevelIds: "Sınıf seviyeleri",
};

function previewFieldValue(key: keyof Institution, v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    if (key === "aboutCards") {
      const n = (v as InstitutionAboutCard[]).filter((c) => c.body.trim()).length;
      return `${n}/8 metin dolu`;
    }
    if (key === "programCards") {
      const n = (v as InstitutionAboutCard[]).filter((c) => c.title.trim() || c.body.trim()).length;
      return `${n}/8 kart`;
    }
    if (key === "images" || key === "programs") return `${v.length} satır`;
    return v.map((x) => String(x)).join(", ");
  }
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  if (typeof v === "number") return String(v);
  const s = String(v).trim();
  return s.length > 160 ? `${s.slice(0, 157)}…` : s || "—";
}

function valuesDiffer(key: keyof Institution, a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return JSON.stringify(a ?? []) !== JSON.stringify(b ?? []);
  }
  if (typeof a === "number" || typeof b === "number") {
    return Number(a) !== Number(b);
  }
  return String(a ?? "") !== String(b ?? "");
}

/** Yönetici taslağında canlıya göre değişen alanların kısa listesi (admin özet kutusu). */
export function summarizePendingFieldChanges(inst: Institution): {
  label: string;
  before: string;
  after: string;
}[] {
  const p = inst.pendingManagerPayload;
  if (!p?.body) return [];
  const body = p.body;
  const rows: { label: string; before: string; after: string }[] = [];
  for (const key of PERSISTENCE_BODY_KEYS) {
    if (!(key in body)) continue;
    const beforeV = inst[key as keyof Institution];
    const afterV = body[key];
    if (!valuesDiffer(key, beforeV, afterV)) continue;
    const label = PENDING_FIELD_LABELS[key] ?? String(key);
    rows.push({
      label,
      before: previewFieldValue(key, beforeV),
      after: previewFieldValue(key, afterV),
    });
  }
  const liveTags = [...inst.tags].map(String).sort().join("\n");
  const pendTags = [...(p.tags ?? [])].map(String).sort().join("\n");
  if (liveTags !== pendTags) {
    rows.push({
      label: "Etiketler",
      before: inst.tags.length ? inst.tags.join(", ") : "—",
      after: p.tags?.length ? p.tags.join(", ") : "—",
    });
  }
  return rows;
}

export function parsePendingPayloadFromDb(raw: unknown): InstitutionManagerPendingPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!o.body || typeof o.body !== "object") return null;
  const rawTags = o.tags;
  let tags: string[];
  if (rawTags == null) tags = [];
  else if (Array.isArray(rawTags)) tags = rawTags.map((t) => String(t));
  else return null;
  return { body: o.body as Partial<Institution>, tags };
}
