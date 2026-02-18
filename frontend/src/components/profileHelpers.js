const DEFAULT_PROFILE_DATA = {
  user: null,
  activity: {
    summary: {
      createdCount: 0,
      publishedCreatedCount: 0,
      draftCreatedCount: 0,
      activeSolveCount: 0,
      resolvedSolveCount: 0,
      ratingsGivenCount: 0,
      averageRatingGiven: null,
    },
    createdCases: [],
    resolvedCases: [],
    ratingHistory: [],
  },
};

export function formatProfileDate(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("sr-RS", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatProfileRating(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return Number(value).toFixed(1);
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeProfileData(data) {
  if (!data || typeof data !== "object") {
    return DEFAULT_PROFILE_DATA;
  }

  return {
    user: data.user || null,
    activity: {
      summary: {
        ...DEFAULT_PROFILE_DATA.activity.summary,
        ...(data.activity?.summary && typeof data.activity.summary === "object"
          ? data.activity.summary
          : {}),
      },
      createdCases: toArray(data.activity?.createdCases),
      resolvedCases: toArray(data.activity?.resolvedCases),
      ratingHistory: toArray(data.activity?.ratingHistory),
    },
  };
}

export const EMPTY_PROFILE_DATA = DEFAULT_PROFILE_DATA;
