function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isHalfStep(value) {
  const scaled = value * 2;
  return Math.abs(scaled - Math.round(scaled)) < 0.000001;
}

export function validateCaseReviewPayload(payload) {
  const errors = {};
  const rating = toNumber(payload?.rating);
  const comment = toText(payload?.comment);

  if (rating === null || rating < 1 || rating > 5 || !isHalfStep(rating)) {
    errors.rating = "Ocjena mora biti broj od 1 do 5, sa korakom od 0.5.";
  }

  if (comment.length > 1200) {
    errors.comment = "Komentar moze imati najvise 1200 karaktera.";
  }

  return {
    errors,
    sanitized: {
      rating: rating === null ? 0 : Math.round(rating * 2) / 2,
      comment,
    },
  };
}
