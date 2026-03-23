import { Institution, InstitutionFilters, Review } from "@/types";

export function getInstitutionScore(reviews: Review[], institutionId: string) {
  const institutionReviews = reviews.filter((r) => r.institutionId === institutionId);
  const count = institutionReviews.length;
  const average =
    count === 0
      ? 0
      : institutionReviews.reduce((acc, item) => acc + item.rating, 0) / count;
  return { average, count };
}

export function filterInstitutions(
  institutions: Institution[],
  reviews: Review[],
  filters: InstitutionFilters,
) {
  return institutions.filter((institution) => {
    const text = `${institution.name} ${institution.shortDescription} ${institution.city}`.toLowerCase();
    const queryMatch = filters.query ? text.includes(filters.query.toLowerCase()) : true;
    const cityMatch = filters.city ? institution.city === filters.city : true;
    const typeMatch = filters.type ? institution.type === filters.type : true;
    const minPriceMatch =
      typeof filters.minPrice === "number" ? institution.maxPrice >= filters.minPrice : true;
    const maxPriceMatch =
      typeof filters.maxPrice === "number" ? institution.minPrice <= filters.maxPrice : true;
    const tagMatch =
      filters.tags.length === 0
        ? true
        : filters.tags.every((selectedTag) => institution.tags.includes(selectedTag));
    const score = getInstitutionScore(reviews, institution.id);
    const ratingMatch = score.average >= filters.minRating;

    return (
      queryMatch &&
      cityMatch &&
      typeMatch &&
      minPriceMatch &&
      maxPriceMatch &&
      tagMatch &&
      ratingMatch
    );
  });
}
