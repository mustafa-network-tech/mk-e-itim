"use client";

import { createContext, useContext, useMemo, useState } from "react";
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
import type { AdvisorQuestion } from "@/types/advisor";
import { GradeLevel, HeroSlide, Institution, Instructor, Review, Tag, User, UserRole } from "@/types";
import { instructors as seedInstructors } from "@/data/instructors";

interface DemoContextValue {
  currentUser: User | null;
  users: User[];
  institutions: Institution[];
  tags: Tag[];
  gradeLevels: GradeLevel[];
  reviews: Review[];
  heroSlides: HeroSlide[];
  instructors: Instructor[];
  login: (email: string, password: string) => UserRole | null;
  logout: () => void;
  addReview: (payload: Omit<Review, "id" | "createdAt" | "status">) => void;
  updateInstitution: (institutionId: string, payload: Partial<Institution>) => void;
  /** Aynı e-posta varsa null döner. Kurum ataması kart oluşturulunca ownerUserId ile yapılır. */
  createManager: (payload: Omit<User, "id" | "role">) => User | null;
  createInstitution: (payload: InstitutionCreateInput) => Institution;
  createTag: (name: string) => void;
  addGradeLevel: (label: string) => void;
  removeGradeLevel: (id: string) => void;
  toggleFeatured: (institutionId: string) => void;
  deleteInstitution: (institutionId: string) => void;
  updateReviewStatus: (reviewId: string, status: Review["status"]) => void;
  addHeroSlide: (payload: Omit<HeroSlide, "id">) => void;
  removeHeroSlide: (slideId: string) => void;
  addInstructor: (institutionId: string, name: string, branch: string) => void;
  removeInstructor: (instructorId: string) => void;
  updateInstitutionTags: (institutionId: string, tags: string[]) => void;
  staticPages: {
    about: string;
    privacy: string;
    contact: string;
  };
  updateStaticPage: (key: "about" | "privacy" | "contact", content: string) => void;
  /** Eğitim Danışmanı sohbet soruları (yalnızca metin; adım mantığı `stepKey` ile sabit). */
  advisorQuestions: AdvisorQuestion[];
  updateAdvisorQuestion: (id: string, prompt: string) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoPlatformProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<User[]>(() => {
    const hasAdmin = users.some((item) => item.role === "admin");
    if (hasAdmin) return users;
    return [
      ...users,
      {
        id: "u-admin-seeded",
        role: "admin",
        name: "Sistem Yöneticisi",
        email: "admin@mkegitim.demo",
        password: "Admin123!",
      },
    ];
  });
  const [institutionList, setInstitutionList] = useState<Institution[]>(institutions);
  const [tagList, setTagList] = useState<Tag[]>(tags);
  const [gradeLevelList, setGradeLevelList] = useState<GradeLevel[]>(gradeLevelsSeed);
  const [reviewList, setReviewList] = useState<Review[]>(reviews);
  const [slideList, setSlideList] = useState<HeroSlide[]>(heroSlides);
  const [instructorList, setInstructorList] = useState<Instructor[]>(seedInstructors);
  const [staticPages, setStaticPages] = useState({
    about: "Admin panelinden Admin tarafından düzenlenecektir.",
    privacy: "Admin panelinden Admin tarafından düzenlenecektir.",
    contact: "Admin panelinden Admin tarafından düzenlenecektir.",
  });
  const [advisorQuestionList, setAdvisorQuestionList] = useState<AdvisorQuestion[]>(advisorQuestionsSeed);

  const login = (email: string, password: string) => {
    const found = userList.find((u) => u.email === email && u.password === password);
    if (!found) return null;
    setCurrentUser(found);
    return found.role;
  };

  const logout = () => setCurrentUser(null);

  const addReview = (payload: Omit<Review, "id" | "createdAt" | "status">) => {
    const next: Review = {
      ...payload,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "onay_bekliyor",
    };
    setReviewList((prev) => [next, ...prev]);
  };

  const updateInstitution = (institutionId: string, payload: Partial<Institution>) => {
    setInstitutionList((prev) =>
      prev.map((item) => (item.id === institutionId ? { ...item, ...payload } : item)),
    );
  };

  const createManager = (payload: Omit<User, "id" | "role">): User | null => {
    const email = payload.email.trim().toLowerCase();
    let created: User | null = null;
    setUserList((prev) => {
      if (prev.some((u) => u.email.trim().toLowerCase() === email)) {
        return prev;
      }
      const manager: User = {
        ...payload,
        email: payload.email.trim(),
        id: `u-manager-${Date.now()}`,
        role: "institution_manager",
        institutionId: undefined,
      };
      created = manager;
      return [...prev, manager];
    });
    return created;
  };

  const createInstitution = (payload: InstitutionCreateInput) => {
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
    return institution;
  };

  const createTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id =
      trimmed
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9ığüşöç.\-]+/gi, "")
        .replace(/^-+|-+$/g, "") || `etiket-${Date.now()}`;
    setTagList((prev) => {
      if (prev.some((t) => t.id === id || t.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [...prev, { id, name: trimmed }];
    });
  };

  const addGradeLevel = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = `g-${Date.now()}`;
    setGradeLevelList((prev) => [...prev, { id, label: trimmed }]);
  };

  const removeGradeLevel = (id: string) => {
    setGradeLevelList((prev) => prev.filter((g) => g.id !== id));
    setInstitutionList((prev) =>
      prev.map((inst) => ({
        ...inst,
        gradeLevelIds: inst.gradeLevelIds.filter((gid) => gid !== id),
      })),
    );
  };

  const toggleFeatured = (institutionId: string) => {
    setInstitutionList((prev) =>
      prev.map((item) =>
        item.id === institutionId ? { ...item, featured: !item.featured } : item,
      ),
    );
  };

  const deleteInstitution = (institutionId: string) => {
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
  };

  const updateReviewStatus = (reviewId: string, status: Review["status"]) => {
    setReviewList((prev) => prev.map((item) => (item.id === reviewId ? { ...item, status } : item)));
  };

  const addHeroSlide = (payload: Omit<HeroSlide, "id">) => {
    setSlideList((prev) => [{ ...payload, id: `h-${Date.now()}` }, ...prev]);
  };

  const removeHeroSlide = (slideId: string) => {
    setSlideList((prev) => prev.filter((item) => item.id !== slideId));
  };

  const addInstructor = (institutionId: string, name: string, branch: string) => {
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
  };

  const removeInstructor = (instructorId: string) => {
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
  };

  const updateInstitutionTags = (institutionId: string, tags: string[]) => {
    setInstitutionList((prev) =>
      prev.map((item) => (item.id === institutionId ? { ...item, tags } : item)),
    );
  };

  const updateStaticPage = (key: "about" | "privacy" | "contact", content: string) => {
    setStaticPages((prev) => ({ ...prev, [key]: content }));
  };

  const updateAdvisorQuestion = (id: string, prompt: string) => {
    setAdvisorQuestionList((prev) =>
      prev.map((q) => (q.id === id ? { ...q, prompt: prompt.trim() || q.prompt } : q)),
    );
  };

  const value = useMemo(
    () => ({
      currentUser,
      users: userList,
      institutions: institutionList,
      tags: tagList,
      gradeLevels: gradeLevelList,
      reviews: reviewList,
      heroSlides: slideList,
      instructors: instructorList,
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
    }),
    [
      currentUser,
      userList,
      institutionList,
      tagList,
      gradeLevelList,
      reviewList,
      slideList,
      instructorList,
      staticPages,
      advisorQuestionList,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoPlatform() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoPlatform DemoPlatformProvider içinde kullanılmalıdır.");
  return context;
}
