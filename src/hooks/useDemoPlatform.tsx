"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { inviteInstitutionManager } from "@/app/actions/inviteInstitutionManager";
import { advisorQuestionsSeed } from "@/data/advisorQuestionsSeed";
import {
  gradeLevelsSeed,
  heroSlides,
  institutions,
  reviews,
  tags,
  users,
} from "@/data/mockData";
import { DEFAULT_HERO_ROTATING_TITLES } from "@/data/heroRotatingDefaults";
import { INSTITUTION_DEFAULTS, type InstitutionCreateInput } from "@/data/institutionDefaults";
import {
  INSTITUTION_TYPES_SEED,
  labelMapFromInstitutionTypes,
  sortInstitutionTypes,
} from "@/data/institutionTypesSeed";
import {
  buildPendingPayloadFromDraft,
  parsePendingPayloadFromDb,
} from "@/lib/institutionSavePayload";
import { categoryDisplayFromExamNavIds, normalizeExamNavIds } from "@/lib/examMenuNav";
import { instructors as seedInstructors } from "@/data/instructors";
import { createBrowserSupabaseClientOrNull } from "@/lib/supabase/client";
import type { SupabasePublicConfig } from "@/lib/supabase/runtimePublic";
import { syncInstitutionPriceDisplayFields } from "@/lib/discount";
import { longDescriptionFromAboutCards, normalizeAboutCards } from "@/lib/institutionAboutCards";
import { normalizeProgramCards, programsArrayFromProgramCards } from "@/lib/institutionProgramCards";
import {
  INSTITUTION_SELECT_WITH_RELS,
  institutionPartialToRow,
  institutionToInsertRow,
  loadPlatformSnapshot,
  mapInstitutionRow,
  type InstitutionDbRow,
} from "@/lib/supabase/platformData";
import type { AdvisorQuestion } from "@/types/advisor";
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

export type CreateManagerResult =
  | { ok: true; user: User }
  | { ok: false; message: string };

export type CreateInstitutionResult =
  | { ok: true; institution: Institution }
  | { ok: false; message: string };

/** Kurum kaydı / RPC sonucu — çağıranlar başarısızlıkta formu sıfırlamamalı. */
export type PlatformSaveResult = { ok: true } | { ok: false; message: string };

interface DemoContextValue {
  currentUser: User | null;
  users: User[];
  institutions: Institution[];
  /** Sabit kod + admin düzenlenebilir etiket; üst menü ve formlar bunu kullanır. */
  institutionTypes: InstitutionTypeDef[];
  updateInstitutionType: (
    id: string,
    patch: { label?: string; sortOrder?: number },
  ) => void | Promise<void>;
  tags: Tag[];
  gradeLevels: GradeLevel[];
  reviews: Review[];
  heroSlides: HeroSlide[];
  /** Ana sayfa hero ana başlığı: 4 metin (sırayla, 3,5 sn; animasyon yok). */
  heroRotatingTitles: string[];
  saveHeroRotatingTitles: (titles: string[]) => Promise<PlatformSaveResult>;
  instructors: Instructor[];
  /** Supabase verisi yüklenirken true */
  platformLoading: boolean;
  platformError: string | null;
  refreshPlatform: () => Promise<void>;
  login: (email: string, password: string) => UserRole | null;
  logout: () => void;
  addReview: (payload: Omit<Review, "id" | "createdAt" | "status">) => void | Promise<void>;
  updateInstitution: (
    institutionId: string,
    payload: Partial<Institution>,
  ) => PlatformSaveResult | Promise<PlatformSaveResult>;
  createManager: (payload: Omit<User, "id" | "role">) => CreateManagerResult | Promise<CreateManagerResult>;
  createInstitution: (payload: InstitutionCreateInput) => CreateInstitutionResult | Promise<CreateInstitutionResult>;
  createTag: (name: string) => string | null | Promise<string | null>;
  addGradeLevel: (label: string) => void | Promise<void>;
  removeGradeLevel: (id: string) => void | Promise<void>;
  toggleFeatured: (institutionId: string) => void | Promise<void>;
  deleteInstitution: (institutionId: string) => void | Promise<void>;
  updateReviewStatus: (reviewId: string, status: Review["status"]) => void | Promise<void>;
  addHeroSlide: (payload: Omit<HeroSlide, "id">) => PlatformSaveResult | Promise<PlatformSaveResult>;
  updateHeroSlide: (
    slideId: string,
    payload: Omit<HeroSlide, "id">,
  ) => PlatformSaveResult | Promise<PlatformSaveResult>;
  removeHeroSlide: (slideId: string) => void | Promise<void>;
  addInstructor: (institutionId: string, name: string, branch: string) => void | Promise<void>;
  removeInstructor: (instructorId: string) => void | Promise<void>;
  updateInstitutionTags: (institutionId: string, tags: string[]) => PlatformSaveResult | Promise<PlatformSaveResult>;
  submitInstitutionPendingReview: (
    institutionId: string,
    draft: Institution,
  ) => PlatformSaveResult | Promise<PlatformSaveResult>;
  clearInstitutionPending: (institutionId: string) => PlatformSaveResult | Promise<PlatformSaveResult>;
  approveInstitutionPending: (institutionId: string) => PlatformSaveResult | Promise<PlatformSaveResult>;
  setInstitutionListed: (institutionId: string, listed: boolean) => void | Promise<void>;
  staticPages: {
    about: string;
    privacy: string;
    contact: string;
  };
  updateStaticPage: (key: "about" | "privacy" | "contact", content: string) => void | Promise<void>;
  advisorQuestions: AdvisorQuestion[];
  updateAdvisorQuestion: (id: string, prompt: string) => void | Promise<void>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function tagIdFromName(trimmed: string): string {
  return (
    trimmed
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9ığüşöç.\-]+/gi, "")
      .replace(/^-+|-+$/g, "") || `etiket-${Date.now()}`
  );
}

async function replaceInstitutionTags(
  supabase: SupabaseClient,
  institutionId: string,
  tagIds: string[],
): Promise<string | null> {
  const { error: delErr } = await supabase
    .from("institution_tags")
    .delete()
    .eq("institution_id", institutionId);
  if (delErr) return delErr.message;
  if (tagIds.length === 0) return null;
  const { error: insErr } = await supabase
    .from("institution_tags")
    .insert(tagIds.map((tag_id) => ({ institution_id: institutionId, tag_id })));
  return insErr?.message ?? null;
}

async function replaceInstitutionGradeLevels(
  supabase: SupabaseClient,
  institutionId: string,
  gradeLevelIds: string[],
): Promise<string | null> {
  const { error: delErr } = await supabase
    .from("institution_grade_levels")
    .delete()
    .eq("institution_id", institutionId);
  if (delErr) return delErr.message;
  if (gradeLevelIds.length === 0) return null;
  const { error: insErr } = await supabase.from("institution_grade_levels").insert(
    gradeLevelIds.map((grade_level_id) => ({
      institution_id: institutionId,
      grade_level_id,
    })),
  );
  return insErr?.message ?? null;
}

export function DemoPlatformProvider({
  children,
  supabasePublic,
}: {
  children: React.ReactNode;
  /** Sunucu (layout) tarafından iletilir; canlıda build-time env eksik olsa bile DB modu açılır. */
  supabasePublic: SupabasePublicConfig | null;
}) {
  const useRemote = Boolean(supabasePublic);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<User[]>(() => (useRemote ? [] : users));
  const [institutionList, setInstitutionList] = useState<Institution[]>(() =>
    useRemote ? [] : institutions,
  );
  const [tagList, setTagList] = useState<Tag[]>(() => (useRemote ? [] : tags));
  const [gradeLevelList, setGradeLevelList] = useState<GradeLevel[]>(() =>
    useRemote ? [] : gradeLevelsSeed,
  );
  const [reviewList, setReviewList] = useState<Review[]>(() => (useRemote ? [] : reviews));
  const [slideList, setSlideList] = useState<HeroSlide[]>(() => (useRemote ? [] : heroSlides));
  const [heroRotatingTitleList, setHeroRotatingTitleList] = useState<string[]>(() =>
    useRemote ? [] : [...DEFAULT_HERO_ROTATING_TITLES],
  );
  const [instructorList, setInstructorList] = useState<Instructor[]>(() =>
    useRemote ? [] : seedInstructors,
  );
  const [staticPages, setStaticPages] = useState({
    about: "Admin panelinden Admin tarafından düzenlenecektir.",
    privacy: "Admin panelinden Admin tarafından düzenlenecektir.",
    contact: "Admin panelinden Admin tarafından düzenlenecektir.",
  });
  const [advisorQuestionList, setAdvisorQuestionList] = useState<AdvisorQuestion[]>(
    useRemote ? [] : advisorQuestionsSeed,
  );
  const [institutionTypeList, setInstitutionTypeList] = useState<InstitutionTypeDef[]>(() =>
    useRemote ? [] : INSTITUTION_TYPES_SEED,
  );
  const [platformLoading, setPlatformLoading] = useState(useRemote);
  const [platformError, setPlatformError] = useState<string | null>(null);
  /** Ardışık refresh’lerin üst üste binip eski snapshot’ın yeniyi ezmesini önler (kayıt + TOKEN_REFRESHED yarışı). */
  const refreshQueueRef = useRef<Promise<void>>(Promise.resolve());

  const applySnapshot = useCallback((snap: Awaited<ReturnType<typeof loadPlatformSnapshot>>["snapshot"]) => {
    setUserList(snap.users);
    setInstitutionList(snap.institutions);
    setInstitutionTypeList(
      snap.institutionTypes.length > 0 ? snap.institutionTypes : INSTITUTION_TYPES_SEED,
    );
    setTagList(snap.tags);
    setGradeLevelList(snap.gradeLevels);
    setReviewList(snap.reviews);
    setSlideList(snap.heroSlides);
    const h = snap.heroRotatingTitles ?? [];
    setHeroRotatingTitleList([h[0] ?? "", h[1] ?? "", h[2] ?? "", h[3] ?? ""]);
    setInstructorList(snap.instructors);
    setStaticPages(snap.staticPages);
    setAdvisorQuestionList(
      snap.advisorQuestions.length > 0 ? snap.advisorQuestions : advisorQuestionsSeed,
    );
  }, []);

  const refreshPlatform = useCallback(async () => {
    if (!useRemote) return;
    const queued = refreshQueueRef.current.then(async () => {
      const supabase = createBrowserSupabaseClientOrNull();
      if (!supabase) {
        setPlatformLoading(false);
        setPlatformError("Supabase istemcisi oluşturulamadı.");
        return;
      }
      setPlatformLoading(true);
      try {
        const { snapshot, errors } = await loadPlatformSnapshot(supabase);
        applySnapshot(snapshot);
        setPlatformError(errors.length > 0 ? errors.join(" · ") : null);
      } finally {
        setPlatformLoading(false);
      }
    });
    refreshQueueRef.current = queued.catch(() => {});
    await queued;
  }, [applySnapshot, useRemote]);

  useEffect(() => {
    if (!useRemote) {
      setPlatformLoading(false);
      return;
    }
    void refreshPlatform();
  }, [refreshPlatform]);

  useEffect(() => {
    if (!useRemote) return;
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshPlatform();
    });
    return () => subscription.unsubscribe();
  }, [refreshPlatform]);

  const login = (email: string, password: string) => {
    const found = userList.find((u) => u.email === email && (u.password ?? "") === password);
    if (!found) return null;
    setCurrentUser(found);
    return found.role;
  };

  const logout = () => setCurrentUser(null);

  const addReview = async (payload: Omit<Review, "id" | "createdAt" | "status">) => {
    if (!useRemote) {
      const next: Review = {
        ...payload,
        id: `r-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        status: "onay_bekliyor",
      };
      setReviewList((prev) => [next, ...prev]);
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("reviews").insert({
      institution_id: payload.institutionId,
      user_name: payload.userName,
      rating: payload.rating,
      comment: payload.comment,
    });
    if (error) {
      console.error(error);
      return;
    }
    await refreshPlatform();
  };

  const updateInstitution = async (
    institutionId: string,
    payload: Partial<Institution>,
  ): Promise<PlatformSaveResult> => {
    let mergedPayload: Partial<Institution> = { ...payload };
    if (payload.examNavIds !== undefined) {
      const n = normalizeExamNavIds(payload.examNavIds);
      const lm = labelMapFromInstitutionTypes(sortInstitutionTypes(institutionTypeList));
      mergedPayload = {
        ...mergedPayload,
        examNavIds: n,
        category: categoryDisplayFromExamNavIds(n, lm),
      };
    }
    if (payload.minPrice !== undefined || payload.maxPrice !== undefined) {
      const current = institutionList.find((i) => i.id === institutionId);
      if (current) {
        const nm = payload.minPrice ?? current.minPrice;
        const nx = payload.maxPrice ?? current.maxPrice;
        mergedPayload = { ...mergedPayload, ...syncInstitutionPriceDisplayFields(nm, nx) };
      }
    }
    if (payload.aboutCards !== undefined) {
      const cards = normalizeAboutCards(payload.aboutCards);
      mergedPayload = {
        ...mergedPayload,
        aboutCards: cards,
        longDescription: longDescriptionFromAboutCards(cards),
      };
    }
    if (payload.programCards !== undefined) {
      const pc = normalizeProgramCards(payload.programCards);
      mergedPayload = {
        ...mergedPayload,
        programCards: pc,
        programs: programsArrayFromProgramCards(pc),
      };
    }
    if (!useRemote) {
      setInstitutionList((prev) =>
        prev.map((item) => (item.id === institutionId ? { ...item, ...mergedPayload } : item)),
      );
      return { ok: true };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return { ok: false, message: "Bağlantı kurulamadı (Supabase)." };
    const { tags: nextTags, gradeLevelIds: nextGrades, ...rest } = mergedPayload;
    const row = institutionPartialToRow(rest);
    const errors: string[] = [];
    if (Object.keys(row).length > 0) {
      const { data: updatedRows, error } = await supabase
        .from("institutions")
        .update(row)
        .eq("id", institutionId)
        .select("id");
      if (error) errors.push(error.message);
      else if (Array.isArray(updatedRows) && updatedRows.length === 0) {
        errors.push(
          "Kurum güncellenemedi (0 satır). profiles.role=admin ve institutions RLS (institutions_update_admin) kontrol edin.",
        );
      }
    }
    if (nextTags !== undefined) {
      const tagErr = await replaceInstitutionTags(supabase, institutionId, nextTags);
      if (tagErr) errors.push(tagErr);
    }
    if (nextGrades !== undefined) {
      const gErr = await replaceInstitutionGradeLevels(supabase, institutionId, nextGrades);
      if (gErr) errors.push(gErr);
    }
    await refreshPlatform();
    if (errors.length > 0) {
      return { ok: false, message: errors.join(" · ") };
    }
    return { ok: true };
  };

  const createManager = async (
    payload: Omit<User, "id" | "role">,
  ): Promise<CreateManagerResult> => {
    if (!useRemote) {
      const email = payload.email.trim().toLowerCase();
      if (userList.some((u) => u.email.trim().toLowerCase() === email)) {
        return { ok: false, message: "Bu e-posta zaten kayıtlı." };
      }
      const manager: User = {
        ...payload,
        email: payload.email.trim(),
        id: `u-manager-${Date.now()}`,
        role: "institution_manager",
        institutionId: undefined,
      };
      setUserList((prev) => [...prev, manager]);
      return { ok: true, user: manager };
    }
    if (!payload.password?.trim()) {
      return { ok: false, message: "Şifre zorunludur." };
    }
    const res = await inviteInstitutionManager({
      name: payload.name.trim(),
      email: payload.email.trim(),
      password: payload.password,
    });
    if (!res.ok) {
      return { ok: false, message: res.message };
    }
    await refreshPlatform();
    return {
      ok: true,
      user: {
        id: res.userId,
        name: payload.name.trim(),
        email: payload.email.trim(),
        role: "institution_manager",
      },
    };
  };

  const createInstitution = async (
    payload: InstitutionCreateInput,
  ): Promise<CreateInstitutionResult> => {
    const examNavIds = normalizeExamNavIds(payload.examNavIds ?? INSTITUTION_DEFAULTS.examNavIds);
    if (examNavIds.length === 0) {
      return { ok: false, message: "En az bir kurum türü (LGS, YKS, …) seçilmelidir." };
    }
    const typeLabelMap = labelMapFromInstitutionTypes(sortInstitutionTypes(institutionTypeList));
    if (!useRemote) {
      const institution: Institution = {
        ...INSTITUTION_DEFAULTS,
        ...payload,
        examNavIds,
        category: categoryDisplayFromExamNavIds(examNavIds, typeLabelMap),
        id: `inst-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        listed: payload.listed ?? true,
        pendingSubmittedAt: null,
        pendingManagerPayload: null,
      };
      const institutionFinal: Institution = {
        ...institution,
        ...syncInstitutionPriceDisplayFields(institution.minPrice, institution.maxPrice),
      };
      setInstitutionList((prev) => [institutionFinal, ...prev]);
      setUserList((prev) =>
        prev.map((u) =>
          u.id === institutionFinal.ownerUserId ? { ...u, institutionId: institutionFinal.id } : u,
        ),
      );
      return { ok: true, institution: institutionFinal };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) {
      return { ok: false, message: "Supabase bağlantısı yok." };
    }
    const merged: Institution = {
      ...INSTITUTION_DEFAULTS,
      ...payload,
      examNavIds,
      category: categoryDisplayFromExamNavIds(examNavIds, typeLabelMap),
      id: "",
      createdAt: new Date().toISOString().slice(0, 10),
      listed: payload.listed ?? true,
      pendingSubmittedAt: null,
      pendingManagerPayload: null,
    };
    const mergedFinal: Institution = {
      ...merged,
      ...syncInstitutionPriceDisplayFields(merged.minPrice, merged.maxPrice),
    };
    const insertPayload = institutionToInsertRow(mergedFinal);
    delete (insertPayload as { id?: string }).id;
    const { data, error } = await supabase
      .from("institutions")
      .insert(insertPayload)
      .select(INSTITUTION_SELECT_WITH_RELS)
      .single();
    if (error || !data) {
      console.error(error);
      return { ok: false, message: error?.message ?? "Kurum kaydı oluşturulamadı." };
    }
    const row = data as InstitutionDbRow;
    const institutionId = row.id;
    const tagErr = await replaceInstitutionTags(supabase, institutionId, mergedFinal.tags);
    const gErr = await replaceInstitutionGradeLevels(supabase, institutionId, mergedFinal.gradeLevelIds);
    if (tagErr || gErr) {
      await refreshPlatform();
      return {
        ok: false,
        message: [tagErr, gErr].filter(Boolean).join(" · "),
      };
    }
    await supabase
      .from("profiles")
      .update({ institution_id: institutionId })
      .eq("id", payload.ownerUserId);
    const { data: typeRows } = await supabase
      .from("institution_types")
      .select("id, label, sort_order")
      .order("sort_order", { ascending: true });
    const defs =
      typeRows && typeRows.length > 0
        ? sortInstitutionTypes(
            typeRows.map((r) => ({
              id: r.id,
              label: r.label,
              sortOrder: Number(r.sort_order) || 0,
            })),
          )
        : INSTITUTION_TYPES_SEED;
    const lm = labelMapFromInstitutionTypes(defs);
    await refreshPlatform();
    return { ok: true, institution: mapInstitutionRow(row, lm) };
  };

  const createTag = async (name: string): Promise<string | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const id = tagIdFromName(trimmed);
    if (!useRemote) {
      let created: string | null = null;
      setTagList((prev) => {
        if (prev.some((t) => t.id === id || t.name.toLowerCase() === trimmed.toLowerCase())) {
          return prev;
        }
        created = id;
        return [...prev, { id, name: trimmed }];
      });
      return created;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return null;
    const { error } = await supabase.from("tags").insert({ id, name: trimmed });
    if (error) {
      if (error.code === "23505") {
        const { data: existing } = await supabase.from("tags").select("id").eq("id", id).maybeSingle();
        return existing?.id ?? id;
      }
      console.error(error);
      return null;
    }
    await refreshPlatform();
    return id;
  };

  const addGradeLevel = async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = `g-${Date.now()}`;
    if (!useRemote) {
      setGradeLevelList((prev) => [...prev, { id, label: trimmed }]);
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("grade_levels").insert({ id, label: trimmed });
    if (error) {
      console.error(error);
      return;
    }
    await refreshPlatform();
  };

  const removeGradeLevel = async (gradeId: string) => {
    if (!useRemote) {
      setGradeLevelList((prev) => prev.filter((g) => g.id !== gradeId));
      setInstitutionList((prev) =>
        prev.map((inst) => ({
          ...inst,
          gradeLevelIds: inst.gradeLevelIds.filter((gid) => gid !== gradeId),
        })),
      );
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("grade_levels").delete().eq("id", gradeId);
    if (error) console.error(error);
    await refreshPlatform();
  };

  const toggleFeatured = async (institutionId: string) => {
    if (!useRemote) {
      setInstitutionList((prev) =>
        prev.map((item) =>
          item.id === institutionId ? { ...item, featured: !item.featured } : item,
        ),
      );
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { data: cur, error: rErr } = await supabase
      .from("institutions")
      .select("featured")
      .eq("id", institutionId)
      .maybeSingle();
    if (rErr || cur == null) {
      console.error(rErr);
      return;
    }
    const { error } = await supabase
      .from("institutions")
      .update({ featured: !cur.featured })
      .eq("id", institutionId);
    if (error) console.error(error);
    await refreshPlatform();
  };

  const deleteInstitution = async (institutionId: string) => {
    if (!useRemote) {
      let ownerUserId: string | undefined;
      setInstitutionList((prev) => {
        const inst = prev.find((i) => i.id === institutionId);
        ownerUserId = inst?.ownerUserId;
        return prev.filter((item) => item.id !== institutionId);
      });
      setUserList((prev) =>
        prev.map((item) => {
          if (ownerUserId && item.id === ownerUserId) {
            return { ...item, institutionId: undefined };
          }
          if (item.institutionId === institutionId) {
            return { ...item, institutionId: undefined };
          }
          return item;
        }),
      );
      setReviewList((prev) => prev.filter((item) => item.institutionId !== institutionId));
      setInstructorList((prev) => prev.filter((item) => item.institutionId !== institutionId));
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("institutions").delete().eq("id", institutionId);
    if (error) console.error(error);
    await refreshPlatform();
  };

  const updateReviewStatus = async (reviewId: string, status: Review["status"]) => {
    if (!useRemote) {
      setReviewList((prev) =>
        prev.map((item) => (item.id === reviewId ? { ...item, status } : item)),
      );
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);
    if (error) console.error(error);
    await refreshPlatform();
  };

  const addHeroSlide = async (slidePayload: Omit<HeroSlide, "id">): Promise<PlatformSaveResult> => {
    if (!useRemote) {
      setSlideList((prev) => [{ ...slidePayload, id: `h-${Date.now()}` }, ...prev]);
      return { ok: true };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return { ok: false, message: "Bağlantı kurulamadı (Supabase)." };
    const { data: maxRow } = await supabase
      .from("hero_slides")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const sortOrder = (maxRow?.sort_order ?? -1) + 1;
    const { error } = await supabase.from("hero_slides").insert({
      title: slidePayload.title,
      subtitle: slidePayload.subtitle,
      image: slidePayload.image,
      sort_order: sortOrder,
    });
    if (error) {
      console.error(error);
      return { ok: false, message: error.message };
    }
    await refreshPlatform();
    return { ok: true };
  };

  const updateHeroSlide = async (
    slideId: string,
    payload: Omit<HeroSlide, "id">,
  ): Promise<PlatformSaveResult> => {
    if (!useRemote) {
      setSlideList((prev) =>
        prev.map((s) => (s.id === slideId ? { ...s, ...payload } : s)),
      );
      return { ok: true };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return { ok: false, message: "Bağlantı kurulamadı (Supabase)." };
    const { error } = await supabase
      .from("hero_slides")
      .update({
        title: payload.title,
        subtitle: payload.subtitle,
        image: payload.image,
      })
      .eq("id", slideId);
    if (error) {
      console.error(error);
      return { ok: false, message: error.message };
    }
    await refreshPlatform();
    return { ok: true };
  };

  const removeHeroSlide = async (slideId: string) => {
    if (!useRemote) {
      setSlideList((prev) => prev.filter((item) => item.id !== slideId));
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("hero_slides").delete().eq("id", slideId);
    if (error) console.error(error);
    await refreshPlatform();
  };

  const addInstructor = async (institutionId: string, name: string, branch: string) => {
    if (!useRemote) {
      const newInstructor: Instructor = {
        id: `ins-${Date.now()}`,
        institutionId,
        name,
        branch,
      };
      setInstructorList((prev) => [...prev, newInstructor]);
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("instructors").insert({
      institution_id: institutionId,
      name,
      branch,
    });
    if (error) {
      console.error(error);
      return;
    }
    await refreshPlatform();
  };

  const removeInstructor = async (instructorId: string) => {
    if (!useRemote) {
      const target = instructorList.find((item) => item.id === instructorId);
      if (!target) return;
      setInstructorList((prev) => prev.filter((item) => item.id !== instructorId));
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("instructors").delete().eq("id", instructorId);
    if (error) {
      console.error(error);
      return;
    }
    await refreshPlatform();
  };

  const updateInstitutionTags = async (
    institutionId: string,
    nextTags: string[],
  ): Promise<PlatformSaveResult> => {
    if (!useRemote) {
      setInstitutionList((prev) =>
        prev.map((item) => (item.id === institutionId ? { ...item, tags: nextTags } : item)),
      );
      return { ok: true };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return { ok: false, message: "Bağlantı kurulamadı (Supabase)." };
    const tagErr = await replaceInstitutionTags(supabase, institutionId, nextTags);
    await refreshPlatform();
    if (tagErr) return { ok: false, message: tagErr };
    return { ok: true };
  };

  const submitInstitutionPendingReview = async (
    institutionId: string,
    draft: Institution,
  ): Promise<PlatformSaveResult> => {
    const payload = buildPendingPayloadFromDraft(draft);
    if (!useRemote) {
      setInstitutionList((prev) =>
        prev.map((i) =>
          i.id === institutionId
            ? {
                ...i,
                pendingSubmittedAt: new Date().toISOString(),
                pendingManagerPayload: payload,
              }
            : i,
        ),
      );
      return { ok: true };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return { ok: false, message: "Bağlantı kurulamadı (Supabase)." };
    const { error } = await supabase.rpc("submit_institution_pending_changes", {
      p_institution_id: institutionId,
      p_payload: payload,
    });
    await refreshPlatform();
    if (error) {
      console.error(error);
      return {
        ok: false,
        message:
          error.message ||
          "Onay talebi gönderilemedi. Veritabanında migration (submit_institution_pending_changes) ve yetkiler kontrol edin.",
      };
    }
    return { ok: true };
  };

  const clearInstitutionPending = async (institutionId: string): Promise<PlatformSaveResult> => {
    if (!useRemote) {
      setInstitutionList((prev) =>
        prev.map((i) =>
          i.id === institutionId
            ? { ...i, pendingSubmittedAt: null, pendingManagerPayload: null }
            : i,
        ),
      );
      return { ok: true };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return { ok: false, message: "Bağlantı kurulamadı (Supabase)." };
    const { error } = await supabase.rpc("clear_institution_pending", {
      p_institution_id: institutionId,
    });
    await refreshPlatform();
    if (error) {
      console.error(error);
      return {
        ok: false,
        message: error.message || "Taslak silinemedi (yalnızca admin RPC: clear_institution_pending).",
      };
    }
    return { ok: true };
  };

  const approveInstitutionPending = async (institutionId: string): Promise<PlatformSaveResult> => {
    if (!useRemote) {
      setInstitutionList((prev) => {
        const inst = prev.find((i) => i.id === institutionId);
        if (!inst?.pendingManagerPayload) return prev;
        const { body, tags } = inst.pendingManagerPayload;
        return prev.map((i) =>
          i.id === institutionId
            ? {
                ...i,
                ...body,
                tags,
                gradeLevelIds: body.gradeLevelIds ?? i.gradeLevelIds,
                pendingSubmittedAt: null,
                pendingManagerPayload: null,
              }
            : i,
        );
      });
      return { ok: true };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return { ok: false, message: "Bağlantı kurulamadı (Supabase)." };
    const { data: row, error: fetchErr } = await supabase
      .from("institutions")
      .select("pending_manager_payload")
      .eq("id", institutionId)
      .maybeSingle();
    if (fetchErr) {
      console.error(fetchErr);
      return { ok: false, message: fetchErr.message };
    }
    if (!row) {
      return { ok: false, message: "Kurum veya onay verisi bulunamadı." };
    }
    const pending = parsePendingPayloadFromDb(row.pending_manager_payload);
    if (!pending) {
      return {
        ok: false,
        message:
          "Onay verisi okunamadı (pending_manager_payload: body veya tags JSON formatı). Sayfayı yenileyip tekrar deneyin.",
      };
    }
    const u1 = await updateInstitution(institutionId, {
      ...pending.body,
      gradeLevelIds: pending.body.gradeLevelIds,
    });
    if (!u1.ok) return u1;
    const u2 = await updateInstitutionTags(institutionId, pending.tags);
    if (!u2.ok) return u2;
    return clearInstitutionPending(institutionId);
  };

  const setInstitutionListed = async (institutionId: string, listed: boolean) => {
    const r = await updateInstitution(institutionId, { listed });
    if (!r.ok) console.error(r.message);
  };

  const updateStaticPage = async (key: "about" | "privacy" | "contact", content: string) => {
    if (!useRemote) {
      setStaticPages((prev) => ({ ...prev, [key]: content }));
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("static_pages").update({ body: content }).eq("slug", key);
    if (error) console.error(error);
    await refreshPlatform();
  };

  const updateInstitutionType = async (id: string, patch: { label?: string; sortOrder?: number }) => {
    if (!useRemote) {
      const next = sortInstitutionTypes(
        institutionTypeList.map((t) =>
          t.id === id
            ? {
                ...t,
                label:
                  patch.label !== undefined ? (patch.label.trim() || t.label) : t.label,
                sortOrder:
                  patch.sortOrder !== undefined ? Math.round(patch.sortOrder) : t.sortOrder,
              }
            : t,
        ),
      );
      const lm = labelMapFromInstitutionTypes(next);
      setInstitutionTypeList(next);
      setInstitutionList((list) =>
        list.map((i) => ({
          ...i,
          category: categoryDisplayFromExamNavIds(i.examNavIds, lm),
        })),
      );
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const updates: Record<string, unknown> = {};
    if (patch.label !== undefined) updates.label = patch.label.trim();
    if (patch.sortOrder !== undefined) updates.sort_order = Math.round(patch.sortOrder);
    if (Object.keys(updates).length === 0) return;
    const { error } = await supabase.from("institution_types").update(updates).eq("id", id);
    if (error) console.error(error);
    await refreshPlatform();
  };

  const saveHeroRotatingTitles = useCallback(
    async (titles: string[]): Promise<PlatformSaveResult> => {
      const four = [0, 1, 2, 3].map((i) => (typeof titles[i] === "string" ? titles[i] : ""));
      if (!useRemote) {
        setHeroRotatingTitleList([...four]);
        return { ok: true };
      }
      const supabase = createBrowserSupabaseClientOrNull();
      if (!supabase) return { ok: false, message: "Bağlantı kurulamadı (Supabase)." };
      const rows = four.map((title, idx) => ({ slot: idx + 1, title }));
      const { error } = await supabase.from("hero_rotating_titles").upsert(rows, { onConflict: "slot" });
      if (error) {
        console.error(error);
        return { ok: false, message: error.message };
      }
      await refreshPlatform();
      return { ok: true };
    },
    [useRemote, refreshPlatform],
  );

  const updateAdvisorQuestion = async (id: string, prompt: string) => {
    const next = prompt.trim();
    if (!useRemote) {
      setAdvisorQuestionList((prev) =>
        prev.map((q) => (q.id === id ? { ...q, prompt: next || q.prompt } : q)),
      );
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { error } = await supabase.from("advisor_questions").update({ prompt: next }).eq("id", id);
    if (error) console.error(error);
    await refreshPlatform();
  };

  const value: DemoContextValue = {
    currentUser,
    users: userList,
    institutions: institutionList,
    institutionTypes: institutionTypeList,
    updateInstitutionType,
    tags: tagList,
    gradeLevels: gradeLevelList,
    reviews: reviewList,
    heroSlides: slideList,
    heroRotatingTitles: heroRotatingTitleList,
    saveHeroRotatingTitles,
    instructors: instructorList,
    platformLoading,
    platformError,
    refreshPlatform,
    login,
    logout,
    addReview,
    updateInstitution,
    createManager,
    createInstitution,
    createTag,
    addGradeLevel,
    removeGradeLevel,
    toggleFeatured,
    deleteInstitution,
    updateReviewStatus,
    addHeroSlide,
    updateHeroSlide,
    removeHeroSlide,
    addInstructor,
    removeInstructor,
    updateInstitutionTags,
    submitInstitutionPendingReview,
    clearInstitutionPending,
    approveInstitutionPending,
    setInstitutionListed,
    staticPages,
    updateStaticPage,
    advisorQuestions: advisorQuestionList,
    updateAdvisorQuestion,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoPlatform() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoPlatform DemoPlatformProvider içinde kullanılmalıdır.");
  return context;
}
