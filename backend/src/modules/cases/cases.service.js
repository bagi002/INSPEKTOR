import { HttpError } from "../../utils/httpError.js";
import {
  createCaseWithDetails,
  findCaseByIdForAuthor,
  getHomeOverviewRows,
} from "./cases.repository.js";
import { getCaseQuizQuestionCount } from "./cases.repository.quiz.js";
import { validateCreateCasePayload } from "./cases.validation.js";
import {
  CASE_READ_SCOPES,
  getSolveVisibilityForUser,
  normalizeCaseReadScope,
} from "./cases.solve.visibility.js";
import { assertTimelineReadAccess } from "./cases.timeline.service.shared.js";
import { getSolvePeopleRoleState } from "./cases.solve.roles.service.js";

function throwValidationIfNeeded(errors) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Podaci nisu validni.", errors);
  }
}

function validateTimelineReferences(sanitized, errors) {
  const usedOrders = new Set();

  sanitized.timeline.forEach((item, index) => {
    if (item.itemType === "document" && item.sourceIndex >= sanitized.documents.length) {
      errors[`timeline.${index}.sourceIndex`] = "Timeline dokument ne postoji u listi dokumenata.";
    }

    if (item.itemType === "person" && item.sourceIndex >= sanitized.people.length) {
      errors[`timeline.${index}.sourceIndex`] = "Timeline osoba ne postoji u listi osoba.";
    }

    if (usedOrders.has(item.unlockOrder)) {
      errors[`timeline.${index}.unlockOrder`] = "Redosled otkljucavanja mora biti jedinstven.";
      return;
    }

    usedOrders.add(item.unlockOrder);
  });
}

function ensureAuthorProgress(progress, authorUserId) {
  const hasAuthorProgress = progress.some((item) => item.userId === authorUserId);
  if (hasAuthorProgress) {
    return progress;
  }

  return [
    {
      userId: authorUserId,
      progressStatus: "in_progress",
      progressPercent: 0,
      userRating: null,
    },
    ...progress,
  ];
}

function parseCaseId(caseIdInput) {
  const normalizedValue =
    typeof caseIdInput === "string" ? caseIdInput.trim() : String(caseIdInput ?? "");
  if (!/^\d+$/.test(normalizedValue)) {
    throw new HttpError(400, "Prosledjeni slucaj nije validan.");
  }

  const caseId = Number.parseInt(normalizedValue, 10);
  if (!Number.isInteger(caseId) || caseId <= 0) {
    throw new HttpError(400, "Prosledjeni slucaj nije validan.");
  }

  return caseId;
}

export async function createCase(payload, authorUserId) {
  const { errors, sanitized } = validateCreateCasePayload(payload);
  const hasForeignProgressUser = sanitized.progress.some((item) => item.userId !== authorUserId);
  if (hasForeignProgressUser) {
    errors.progress = "Trenutno je podrzano cuvanje napretka samo za autora slucaja.";
  }

  validateTimelineReferences(sanitized, errors);
  throwValidationIfNeeded(errors);
  const progressWithAuthor = ensureAuthorProgress(sanitized.progress, authorUserId);

  const caseRow = await createCaseWithDetails({
    authorUserId,
    title: sanitized.title,
    description: sanitized.description,
    publicationStatus: sanitized.publicationStatus,
    people: sanitized.people,
    documents: sanitized.documents,
    timeline: sanitized.timeline,
    progress: progressWithAuthor,
  });

  return {
    case: caseRow,
    totals: {
      people: sanitized.people.length,
      documents: sanitized.documents.length,
      timelineItems: sanitized.timeline.length,
      progressEntries: progressWithAuthor.length,
    },
  };
}

export async function getLoggedHomeOverview(userId) {
  const rows = await getHomeOverviewRows(userId);

  return {
    summary: {
      activeCount: rows.stats.activeCount,
      resolvedCount: rows.stats.resolvedCount,
      createdCount: rows.stats.createdCount,
      averageResolvedRating: rows.stats.averageResolvedRating,
    },
    sections: {
      activeCases: rows.activeCases,
      resolvedCases: rows.resolvedCases,
      topRatedPublicCases: rows.topRatedCases,
      createdCases: rows.createdCases,
    },
  };
}

export async function getCreatorCase(caseIdInput, userId) {
  const caseId = parseCaseId(caseIdInput);
  const caseRow = await findCaseByIdForAuthor(caseId, userId);

  if (!caseRow) {
    throw new HttpError(404, "Slucaj nije pronadjen ili nemas pristup ovom slucaju.");
  }

  return caseRow;
}

function mapCaseOverview(caseRow) {
  return {
    id: caseRow.id,
    title: caseRow.title,
    description: caseRow.description,
    publicationStatus: caseRow.publicationStatus,
    averageRating: caseRow.averageRating,
    ratingCount: caseRow.ratingCount,
    author: `${caseRow.authorFirstName || ""} ${caseRow.authorLastName || ""}`.trim(),
  };
}

export async function getCaseWorkspaceOverview(
  caseIdInput,
  requesterUserId,
  scopeInput = CASE_READ_SCOPES.CREATE
) {
  const caseId = parseCaseId(caseIdInput);
  const readScope = normalizeCaseReadScope(scopeInput);

  if (readScope === CASE_READ_SCOPES.CREATE) {
    const caseRow = await findCaseByIdForAuthor(caseId, requesterUserId);
    if (!caseRow) {
      throw new HttpError(404, "Slucaj nije pronadjen ili nemas pristup ovom slucaju.");
    }

    const totalQuestions = await getCaseQuizQuestionCount(caseId);
    return {
      scope: CASE_READ_SCOPES.CREATE,
      case: mapCaseOverview(caseRow),
      progress: null,
      quiz: {
        totalQuestions,
      },
    };
  }

  const caseRow = await assertTimelineReadAccess(caseId, requesterUserId);
  const [visibility, totalQuestions] = await Promise.all([
    getSolveVisibilityForUser(caseId, requesterUserId),
    getCaseQuizQuestionCount(caseId),
  ]);
  const solvePeopleState = await getSolvePeopleRoleState(
    caseId,
    requesterUserId,
    visibility.unlockedPersonIds
  );

  return {
    scope: CASE_READ_SCOPES.SOLVE,
    case: mapCaseOverview(caseRow),
    progress: visibility.progress,
    roleProgress: solvePeopleState.roleProgress,
    quiz: {
      totalQuestions,
    },
  };
}
