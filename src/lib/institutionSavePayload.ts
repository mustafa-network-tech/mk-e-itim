import type { Institution, InstitutionManagerPendingPayload } from "@/types";

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

export function parsePendingPayloadFromDb(raw: unknown): InstitutionManagerPendingPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!o.body || typeof o.body !== "object") return null;
  const tags = o.tags;
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) return null;
  return { body: o.body as Partial<Institution>, tags: tags as string[] };
}
