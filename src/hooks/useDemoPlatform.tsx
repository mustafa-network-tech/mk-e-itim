"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { heroSlides, institutions, reviews, tags, users } from "@/data/mockData";
import { HeroSlide, Institution, Review, Tag, User, UserRole } from "@/types";

interface DemoContextValue {
  currentUser: User | null;
  users: User[];
  institutions: Institution[];
  tags: Tag[];
  reviews: Review[];
  heroSlides: HeroSlide[];
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
  const [slideList] = useState<HeroSlide[]>(heroSlides);

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
    setUserList((prev) =>
      prev.map((item) =>
        item.institutionId === institutionId ? { ...item, institutionId: undefined } : item,
      ),
    );
  };

  const updateReviewStatus = (reviewId: string, status: Review["status"]) => {
    setReviewList((prev) => prev.map((item) => (item.id === reviewId ? { ...item, status } : item)));
  };

  const value = useMemo(
    () => ({
      currentUser,
      users: userList,
      institutions: institutionList,
      tags: tagList,
      reviews: reviewList,
      heroSlides: slideList,
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
    }),
    [currentUser, userList, institutionList, tagList, reviewList, slideList],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoPlatform() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoPlatform DemoPlatformProvider içinde kullanılmalıdır.");
  return context;
}
