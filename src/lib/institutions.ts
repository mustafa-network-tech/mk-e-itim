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
    const text =
      `${institution.name} ${institution.officialStatus} ${institution.shortDescription} ${institution.city} ${institution.category} ${institution.examNavIds.join(" ")} ${institution.minPrice} ${institution.maxPrice} ${institution.priceRange}`.toLowerCase();
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

export function institutionWhatsAppHref(institution: Institution, presetMessage?: string) {
  const digits = institution.whatsapp.replace(/\D/g, "");
  const text = presetMessage ?? `Merhaba, ${institution.name} hakkında bilgi almak istiyorum.`;
  const encoded = encodeURIComponent(text);
  if (digits.length >= 10) {
    return `https://api.whatsapp.com/send?phone=${digits}&text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function institutionCoverImage(institution: Institution) {
  return institution.images[0] ?? "";
}
