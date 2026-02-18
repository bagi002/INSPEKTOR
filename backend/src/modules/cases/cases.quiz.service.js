import { HttpError } from "../../utils/httpError.js";
import { findCaseByIdForAuthor } from "./cases.repository.js";
import { upsertCaseUserProgress } from "./cases.repository.progress.js";
import {
  getCaseQuizQuestionsByCaseId,
  getCaseQuizUserResult,
  replaceCaseQuizQuestions,
  upsertCaseQuizUserResult,
} from "./cases.repository.quiz.js";
import {
  CASE_READ_SCOPES,
  getSolveVisibilityForUser,
  normalizeCaseReadScope,
} from "./cases.solve.visibility.js";
import { getSolvePeopleRoleState } from "./cases.solve.roles.service.js";
import {
  assertTimelineReadAccess,
  parseCaseId,
  throwValidationIfNeeded,
} from "./cases.timeline.service.shared.js";
import {
  CASE_QUIZ_PASS_THRESHOLD_PERCENT,
  buildAttemptSummary,
  buildQuizSolveBlockers,
  buildReviewEntries,
  formatCaseSummary,
  mapQuizQuestionsForResponse,
  normalizeSubmittedAnswers,
} from "./cases.quiz.service.shared.js";
import {
  validateCaseQuizPayload,
  validateCaseQuizSubmissionPayload,
} from "./cases.quiz.validation.js";
async function assertAuthorQuizAccess(caseId, userId) {
  const caseRow = await findCaseByIdForAuthor(caseId, userId);
  if (!caseRow) {
    throw new HttpError(404, "Slučaj nije pronađen ili nemaš pristup ovom slučaju.");
  }
  return caseRow;
}

export async function getCaseQuiz(caseIdInput, requesterUserId, scopeInput = CASE_READ_SCOPES.CREATE) {
  const caseId = parseCaseId(caseIdInput);
  const readScope = normalizeCaseReadScope(scopeInput);
  if (readScope === CASE_READ_SCOPES.CREATE) {
    const caseRow = await assertAuthorQuizAccess(caseId, requesterUserId);
    const questions = await getCaseQuizQuestionsByCaseId(caseId, true);
    return {
      scope: CASE_READ_SCOPES.CREATE,
      caseId,
      case: formatCaseSummary(caseRow),
      passThresholdPercent: CASE_QUIZ_PASS_THRESHOLD_PERCENT,
      totalQuestions: questions.length,
      questions: mapQuizQuestionsForResponse(questions, true),
    };
  }
  const caseRow = await assertTimelineReadAccess(caseId, requesterUserId);
  const [questions, visibility, quizResult] = await Promise.all([
    getCaseQuizQuestionsByCaseId(caseId, true),
    getSolveVisibilityForUser(caseId, requesterUserId),
    getCaseQuizUserResult(caseId, requesterUserId),
  ]);
  const progress = visibility.progress;
  const solvePeopleState = await getSolvePeopleRoleState(
    caseId,
    requesterUserId,
    visibility.unlockedPersonIds
  );
  const blockers = buildQuizSolveBlockers(progress, questions.length, solvePeopleState.roleProgress);
  const canSubmit = progress.progressStatus !== "resolved" && blockers.length === 0;
  const isResolved = progress.progressStatus === "resolved";
  return {
    scope: CASE_READ_SCOPES.SOLVE,
    caseId,
    case: formatCaseSummary(caseRow),
    progress,
    roleProgress: solvePeopleState.roleProgress,
    passThresholdPercent: CASE_QUIZ_PASS_THRESHOLD_PERCENT,
    totalQuestions: questions.length,
    canSubmit,
    blockers,
    questions: mapQuizQuestionsForResponse(questions, isResolved),
    review: isResolved
      ? buildReviewEntries(questions, normalizeSubmittedAnswers(quizResult?.answers))
      : null,
    lastAttempt: buildAttemptSummary(quizResult),
  };
}
export async function upsertCreatorCaseQuiz(caseIdInput, payload, authorUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertAuthorQuizAccess(caseId, authorUserId);
  const { errors, sanitized } = validateCaseQuizPayload(payload);
  throwValidationIfNeeded(errors, "Podaci kviza nisu validni.");
  const questions = await replaceCaseQuizQuestions(caseId, sanitized.questions);
  return {
    caseId,
    passThresholdPercent: CASE_QUIZ_PASS_THRESHOLD_PERCENT,
    totalQuestions: questions.length,
    questions: mapQuizQuestionsForResponse(questions, true),
  };
}

export async function submitCaseQuiz(caseIdInput, payload, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  const caseRow = await assertTimelineReadAccess(caseId, requesterUserId);
  const [questions, visibility] = await Promise.all([
    getCaseQuizQuestionsByCaseId(caseId, true),
    getSolveVisibilityForUser(caseId, requesterUserId),
  ]);
  if (questions.length === 0) {
    throw new HttpError(400, "Završni kviz nije dostupan za ovaj slučaj.");
  }

  const progress = visibility.progress;
  if (progress.progressStatus === "resolved") {
    throw new HttpError(409, "Slučaj je već označen kao riješen.");
  }
  const solvePeopleState = await getSolvePeopleRoleState(
    caseId,
    requesterUserId,
    visibility.unlockedPersonIds
  );
  const blockers = buildQuizSolveBlockers(progress, questions.length, solvePeopleState.roleProgress);
  if (blockers.length > 0) {
    throw new HttpError(400, "Slučaj još nije spreman za završni kviz.", {
      quiz: blockers[0],
    });
  }
  const { errors, sanitized } = validateCaseQuizSubmissionPayload(payload, questions);
  throwValidationIfNeeded(errors, "Odgovori kviza nisu validni.");
  const selectedAnswersByQuestion = normalizeSubmittedAnswers(sanitized.answers);
  const reviewEntries = buildReviewEntries(questions, selectedAnswersByQuestion);
  const correctAnswers = reviewEntries.filter((item) => item.isCorrect).length;
  const totalQuestions = questions.length;
  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = scorePercent > CASE_QUIZ_PASS_THRESHOLD_PERCENT;
  const submittedAt = new Date().toISOString();
  const persistedResult = await upsertCaseQuizUserResult(caseId, requesterUserId, {
    scorePercent,
    correctAnswers,
    totalQuestions,
    passed,
    submittedAt,
    answers: sanitized.answers,
  });
  if (!passed) {
    return {
      caseId,
      case: formatCaseSummary(caseRow),
      passed,
      passThresholdPercent: CASE_QUIZ_PASS_THRESHOLD_PERCENT,
      scorePercent,
      correctAnswers,
      totalQuestions,
      userProgress: progress,
      roleProgress: solvePeopleState.roleProgress,
      review: null,
      lastAttempt: buildAttemptSummary(persistedResult),
    };
  }
  await upsertCaseUserProgress(caseId, requesterUserId, {
    progressStatus: "resolved",
    progressPercent: 100,
    unlockedTimelineCount: progress.totalItems,
    lastUnlockedTimelineAt: progress.lastUnlockedTimelineAt,
    resolvedAt: submittedAt,
  });
  return {
    caseId,
    case: formatCaseSummary(caseRow),
    passed,
    passThresholdPercent: CASE_QUIZ_PASS_THRESHOLD_PERCENT,
    scorePercent,
    correctAnswers,
    totalQuestions,
    userProgress: {
      ...progress,
      unlockedCount: progress.totalItems,
      progressPercent: 100,
      progressStatus: "resolved",
      hasNextItem: false,
      resolvedAt: submittedAt,
    },
    roleProgress: solvePeopleState.roleProgress,
    review: reviewEntries,
    lastAttempt: buildAttemptSummary(persistedResult),
  };
}
