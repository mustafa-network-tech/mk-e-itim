import type { Institution } from "@/types";

/** Yeni kurum oluştururken `name` ve `ownerUserId` dışındaki alanlar için başlangıç değerleri */
export const INSTITUTION_DEFAULTS: Omit<Institution, "id" | "createdAt" | "name" | "ownerUserId"> = {
  type: "kurs",
  category: "Genel",
  city: "İstanbul",
  district: "Merkez",
  neighborhood: "",
  address: "",
  phone: "0212 000 00 00",
  website: "https://www.example.com",
  whatsapp: "",
  shortDescription: "Kurum açıklaması kısa özet.",
  longDescription: "Kurum hakkında detaylı açıklama metni burada yer alır.",
  price: "",
  priceRange: "Fiyat için iletişime geçin",
  minPrice: 3000,
  maxPrice: 8000,
  rating: 0,
  reviewCount: 0,
  teacherCount: 8,
  teacherInfo:
    "Alanında deneyimli öğretmen kadrosu ile eğitim verilmektedir. Branş dağılımı ve deneyim için kurum ile iletişime geçebilirsiniz.",
  programs: ["TYT", "AYT"],
  tags: [],
  images: [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  ],
  weeklyHours: 24,
  totalHours: 420,
  oneToOneLessonCount: 4,
  classroomCount: 6,
  capacity: 180,
  classSize: 24,
  libraryCapacity: 40,
  hasPublicationSupport: false,
  examCount: 12,
  hasDigitalPlatform: false,
  digitalPlatformInfo: "",
  coachingRatio: "1 / 14",
  featured: false,
  topVisible: true,
  gradeLevelIds: [],
  discountActive: false,
  discountPercent: 0,
  discountText: "",
  discountStartDate: "",
  discountEndDate: "",
};

export type InstitutionCreateInput = Partial<Omit<Institution, "id" | "createdAt">> &
  Pick<Institution, "name" | "ownerUserId">;
