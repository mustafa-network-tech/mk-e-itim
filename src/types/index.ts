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
  /** Kart ve detayda gösterilen ana kategori etiketi */
  category: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  phone: string;
  website: string;
  /** WhatsApp için ülke kodlu rakam dizisi veya görüntülenebilir format */
  whatsapp: string;
  shortDescription: string;
  longDescription: string;
  /** Tek satırlık fiyat özeti (örn. aylık paket) */
  price: string;
  /** Aralık veya aralık metni */
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  /** Onaylı yorum yoksa kart/hero için gösterim */
  rating: number;
  /** Onaylı yorum yoksa gösterilecek toplam yorum sayısı (platform istatistiği) */
  reviewCount: number;
  teacherCount: number;
  /** Kadro açıklaması (detay sayfası; öğretmen adı listesi değil, özet metin) */
  teacherInfo: string;
  programs: string[];
  tags: string[];
  /** [0] kapak görseli; galeri için ek URL'ler */
  images: string[];
  weeklyHours: number;
  totalHours: number;
  oneToOneLessonCount: number;
  classroomCount: number;
  capacity: number;
  classSize: number;
  libraryCapacity: number;
  hasPublicationSupport: boolean;
  examCount: number;
  hasDigitalPlatform: boolean;
  digitalPlatformInfo: string;
  coachingRatio: string;
  featured: boolean;
  topVisible?: boolean;
  createdAt: string;
  ownerUserId: string;
  /** Hero / listelemede sınıf filtresi; boşsa kurum okul kademesi hedeflemiyor demektir (ör. yalnızca mezun programı). */
  gradeLevelIds: string[];
  /** Kursiyera’ya özel kampanya — minPrice üzerinden otomatik hesap */
  discountActive: boolean;
  discountPercent: number;
  /** Boşsa sistem metni üretir */
  discountText: string;
  /** YYYY-MM-DD; boşsa başlangıç sınırı yok */
  discountStartDate: string;
  /** YYYY-MM-DD; boşsa bitiş sınırı yok */
  discountEndDate: string;
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

export interface GradeLevel {
  id: string;
  label: string;
}

export interface InstitutionFilters {
  query: string;
  city: string;
  /** Seçili şehre göre ilçe; boş veya yoksa filtre uygulanmaz */
  district?: string;
  tags: string[];
  /** Tek seçim (hero araması); kurumun gradeLevelIds ile eşleşir */
  gradeLevelId?: string;
  minPrice?: number;
  maxPrice?: number;
  type: "" | "kurs" | "dershane";
  minRating: number;
}
