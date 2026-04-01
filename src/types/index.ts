export type UserRole = "admin" | "institution_manager";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  /** Yalnızca yerel demo girişi için; Supabase oturumunda boş bırakılır */
  password?: string;
  phone?: string;
  institutionId?: string;
}

/** Kurum yöneticisinin onaya gönderdiği taslak (canlı satır + etiketler ayrı uygulanır). */
export type InstitutionManagerPendingPayload = {
  body: Partial<Institution>;
  tags: string[];
};

export interface Institution {
  id: string;
  name: string;
  /** Kart ve detayda ismin hemen altında, daha ince: resmi ünvan / tabela statüsü */
  officialStatus: string;
  /** Kart ve detayda gösterilen metin (`examNavIds` / kurum türleri ile senkron; arama metninde kullanılır) */
  category: string;
  /**
   * Kurum türleri (LGS, YKS, …, Diğer); en az biri zorunlu.
   * Üst menü `?exam=` ile burada seçili türlere göre listeleme yapılır.
   */
  examNavIds: string[];
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
  /** Kullanılmıyor; kayıtta boş tutulur (gösterim min–max sayılardan). */
  price: string;
  /** Aralığın metin kopyası; sunucu/ kayıtta syncInstitutionPriceDisplayFields ile doldurulur. */
  priceRange: string;
  /** Aralığın alt sınırı (₺, filtre + gösterim). */
  minPrice: number;
  /** Aralığın üst sınırı (₺, filtre + gösterim). */
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
  /** Kursiyera’ya özel kampanya — aralığın her iki ucuna aynı % uygulanır */
  discountActive: boolean;
  discountPercent: number;
  /** Boşsa sistem metni üretir */
  discountText: string;
  /** YYYY-MM-DD; boşsa başlangıç sınırı yok */
  discountStartDate: string;
  /** YYYY-MM-DD; boşsa bitiş sınırı yok */
  discountEndDate: string;
  /** Anon listelerde görünür; false = taslak (ör. yönetici oluşturdu, admin yayına alır) */
  listed: boolean;
  /** ISO zaman; yayında kurumda yönetici değişikliği admin onayı bekliyor */
  pendingSubmittedAt?: string | null;
  pendingManagerPayload?: InstitutionManagerPendingPayload | null;
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

/** Kurum türü: `id` sabit (URL ?exam=, exam_nav_ids); `label` admin tarafından değişir. */
export interface InstitutionTypeDef {
  id: string;
  label: string;
  sortOrder: number;
}

export interface InstitutionFilters {
  query: string;
  city: string;
  /** Üst menüden: /listings?exam=… — kurum.examNavIds içinde aranır; DIGER yalnızca açıkça seçildiyse */
  examMenu?: string;
  /** Seçili şehre göre ilçe; boş veya yoksa filtre uygulanmaz */
  district?: string;
  /** Şehir (ve varsa ilçe) seçimine göre mahalle */
  neighborhood?: string;
  tags: string[];
  /** Tek seçim (hero araması); kurumun gradeLevelIds ile eşleşir */
  gradeLevelId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating: number;
}
