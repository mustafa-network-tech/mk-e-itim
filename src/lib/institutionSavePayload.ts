import type { Institution, InstitutionManagerPendingPayload } from "@/types";

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
    longDescription: d.longDescription,
    examNavIds: d.examNavIds,
    price: d.price,
    priceRange: d.priceRange,
    minPrice: d.minPrice,
    maxPrice: d.maxPrice,
    rating: d.rating,
    reviewCount: d.reviewCount,
    teacherCount: d.teacherCount,
    teacherInfo: d.teacherInfo,
    programs: d.programs,
    images: d.images,
    weeklyHours: d.weeklyHours,
    totalHours: d.totalHours,
    oneToOneLessonCount: d.oneToOneLessonCount,
    classroomCount: d.classroomCount,
    capacity: d.capacity,
    classSize: d.classSize,
    libraryCapacity: d.libraryCapacity,
    hasPublicationSupport: d.hasPublicationSupport,
    examCount: d.examCount,
    hasDigitalPlatform: d.hasDigitalPlatform,
    digitalPlatformInfo: d.digitalPlatformInfo,
    coachingRatio: d.coachingRatio,
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
  return {
    ...inst,
    ...p.body,
    tags: p.tags ?? inst.tags,
    gradeLevelIds: p.body.gradeLevelIds ?? inst.gradeLevelIds,
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
  "examNavIds",
  "price",
  "priceRange",
  "minPrice",
  "maxPrice",
  "rating",
  "reviewCount",
  "teacherCount",
  "teacherInfo",
  "programs",
  "images",
  "weeklyHours",
  "totalHours",
  "oneToOneLessonCount",
  "classroomCount",
  "capacity",
  "classSize",
  "libraryCapacity",
  "hasPublicationSupport",
  "examCount",
  "hasDigitalPlatform",
  "digitalPlatformInfo",
  "coachingRatio",
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
  longDescription: "Uzun açıklama",
  examNavIds: "Kurum türleri (menü)",
  price: "Fiyat metni",
  priceRange: "Fiyat aralığı etiketi",
  minPrice: "Min. fiyat",
  maxPrice: "Maks. fiyat",
  rating: "Puan",
  reviewCount: "Yorum sayısı",
  teacherCount: "Öğretmen sayısı",
  teacherInfo: "Kadro metni",
  programs: "Programlar",
  images: "Görseller",
  weeklyHours: "Haftalık saat",
  totalHours: "Toplam saat",
  oneToOneLessonCount: "Birebir ders sayısı",
  classroomCount: "Derslik sayısı",
  "capacity": "Kontenjan",
  classSize: "Sınıf mevcudu",
  libraryCapacity: "Kütüphane kapasitesi",
  hasPublicationSupport: "Yayın desteği",
  examCount: "Deneme sayısı",
  hasDigitalPlatform: "Dijital platform",
  digitalPlatformInfo: "Dijital platform bilgisi",
  coachingRatio: "Koçluk oranı",
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
