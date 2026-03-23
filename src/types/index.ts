export type UserRole = "admin" | "institution_manager";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  password: string;
  phone?: string;
  institutionId?: string;
}

export interface Institution {
  id: string;
  name: string;
  type: "kurs" | "dershane";
  city: string;
  district: string;
  address: string;
  phone: string;
  website: string;
  shortDescription: string;
  longDescription: string;
  teacherCount: number;
  minPrice: number;
  maxPrice: number;
  programs: string[];
  tags: string[];
  coverImage: string;
  galleryImages: string[];
  featured: boolean;
  topVisible?: boolean;
  createdAt: string;
  ownerUserId: string;
}

export interface Tag {
  id: string;
  name: string;
  category?: string;
}

export interface Review {
  id: string;
  institutionId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "onay_bekliyor" | "onaylandi" | "reddedildi";
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface Instructor {
  id: string;
  institutionId: string;
  name: string;
  branch: string;
}

export interface InstitutionFilters {
  query: string;
  city: string;
  tags: string[];
  minPrice?: number;
  maxPrice?: number;
  type: "" | "kurs" | "dershane";
  minRating: number;
}
