import { institutionMatchesExamNav } from "@/lib/examMenuNav";
import { Institution, InstitutionFilters, Review } from "@/types";

/** Listeleme ve filtrelerde: onaylı yorum varsa ondan; yoksa kurumun sakladığı özet puan */
export function getPublicRating(institution: Institution, reviews: Review[]) {
  const approved = reviews.filter(
    (r) => r.institutionId === institution.id && r.status === "onaylandi",
  );
  if (approved.length > 0) {
    const average = approved.reduce((acc, r) => acc + r.rating, 0) / approved.length;
    return { average, count: approved.length };
  }
  return { average: institution.rating, count: institution.reviewCount };
}

export function filterInstitutions(
  institutions: Institution[],
  reviews: Review[],
  filters: InstitutionFilters,
) {
  return institutions.filter((institution) => {
    const aboutText = institution.aboutCards
      .map((c) => `${c.title} ${c.body}`)
      .join(" ");
    const programText = institution.programCards
      .map(
        (c) =>
          `${c.title} ${c.body} ${(c.modalItems ?? []).map((m) => `${m.title} ${m.subtitle}`).join(" ")}`,
      )
      .join(" ");
    const text =
      `${institution.name} ${institution.officialStatus} ${institution.shortDescription} ${institution.longDescription} ${institution.aboutInstitution} ${institution.city} ${institution.category} ${institution.examNavIds.join(" ")} ${institution.minPrice} ${institution.maxPrice} ${institution.priceRange} ${aboutText} ${programText} ${institution.programs.join(" ")}`.toLowerCase();
    const queryMatch = filters.query ? text.includes(filters.query.toLowerCase()) : true;
    const cityMatch = filters.city ? institution.city === filters.city : true;
    const districtMatch = filters.district ? institution.district === filters.district : true;
    const neighborhoodMatch = filters.neighborhood
      ? institution.neighborhood.trim() === filters.neighborhood.trim()
      : true;
    const minPriceMatch =
      typeof filters.minPrice === "number" ? institution.maxPrice >= filters.minPrice : true;
    const maxPriceMatch =
      typeof filters.maxPrice === "number" ? institution.minPrice <= filters.maxPrice : true;
    const tagMatch =
      filters.tags.length === 0
        ? true
        : filters.tags.every((selectedTag) => institution.tags.includes(selectedTag));
    const gradeMatch =
      !filters.gradeLevelId
        ? true
        : institution.gradeLevelIds.length > 0 &&
          institution.gradeLevelIds.includes(filters.gradeLevelId);
    const { average } = getPublicRating(institution, reviews);
    const ratingMatch = average >= filters.minRating;
    const examMatch = institutionMatchesExamNav(institution.examNavIds, filters.examMenu);

    return (
      queryMatch &&
      cityMatch &&
      districtMatch &&
      neighborhoodMatch &&
      minPriceMatch &&
      maxPriceMatch &&
      tagMatch &&
      gradeMatch &&
      ratingMatch &&
      examMatch
    );
  });
}

/**
 * wa.me için rakamlar: önce `whatsapp`, yeterli değilse `phone` (çoğu kurumda WhatsApp alanı boş).
 * TR: 0 ile başlayan 11 hane → 90…; 5 ile başlayan 10 hane → 905…
 */
export function institutionWhatsAppDialDigits(institution: Institution): string {
  const w = institution.whatsapp.replace(/\D/g, "");
  const p = institution.phone.replace(/\D/g, "");
  const raw = w.length >= 10 ? w : p.length >= 10 ? p : w.length > 0 ? w : p;
  return normalizeTurkeyWhatsAppDialDigits(raw);
}

function normalizeTurkeyWhatsAppDialDigits(digits: string): string {
  if (!digits) return "";
  if (digits.startsWith("90") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length >= 11) return `90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;
  return digits;
}

/** WhatsApp sohbeti açılabilir mi (en az 10 rakam, genelde cep). */
export function institutionCanOpenWhatsAppChat(institution: Institution): boolean {
  return institutionWhatsAppDialDigits(institution).replace(/\D/g, "").length >= 10;
}

export function institutionWhatsAppHref(institution: Institution, presetMessage?: string) {
  const digits = institutionWhatsAppDialDigits(institution);
  const text = presetMessage ?? `Merhaba, ${institution.name} hakkında bilgi almak istiyorum.`;
  const encoded = encodeURIComponent(text);
  if (digits.replace(/\D/g, "").length >= 10) {
    return `https://api.whatsapp.com/send?phone=${digits}&text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function institutionCoverImage(institution: Institution) {
  return institution.images[0] ?? "";
}
