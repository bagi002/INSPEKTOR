import { HttpError } from "../../utils/httpError.js";
import { createCaseWithDetails, getHomeOverviewRows } from "./cases.repository.js";
import { validateCreateCasePayload } from "./cases.validation.js";

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
