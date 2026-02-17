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
    message: "Pregled slucaja je uspesno ucitan.",
    data: result,
  });
}

export async function getCaseQuizController(req, res) {
  const result = await getCaseQuiz(req.params.caseId, req.auth.userId, parseReadScope(req.query?.scope));

  res.status(200).json({
    ok: true,
    message: "Kviz podaci su uspesno ucitani.",
    data: result,
  });
}

export async function upsertCreatorCaseQuizController(req, res) {
  const result = await upsertCreatorCaseQuiz(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Kviz slucaja je uspesno sacuvan.",
    data: result,
  });
}

export async function submitCaseQuizController(req, res) {
  const result = await submitCaseQuiz(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: result.passed
      ? "Slucaj je uspesno rijesen kroz zavrsni kviz."
      : "Kviz je zavrsen, ali prag za rjesenje slucaja nije dostignut.",
    data: result,
  });
}
