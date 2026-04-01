import { createEmptyAboutCards } from "@/lib/institutionAboutCards";
import {
  createEmptyModalItems,
  createEmptyProgramCards,
  programsArrayFromProgramCards,
} from "@/lib/institutionProgramCards";
import type { Institution } from "@/types";
import { categoryDisplayFromExamNavIds } from "@/lib/examMenuNav";
import {
  INSTITUTION_TYPES_SEED,
  labelMapFromInstitutionTypes,
} from "@/data/institutionTypesSeed";

const DEFAULT_EXAM_NAV = ["LGS"] as const;

const DEFAULT_PROGRAM_CARDS = (() => {
  const c = createEmptyProgramCards();
  c[0] = {
    title: "TYT",
    body: "",
    modalItems: createEmptyModalItems(),
  };
  c[1] = {
    title: "AYT",
    body: "",
    modalItems: createEmptyModalItems(),
  };
  return c;
})();
const DEFAULT_TYPE_LABELS = labelMapFromInstitutionTypes(INSTITUTION_TYPES_SEED);

/** Yeni kurum oluştururken `name` ve `ownerUserId` dışındaki alanlar için başlangıç değerleri */
export const INSTITUTION_DEFAULTS: Omit<Institution, "id" | "createdAt" | "name" | "ownerUserId"> = {
  officialStatus: "",
  examNavIds: [...DEFAULT_EXAM_NAV],
  category: categoryDisplayFromExamNavIds([...DEFAULT_EXAM_NAV], DEFAULT_TYPE_LABELS),
  city: "İstanbul",
  district: "Merkez",
  neighborhood: "",
  address: "",
  phone: "0212 000 00 00",
  website: "https://www.example.com",
  whatsapp: "",
  shortDescription: "Kurum açıklaması kısa özet.",
  longDescription: "",
  aboutCards: createEmptyAboutCards(),
  aboutInstitution: "",
  programCards: DEFAULT_PROGRAM_CARDS,
  price: "",
  priceRange: "",
  minPrice: 100_000,
  maxPrice: 120_000,
  rating: 0,
  reviewCount: 0,
  programs: programsArrayFromProgramCards(DEFAULT_PROGRAM_CARDS),
  tags: [],
  images: [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  ],
  featured: false,
  topVisible: true,
  gradeLevelIds: [],
  discountActive: false,
  discountPercent: 0,
  discountText: "",
  discountStartDate: "",
  discountEndDate: "",
  listed: true,
  pendingSubmittedAt: null,
  pendingManagerPayload: null,
};

export type InstitutionCreateInput = Partial<Omit<Institution, "id" | "createdAt">> &
  Pick<Institution, "name" | "ownerUserId">;
