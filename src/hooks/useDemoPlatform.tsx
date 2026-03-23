"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { heroSlides, institutions, reviews, tags, users } from "@/data/mockData";
import { HeroSlide, Institution, Instructor, Review, Tag, User, UserRole } from "@/types";
import { instructors as seedInstructors } from "@/data/instructors";

interface DemoContextValue {
  currentUser: User | null;
  users: User[];
  institutions: Institution[];
  tags: Tag[];
  reviews: Review[];
  heroSlides: HeroSlide[];
  instructors: Instructor[];
  login: (email: string, password: string) => UserRole | null;
  logout: () => void;
  addReview: (payload: Omit<Review, "id" | "createdAt" | "status">) => void;
  updateInstitution: (institutionId: string, payload: Partial<Institution>) => void;
  createManager: (payload: Omit<User, "id" | "role">) => User;
  createInstitution: (payload: Omit<Institution, "id" | "createdAt">) => Institution;
  createTag: (name: string) => void;
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
  const [reviewList, setReviewList] = useState<Review[]>(reviews);
  const [slideList, setSlideList] = useState<HeroSlide[]>(heroSlides);
  const [instructorList, setInstructorList] = useState<Instructor[]>(seedInstructors);
  const [staticPages, setStaticPages] = useState({
    about: "Admin panelinden Admin tarafından düzenlenecektir.",
    privacy: "Admin panelinden Admin tarafından düzenlenecektir.",
    contact: "Admin panelinden Admin tarafından düzenlenecektir.",
  });

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

  const createManager = (payload: Omit<User, "id" | "role">) => {
    const manager: User = {
      ...payload,
      id: `u-manager-${Date.now()}`,
      role: "institution_manager",
    };
    setUserList((prev) => [...prev, manager]);
    return manager;
  };

  const createInstitution = (payload: Omit<Institution, "id" | "createdAt">) => {
    const institution: Institution = {
      ...payload,
      id: `inst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInstitutionList((prev) => [institution, ...prev]);
    return institution;
  };

  const createTag = (name: string) => {
    setTagList((prev) => [...prev, { id: name.toLowerCase().replaceAll(" ", "-"), name }]);
  };

  const toggleFeatured = (institutionId: string) => {
    setInstitutionList((prev) =>
      prev.map((item) =>
        item.id === institutionId ? { ...item, featured: !item.featured } : item,
      ),
    );
  };

  const deleteInstitution = (institutionId: string) => {
    setInstitutionList((prev) => prev.filter((item) => item.id !== institutionId));
    setReviewList((prev) => prev.filter((item) => item.institutionId !== institutionId));
    setInstructorList((prev) => prev.filter((item) => item.institutionId !== institutionId));
    setUserList((prev) =>
      prev.map((item) =>
        item.institutionId === institutionId ? { ...item, institutionId: undefined } : item,
      ),
    );
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

  const value = useMemo(
    () => ({
      currentUser,
      users: userList,
      institutions: institutionList,
      tags: tagList,
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
    }),
    [
      currentUser,
      userList,
      institutionList,
      tagList,
      reviewList,
      slideList,
      instructorList,
      staticPages,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoPlatform() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoPlatform DemoPlatformProvider içinde kullanılmalıdır.");
  return context;
}
