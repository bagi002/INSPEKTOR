export const EMPTY_HOME_DATA = {
  summary: {
    activeCount: 0,
    resolvedCount: 0,
    createdCount: 0,
    averageResolvedRating: null,
  },
  sections: {
    activeCases: [],
    resolvedCases: [],
    topRatedPublicCases: [],
    createdCases: [],
  },
};

export function normalizeHomeData(rawData) {
  const summary = rawData?.summary || {};
  const sections = rawData?.sections || {};

  return {
    summary: {
      activeCount: Number(summary.activeCount) || 0,
      resolvedCount: Number(summary.resolvedCount) || 0,
      createdCount: Number(summary.createdCount) || 0,
      averageResolvedRating:
        summary.averageResolvedRating === null || summary.averageResolvedRating === undefined
          ? null
          : Number(summary.averageResolvedRating),
    },
    sections: {
      activeCases: Array.isArray(sections.activeCases) ? sections.activeCases : [],
      resolvedCases: Array.isArray(sections.resolvedCases) ? sections.resolvedCases : [],
      topRatedPublicCases: Array.isArray(sections.topRatedPublicCases)
        ? sections.topRatedPublicCases
        : [],
      createdCases: Array.isArray(sections.createdCases) ? sections.createdCases : [],
    },
  };
}

export function formatStatus(publicationStatus) {
  return publicationStatus === "published" ? "Objavljen" : "U izradi";
}

export function formatAverageRating(rating) {
  if (rating === null || rating === undefined || Number.isNaN(Number(rating))) {
    return "-";
  }

  return `${Number(rating).toFixed(1)}/5`;
}

export function formatReviews(reviews) {
  const total = Number(reviews);
  if (!Number.isFinite(total) || total <= 0) {
    return "Nema recenzija";
  }

  return `${total} recenzija`;
}
