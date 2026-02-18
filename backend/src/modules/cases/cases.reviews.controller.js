import { getCaseReviews, submitCaseReview } from "./cases.reviews.service.js";

function parseReadScope(queryValue) {
  return typeof queryValue === "string" ? queryValue : "";
}

export async function getCaseReviewsController(req, res) {
  const result = await getCaseReviews(
    req.params.caseId,
    req.auth.userId,
    parseReadScope(req.query?.scope)
  );

  res.status(200).json({
    ok: true,
    message: "Recenzije slucaja su uspesno ucitane.",
    data: result,
  });
}

export async function submitCaseReviewController(req, res) {
  const result = await submitCaseReview(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Ocjena i komentar su uspjesno sacuvani.",
    data: result,
  });
}

