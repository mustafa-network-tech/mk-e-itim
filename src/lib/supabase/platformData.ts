import type { SupabaseClient } from "@supabase/supabase-js";

/** Tek kurum + junction satırları (PostgREST select) */
export const INSTITUTION_SELECT_WITH_RELS = `
  *,
  institution_tags ( tag_id ),
  institution_grade_levels ( grade_level_id )
`;
import {
  categoryDisplayFromExamNavIds,
  legacyCategoryToExamNavIds,
  normalizeExamNavIds,
} from "@/lib/examMenuNav";
import type { AdvisorQuestion } from "@/types/advisor";
import {
  INSTITUTION_TYPES_SEED,
  labelMapFromInstitutionTypes,
  sortInstitutionTypes,
} from "@/data/institutionTypesSeed";
import { aboutCardsFromDbRow } from "@/lib/institutionAboutCards";
import { normalizeInstitutionSegment } from "@/lib/institutions";
import { programCardsFromDbRow, programsArrayFromProgramCards } from "@/lib/institutionProgramCards";
import { parsePendingPayloadFromDb } from "@/lib/institutionSavePayload";
import type {
  GradeLevel,
  HeroSlide,
  Institution,
  InstitutionTypeDef,
  Instructor,
  Review,
  Tag,
  User,
  UserRole,
} from "@/types";

/** PostgREST kurum satırı + ilişkiler */
export type InstitutionDbRow = {
  id: string;
  name: string;
  official_status: string;
  category: string;
  exam_nav_ids?: string[] | null;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  phone: string;
  website: string;
  whatsapp: string;
  short_description: string;
  long_description: string;
  price: string;
  price_range: string;
  min_price: number;
  max_price: number;
  rating: number;
  review_count: number;
  programs: string[] | null;
  images: string[] | null;
  featured: boolean;
  top_visible: boolean;
  listed: boolean;
  created_at: string;
  owner_user_id: string;
  discount_active: boolean;
  discount_percent: number;
  discount_text: string;
  discount_start_date: string | null;
  discount_end_date: string | null;
  pending_manager_payload?: unknown | null;
  pending_submitted_at?: string | null;
  institution_segment?: string | null;
  about_cards?: unknown;
  about_institution?: string | null;
  program_cards?: unknown;
  institution_tags?: { tag_id: string }[] | null;
  institution_grade_levels?: { grade_level_id: string }[] | null;
};

export function mapInstitutionRow(
  row: InstitutionDbRow,
  typeLabelMap: Record<string, string>,
): Institution {
  const tags = (row.institution_tags ?? []).map((t) => t.tag_id);
  const gradeLevelIds = (row.institution_grade_levels ?? []).map((g) => g.grade_level_id);
  const fromDb = row.exam_nav_ids;
  const examNavIds =
    fromDb && fromDb.length > 0
      ? normalizeExamNavIds(fromDb)
      : legacyCategoryToExamNavIds(row.category ?? "");
  const category = categoryDisplayFromExamNavIds(examNavIds, typeLabelMap);
  const aboutCards = aboutCardsFromDbRow(row.about_cards, row.long_description ?? "");
  const programCards = programCardsFromDbRow(row.program_cards, row.programs ?? []);
  const programs = programsArrayFromProgramCards(programCards);
  return {
    id: row.id,
    institutionSegment: normalizeInstitutionSegment(row.institution_segment),
    name: row.name,
    officialStatus: row.official_status ?? "",
    category,
    examNavIds,
    city: row.city,
    district: row.district,
    neighborhood: row.neighborhood,
    address: row.address,
    phone: row.phone,
    website: row.website,
    whatsapp: row.whatsapp,
    shortDescription: row.short_description,
    longDescription: row.long_description ?? "",
    aboutCards,
    aboutInstitution: row.about_institution ?? "",
    programCards,
    programs,
    price: row.price,
    priceRange: row.price_range,
    minPrice: row.min_price,
    maxPrice: row.max_price,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    tags,
    images: row.images ?? [],
    featured: row.featured,
    topVisible: row.top_visible,
    createdAt: typeof row.created_at === "string" ? row.created_at.slice(0, 10) : String(row.created_at),
    ownerUserId: row.owner_user_id,
    gradeLevelIds,
    discountActive: row.discount_active,
    discountPercent: row.discount_percent,
    discountText: row.discount_text,
    discountStartDate: row.discount_start_date ?? "",
    discountEndDate: row.discount_end_date ?? "",
    listed: row.listed ?? true,
    pendingSubmittedAt: row.pending_submitted_at ?? null,
    pendingManagerPayload: parsePendingPayloadFromDb(row.pending_manager_payload ?? null),
  };
}

/** `hero_rotating_titles` satırları → her zaman 4 elemanlı dizi (slot 1–4). */
export function heroRotatingTitlesFromRows(
  rows: { slot: number; title: string }[] | null | undefined,
): string[] {
  const out: string[] = ["", "", "", ""];
  for (const r of rows ?? []) {
    const s = Number(r.slot);
    if (s >= 1 && s <= 4 && typeof r.title === "string") {
      out[s - 1] = r.title;
    }
  }
  return out;
}

export function institutionToInsertRow(
  i: Omit<Institution, "id" | "tags" | "gradeLevelIds"> & { id?: string },
): Record<string, unknown> {
  return {
    ...(i.id ? { id: i.id } : {}),
    name: i.name,
    institution_segment: normalizeInstitutionSegment(i.institutionSegment ?? "education"),
    category: i.category,
    exam_nav_ids: normalizeExamNavIds(i.examNavIds),
    city: i.city,
    district: i.district,
    neighborhood: i.neighborhood,
    address: i.address,
    phone: i.phone,
    website: i.website,
    whatsapp: i.whatsapp,
    short_description: i.shortDescription,
    long_description: i.longDescription,
    about_cards: i.aboutCards,
    about_institution: i.aboutInstitution,
    program_cards: i.programCards,
    price: i.price,
    price_range: i.priceRange,
    min_price: i.minPrice,
    max_price: i.maxPrice,
    rating: i.rating,
    review_count: i.reviewCount,
    programs: i.programs,
    images: i.images,
    featured: i.featured,
    top_visible: i.topVisible ?? true,
    listed: i.listed ?? true,
    created_at: i.createdAt,
    owner_user_id: i.ownerUserId,
    discount_active: i.discountActive,
    discount_percent: i.discountPercent,
    discount_text: i.discountText,
    discount_start_date: i.discountStartDate || null,
    discount_end_date: i.discountEndDate || null,
  };
}

export function institutionPartialToRow(patch: Partial<Institution>): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  const map: [keyof Institution, string][] = [
    ["name", "name"],
    ["institutionSegment", "institution_segment"],
    ["officialStatus", "official_status"],
    ["category", "category"],
    ["city", "city"],
    ["district", "district"],
    ["neighborhood", "neighborhood"],
    ["address", "address"],
    ["phone", "phone"],
    ["website", "website"],
    ["whatsapp", "whatsapp"],
    ["shortDescription", "short_description"],
    ["longDescription", "long_description"],
    ["aboutCards", "about_cards"],
    ["aboutInstitution", "about_institution"],
    ["programCards", "program_cards"],
    ["price", "price"],
    ["priceRange", "price_range"],
    ["minPrice", "min_price"],
    ["maxPrice", "max_price"],
    ["rating", "rating"],
    ["reviewCount", "review_count"],
    ["programs", "programs"],
    ["images", "images"],
    ["featured", "featured"],
    ["topVisible", "top_visible"],
    ["listed", "listed"],
    ["ownerUserId", "owner_user_id"],
    ["discountActive", "discount_active"],
    ["discountPercent", "discount_percent"],
    ["discountText", "discount_text"],
    ["discountStartDate", "discount_start_date"],
    ["discountEndDate", "discount_end_date"],
  ];
  for (const [k, col] of map) {
    if (k in patch && patch[k] !== undefined) {
      let v: unknown = patch[k];
      if (col === "institution_segment") {
        v = normalizeInstitutionSegment(v);
      }
      if (col === "discount_start_date" || col === "discount_end_date") {
        v = (v as string) || null;
      }
      o[col] = v;
    }
  }
  if (patch.examNavIds !== undefined) {
    o.exam_nav_ids = normalizeExamNavIds(patch.examNavIds);
  }
  return o;
}

export type PlatformSnapshot = {
  users: User[];
  institutions: Institution[];
  institutionTypes: InstitutionTypeDef[];
  tags: Tag[];
  gradeLevels: GradeLevel[];
  reviews: Review[];
  heroSlides: HeroSlide[];
  instructors: Instructor[];
  staticPages: { about: string; privacy: string; contact: string };
  advisorQuestions: AdvisorQuestion[];
  /** Ana sayfa hero ana başlığı: 4 metin (slot sırası). */
  heroRotatingTitles: string[];
};

export async function loadPlatformSnapshot(supabase: SupabaseClient): Promise<{
  snapshot: PlatformSnapshot;
  errors: string[];
}> {
  const errors: string[] = [];

  const [
    instRes,
    instTypesRes,
    tagsRes,
    gradesRes,
    reviewsRes,
    slidesRes,
    instrRes,
    staticRes,
    advisorRes,
    heroRotatingRes,
    profilesRes,
  ] = await Promise.all([
    supabase
      .from("institutions")
      .select(INSTITUTION_SELECT_WITH_RELS)
      .order("created_at", { ascending: false }),
    supabase.from("institution_types").select("id, label, sort_order").order("sort_order", { ascending: true }),
    supabase.from("tags").select("id, name, category").order("name"),
    supabase.from("grade_levels").select("id, label").order("label"),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    supabase.from("hero_slides").select("*").order("sort_order", { ascending: true }),
    supabase.from("instructors").select("*"),
    supabase.from("static_pages").select("slug, body"),
    supabase.from("advisor_questions").select("*").order("sort_order", { ascending: true }),
    supabase.from("hero_rotating_titles").select("slot, title").order("slot", { ascending: true }),
    supabase.from("profiles").select("id, full_name, role, institution_id").order("full_name"),
  ]);

  if (instRes.error) errors.push(instRes.error.message);
  if (instTypesRes.error) errors.push(instTypesRes.error.message);
  if (tagsRes.error) errors.push(tagsRes.error.message);
  if (gradesRes.error) errors.push(gradesRes.error.message);
  if (reviewsRes.error) errors.push(reviewsRes.error.message);
  if (slidesRes.error) errors.push(slidesRes.error.message);
  if (instrRes.error) errors.push(instrRes.error.message);
  if (staticRes.error) errors.push(staticRes.error.message);
  if (advisorRes.error) errors.push(advisorRes.error.message);
  if (heroRotatingRes.error) errors.push(heroRotatingRes.error.message);
  if (profilesRes.error) {
    /* Anon veya profiles yetkisi yoksa boş liste */
  }

  let institutionTypes: InstitutionTypeDef[] = (instTypesRes.data ?? []).map((r) => ({
    id: r.id,
    label: r.label,
    sortOrder: Number(r.sort_order) || 0,
  }));
  if (institutionTypes.length === 0) {
    institutionTypes = [...INSTITUTION_TYPES_SEED];
  } else {
    institutionTypes = sortInstitutionTypes(institutionTypes);
  }
  const typeLabelMap = labelMapFromInstitutionTypes(institutionTypes);

  const institutions = (instRes.data ?? []).map((r) =>
    mapInstitutionRow(r as InstitutionDbRow, typeLabelMap),
  );

  const tags: Tag[] = (tagsRes.data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category ?? undefined,
  }));

  const gradeLevels: GradeLevel[] = (gradesRes.data ?? []).map((g) => ({
    id: g.id,
    label: g.label,
  }));

  const reviews: Review[] = (reviewsRes.data ?? []).map((r) => ({
    id: r.id,
    institutionId: r.institution_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at?.slice?.(0, 10) ?? "",
    status: r.status as Review["status"],
  }));

  const heroSlides: HeroSlide[] = (slidesRes.data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    image: s.image,
  }));

  const instructors: Instructor[] = (instrRes.data ?? []).map((r) => ({
    id: r.id,
    institutionId: r.institution_id,
    name: r.name,
    branch: r.branch,
  }));

  const staticPages = { about: "", privacy: "", contact: "" };
  for (const row of staticRes.data ?? []) {
    if (row.slug === "about") staticPages.about = row.body;
    if (row.slug === "privacy") staticPages.privacy = row.body;
    if (row.slug === "contact") staticPages.contact = row.body;
  }

  const advisorQuestions: AdvisorQuestion[] = (advisorRes.data ?? []).map((q) => ({
    id: q.id,
    order: q.sort_order,
    stepKey: q.step_key as AdvisorQuestion["stepKey"],
    prompt: q.prompt,
  }));

  const users: User[] = (profilesRes.data ?? []).map((p) => ({
    id: p.id,
    role: p.role as UserRole,
    name: p.full_name?.trim() || "Kullanıcı",
    email: "",
    institutionId: p.institution_id ?? undefined,
  }));

  const heroRotatingTitles = heroRotatingTitlesFromRows(
    heroRotatingRes.data as { slot: number; title: string }[] | null,
  );

  return {
    snapshot: {
      users,
      institutions,
      institutionTypes,
      tags,
      gradeLevels,
      reviews,
      heroSlides,
      instructors,
      staticPages,
      advisorQuestions,
      heroRotatingTitles,
    },
    errors,
  };
}
