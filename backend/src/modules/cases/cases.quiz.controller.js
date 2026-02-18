import { getCaseWorkspaceOverview } from "./cases.service.js";
import { getCaseQuiz, submitCaseQuiz, upsertCreatorCaseQuiz } from "./cases.quiz.service.js";

function parseReadScope(queryValue) {
  return typeof queryValue === "string" ? queryValue : "";
}

export async function getCaseOverviewController(req, res) {
  const result = await getCaseWorkspaceOverview(
    req.params.caseId,
    req.auth.userId,
    parseReadScope(req.query?.scope)
  );

  res.status(200).json({
    ok: true,
    message: "Pregled slučaja je uspešno učitan.",
    data: result,
  });
}

export async function getCaseQuizController(req, res) {
  const result = await getCaseQuiz(req.params.caseId, req.auth.userId, parseReadScope(req.query?.scope));

  res.status(200).json({
    ok: true,
    message: "Kviz podaci su uspešno učitani.",
    data: result,
  });
}

export async function upsertCreatorCaseQuizController(req, res) {
  const result = await upsertCreatorCaseQuiz(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Kviz slučaja je uspešno sačuvan.",
    data: result,
  });
}

export async function submitCaseQuizController(req, res) {
  const result = await submitCaseQuiz(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: result.passed
      ? "Slučaj je uspešno riješen kroz završni kviz."
      : "Kviz je završen, ali prag za rješenje slučaja nije dostignut.",
    data: result,
  });
}
