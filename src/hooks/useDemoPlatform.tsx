"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
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
import { INSTITUTION_DEFAULTS, type InstitutionCreateInput } from "@/data/institutionDefaults";
import { instructors as seedInstructors } from "@/data/instructors";
import { createBrowserSupabaseClientOrNull } from "@/lib/supabase/client";
import type { SupabasePublicConfig } from "@/lib/supabase/runtimePublic";
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

interface DemoContextValue {
  currentUser: User | null;
  users: User[];
  institutions: Institution[];
  tags: Tag[];
  gradeLevels: GradeLevel[];
  reviews: Review[];
  heroSlides: HeroSlide[];
  instructors: Instructor[];
  /** Supabase verisi yüklenirken true */
  platformLoading: boolean;
  platformError: string | null;
  refreshPlatform: () => Promise<void>;
  login: (email: string, password: string) => UserRole | null;
  logout: () => void;
  addReview: (payload: Omit<Review, "id" | "createdAt" | "status">) => void | Promise<void>;
  updateInstitution: (institutionId: string, payload: Partial<Institution>) => void | Promise<void>;
  createManager: (payload: Omit<User, "id" | "role">) => CreateManagerResult | Promise<CreateManagerResult>;
  createInstitution: (payload: InstitutionCreateInput) => CreateInstitutionResult | Promise<CreateInstitutionResult>;
  createTag: (name: string) => string | null | Promise<string | null>;
  addGradeLevel: (label: string) => void | Promise<void>;
  removeGradeLevel: (id: string) => void | Promise<void>;
  toggleFeatured: (institutionId: string) => void | Promise<void>;
  deleteInstitution: (institutionId: string) => void | Promise<void>;
  updateReviewStatus: (reviewId: string, status: Review["status"]) => void | Promise<void>;
  addHeroSlide: (payload: Omit<HeroSlide, "id">) => void | Promise<void>;
  removeHeroSlide: (slideId: string) => void | Promise<void>;
  addInstructor: (institutionId: string, name: string, branch: string) => void | Promise<void>;
  removeInstructor: (instructorId: string) => void | Promise<void>;
  updateInstitutionTags: (institutionId: string, tags: string[]) => void | Promise<void>;
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
) {
  await supabase.from("institution_tags").delete().eq("institution_id", institutionId);
  if (tagIds.length === 0) return;
  await supabase
    .from("institution_tags")
    .insert(tagIds.map((tag_id) => ({ institution_id: institutionId, tag_id })));
}

async function replaceInstitutionGradeLevels(
  supabase: SupabaseClient,
  institutionId: string,
  gradeLevelIds: string[],
) {
  await supabase.from("institution_grade_levels").delete().eq("institution_id", institutionId);
  if (gradeLevelIds.length === 0) return;
  await supabase.from("institution_grade_levels").insert(
    gradeLevelIds.map((grade_level_id) => ({
      institution_id: institutionId,
      grade_level_id,
    })),
  );
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
  const [platformLoading, setPlatformLoading] = useState(useRemote);
  const [platformError, setPlatformError] = useState<string | null>(null);

  const applySnapshot = useCallback((snap: Awaited<ReturnType<typeof loadPlatformSnapshot>>["snapshot"]) => {
    setUserList(snap.users);
    setInstitutionList(snap.institutions);
    setTagList(snap.tags);
    setGradeLevelList(snap.gradeLevels);
    setReviewList(snap.reviews);
    setSlideList(snap.heroSlides);
    setInstructorList(snap.instructors);
    setStaticPages(snap.staticPages);
    setAdvisorQuestionList(
      snap.advisorQuestions.length > 0 ? snap.advisorQuestions : advisorQuestionsSeed,
    );
  }, []);

  const refreshPlatform = useCallback(async () => {
    if (!useRemote) return;
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) {
      setPlatformLoading(false);
      setPlatformError("Supabase istemcisi oluşturulamadı.");
      return;
    }
    setPlatformLoading(true);
    const { snapshot, errors } = await loadPlatformSnapshot(supabase);
    applySnapshot(snapshot);
    setPlatformError(errors.length > 0 ? errors.join(" · ") : null);
    setPlatformLoading(false);
  }, [applySnapshot]);

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

  const updateInstitution = async (institutionId: string, payload: Partial<Institution>) => {
    if (!useRemote) {
      setInstitutionList((prev) =>
        prev.map((item) => (item.id === institutionId ? { ...item, ...payload } : item)),
      );
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { tags: nextTags, gradeLevelIds: nextGrades, ...rest } = payload;
    const row = institutionPartialToRow(rest);
    if (Object.keys(row).length > 0) {
      const { error } = await supabase.from("institutions").update(row).eq("id", institutionId);
      if (error) console.error(error);
    }
    if (nextTags !== undefined) {
      await replaceInstitutionTags(supabase, institutionId, nextTags);
    }
    if (nextGrades !== undefined) {
      await replaceInstitutionGradeLevels(supabase, institutionId, nextGrades);
    }
    await refreshPlatform();
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
    if (!useRemote) {
      const institution: Institution = {
        ...INSTITUTION_DEFAULTS,
        ...payload,
        id: `inst-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setInstitutionList((prev) => [institution, ...prev]);
      setUserList((prev) =>
        prev.map((u) =>
          u.id === institution.ownerUserId ? { ...u, institutionId: institution.id } : u,
        ),
      );
      return { ok: true, institution };
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) {
      return { ok: false, message: "Supabase bağlantısı yok." };
    }
    const merged: Institution = {
      ...INSTITUTION_DEFAULTS,
      ...payload,
      id: "",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const insertPayload = institutionToInsertRow(merged);
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
    await replaceInstitutionTags(supabase, institutionId, merged.tags);
    await replaceInstitutionGradeLevels(supabase, institutionId, merged.gradeLevelIds);
    await supabase
      .from("profiles")
      .update({ institution_id: institutionId })
      .eq("id", payload.ownerUserId);
    await refreshPlatform();
    return { ok: true, institution: mapInstitutionRow(row) };
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

  const addHeroSlide = async (slidePayload: Omit<HeroSlide, "id">) => {
    if (!useRemote) {
      setSlideList((prev) => [{ ...slidePayload, id: `h-${Date.now()}` }, ...prev]);
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
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
    if (error) console.error(error);
    await refreshPlatform();
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
      setInstitutionList((prev) =>
        prev.map((item) =>
          item.id === institutionId ? { ...item, teacherCount: item.teacherCount + 1 } : item,
        ),
      );
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
    const { count } = await supabase
      .from("instructors")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", institutionId);
    await supabase
      .from("institutions")
      .update({ teacher_count: count ?? 0 })
      .eq("id", institutionId);
    await refreshPlatform();
  };

  const removeInstructor = async (instructorId: string) => {
    if (!useRemote) {
      const target = instructorList.find((item) => item.id === instructorId);
      if (!target) return;
      setInstructorList((prev) => prev.filter((item) => item.id !== instructorId));
      setInstitutionList((prev) =>
        prev.map((item) =>
          item.id === target.institutionId
            ? { ...item, teacherCount: Math.max(item.teacherCount - 1, 0) }
            : item,
        ),
      );
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const { data: row } = await supabase
      .from("instructors")
      .select("institution_id")
      .eq("id", instructorId)
      .maybeSingle();
    const { error } = await supabase.from("instructors").delete().eq("id", instructorId);
    if (error) {
      console.error(error);
      return;
    }
    if (row?.institution_id) {
      const { count } = await supabase
        .from("instructors")
        .select("*", { count: "exact", head: true })
        .eq("institution_id", row.institution_id);
      await supabase
        .from("institutions")
        .update({ teacher_count: count ?? 0 })
        .eq("id", row.institution_id);
    }
    await refreshPlatform();
  };

  const updateInstitutionTags = async (institutionId: string, nextTags: string[]) => {
    if (!useRemote) {
      setInstitutionList((prev) =>
        prev.map((item) => (item.id === institutionId ? { ...item, tags: nextTags } : item)),
      );
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    await replaceInstitutionTags(supabase, institutionId, nextTags);
    await refreshPlatform();
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
    tags: tagList,
    gradeLevels: gradeLevelList,
    reviews: reviewList,
    heroSlides: slideList,
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
    removeHeroSlide,
    addInstructor,
    removeInstructor,
    updateInstitutionTags,
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
