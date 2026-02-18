import { HttpError } from "../../utils/httpError.js";
import { ensureCaseUserProgressByCaseIdAndUserId, getCaseUserProgressByCaseIdAndUserId } from "./cases.repository.progress.js";
import {
  getCaseCommunityStats,
  getCaseReviewsByCaseId,
  getCaseReviewSummary,
  getCaseUserReviewByCaseIdAndUserId,
  getResolvedCaseUsersByCaseId,
  recalculateCaseRatings,
  saveCaseUserReview,
} from "./cases.repository.reviews.js";
import { formatCaseSummary } from "./cases.quiz.service.shared.js";
import { CASE_READ_SCOPES, normalizeCaseReadScope } from "./cases.solve.visibility.js";
import {
  assertTimelineReadAccess,
  parseCaseId,
  throwValidationIfNeeded,
} from "./cases.timeline.service.shared.js";
import { findCaseByIdForAuthor } from "./cases.repository.js";
import { validateCaseReviewPayload } from "./cases.reviews.validation.js";

function hasUserAlreadyRated(progress) {
  return progress?.userRating !== null && progress?.userRating !== undefined;
}

export async function getCaseReviews(
  caseIdInput,
  requesterUserId,
  scopeInput = CASE_READ_SCOPES.SOLVE
) {
  const caseId = parseCaseId(caseIdInput);
  const readScope = normalizeCaseReadScope(scopeInput);

  if (readScope === CASE_READ_SCOPES.CREATE) {
    const caseRow = await findCaseByIdForAuthor(caseId, requesterUserId);
    if (!caseRow) {
      throw new HttpError(404, "Slucaj nije pronadjen ili nemas pristup ovom slucaju.");
    }

    const [summary, reviews, solvedUsers] = await Promise.all([
      getCaseReviewSummary(caseId),
      getCaseReviewsByCaseId(caseId),
      getResolvedCaseUsersByCaseId(caseId),
    ]);

    return {
      scope: CASE_READ_SCOPES.CREATE,
      caseId,
      case: formatCaseSummary(caseRow),
      summary,
      reviews,
      solvedUsers,
      userReview: null,
      viewer: {
        isAuthor: true,
        hasRated: false,
      },
    };
  }

  const caseRow = await assertTimelineReadAccess(caseId, requesterUserId);
  const isAuthor = caseRow.authorUserId === requesterUserId;
  const userProgress = await getCaseUserProgressByCaseIdAndUserId(caseId, requesterUserId);
  const hasRated = hasUserAlreadyRated(userProgress);

  if (!isAuthor && !hasRated) {
    throw new HttpError(
      403,
      "Pregled recenzija je dostupan nakon sto ocijenis slucaj koji si rijesio."
    );
  }

  const [summary, reviews, userReview] = await Promise.all([
    getCaseCommunityStats(caseId),
    getCaseReviewsByCaseId(caseId),
    hasRated ? getCaseUserReviewByCaseIdAndUserId(caseId, requesterUserId) : Promise.resolve(null),
  ]);

  return {
    scope: CASE_READ_SCOPES.SOLVE,
    caseId,
    case: formatCaseSummary(caseRow),
    summary,
    reviews,
    solvedUsers: [],
    userReview,
    viewer: {
      isAuthor,
      hasRated,
    },
  };
}

export async function submitCaseReview(caseIdInput, payload, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  const caseRow = await assertTimelineReadAccess(caseId, requesterUserId);

  if (caseRow.authorUserId === requesterUserId) {
    throw new HttpError(403, "Nije dozvoljeno ocjenjivanje sopstvenog slucaja.");
  }

  if (caseRow.publicationStatus !== "published") {
    throw new HttpError(400, "Moguce je ocijeniti samo objavljen slucaj.");
  }

  const progress = await ensureCaseUserProgressByCaseIdAndUserId(caseId, requesterUserId);
  if (progress.progressStatus !== "resolved") {
    throw new HttpError(400, "Slucaj mozes ocijeniti tek nakon sto ga uspjesno rijesis.");
  }

  if (hasUserAlreadyRated(progress)) {
    throw new HttpError(409, "Za ovaj slucaj si vec ostavio ocjenu.");
  }

  const { errors, sanitized } = validateCaseReviewPayload(payload);
  throwValidationIfNeeded(errors, "Podaci recenzije nisu validni.");

  const ratedAt = new Date().toISOString();
  await saveCaseUserReview(caseId, requesterUserId, {
    rating: sanitized.rating,
    comment: sanitized.comment,
    ratedAt,
  });

  const updatedCaseRating = await recalculateCaseRatings(caseId);
  const [summary, reviews, userReview] = await Promise.all([
    getCaseReviewSummary(caseId),
    getCaseReviewsByCaseId(caseId),
    getCaseUserReviewByCaseIdAndUserId(caseId, requesterUserId),
  ]);

  return {
    caseId,
    case: formatCaseSummary({
      ...caseRow,
      averageRating: updatedCaseRating.averageRating,
      ratingCount: updatedCaseRating.ratingCount,
    }),
    summary,
    reviews,
    userReview,
    viewer: {
      isAuthor: false,
      hasRated: true,
    },
  };
}

