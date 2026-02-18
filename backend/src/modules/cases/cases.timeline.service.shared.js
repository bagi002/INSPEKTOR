import { HttpError } from "../../utils/httpError.js";
import { findCaseById, findCaseByIdForAuthor } from "./cases.repository.js";
import { getCaseUserProgressByCaseIdAndUserId } from "./cases.repository.progress.js";

export function throwValidationIfNeeded(errors, message) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, message, errors);
  }
}

export function parseCaseId(caseIdInput) {
  const normalizedValue =
    typeof caseIdInput === "string" ? caseIdInput.trim() : String(caseIdInput ?? "");

  if (!/^\d+$/.test(normalizedValue)) {
    throw new HttpError(400, "Prosleđeni slučaj nije validan.");
  }

  const caseId = Number.parseInt(normalizedValue, 10);
  if (!Number.isInteger(caseId) || caseId <= 0) {
    throw new HttpError(400, "Prosleđeni slučaj nije validan.");
  }

  return caseId;
}

function toBoundedInteger(value, minimum, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, parsed));
}

function resolveLastUnlockedAt(item) {
  const unlockAt = typeof item?.unlockAt === "string" ? item.unlockAt.trim() : "";
  if (unlockAt.length > 0) {
    return unlockAt;
  }

  return typeof item?.createdAt === "string" ? item.createdAt : "";
}

export function buildProgressSnapshot(progressRow, timelineItems, overrideUnlockedCount = null) {
  const totalItems = timelineItems.length;
  const storedStatus = progressRow?.progressStatus === "resolved" ? "resolved" : "in_progress";
  const storedResolvedAt =
    typeof progressRow?.resolvedAt === "string" && progressRow.resolvedAt.trim().length > 0
      ? progressRow.resolvedAt.trim()
      : null;

  if (storedStatus === "resolved") {
    const resolvedUnlockedCount = totalItems > 0 ? totalItems : 0;
    return {
      totalItems,
      unlockedCount: resolvedUnlockedCount,
      progressPercent: 100,
      progressStatus: "resolved",
      hasNextItem: false,
      lastUnlockedTimelineAt:
        resolvedUnlockedCount > 0 ? resolveLastUnlockedAt(timelineItems[resolvedUnlockedCount - 1]) : "",
      resolvedAt: storedResolvedAt,
    };
  }

  if (totalItems === 0) {
    return {
      totalItems,
      unlockedCount: 0,
      progressPercent: 0,
      progressStatus: "in_progress",
      hasNextItem: false,
      lastUnlockedTimelineAt: "",
      resolvedAt: null,
    };
  }

  const storedCount = toBoundedInteger(progressRow?.unlockedTimelineCount, 0, totalItems);
  const storedPercent = toBoundedInteger(progressRow?.progressPercent, 0, 100);
  const inferredCount = toBoundedInteger(Math.round((storedPercent / 100) * totalItems), 0, totalItems);
  const unlockedCount =
    overrideUnlockedCount === null
      ? Math.max(storedCount, inferredCount)
      : toBoundedInteger(overrideUnlockedCount, 0, totalItems);

  const lastUnlockedTimelineAt =
    unlockedCount > 0 ? resolveLastUnlockedAt(timelineItems[unlockedCount - 1]) : "";

  return {
    totalItems,
    unlockedCount,
    progressPercent: Math.round((unlockedCount / totalItems) * 100),
    progressStatus: "in_progress",
    hasNextItem: unlockedCount < totalItems,
    lastUnlockedTimelineAt,
    resolvedAt: null,
  };
}

export function shouldPersistProgress(progressRow, snapshot) {
  if (!progressRow) {
    return true;
  }

  return (
    progressRow.progressStatus !== snapshot.progressStatus ||
    progressRow.progressPercent !== snapshot.progressPercent ||
    progressRow.unlockedTimelineCount !== snapshot.unlockedCount ||
    progressRow.lastUnlockedTimelineAt !== snapshot.lastUnlockedTimelineAt ||
    (progressRow.resolvedAt || null) !== (snapshot.resolvedAt || null)
  );
}

export function buildAvailableSourceSets(people, documents) {
  return {
    personIds: new Set(people.map((person) => person.id)),
    documentIds: new Set(documents.map((document) => document.id)),
  };
}

export async function assertTimelineReadAccess(caseId, requesterUserId) {
  const caseRow = await findCaseById(caseId);
  if (!caseRow) {
    throw new HttpError(404, "Slučaj nije pronađen ili nemaš pristup ovom slučaju.");
  }

  if (caseRow.authorUserId === requesterUserId || caseRow.publicationStatus === "published") {
    return caseRow;
  }

  const hasUserProgress = await getCaseUserProgressByCaseIdAndUserId(caseId, requesterUserId);
  if (hasUserProgress) {
    return caseRow;
  }

  throw new HttpError(404, "Slučaj nije pronađen ili nemaš pristup ovom slučaju.");
}

export async function assertTimelineWriteAccess(caseId, requesterUserId) {
  const caseRow = await findCaseByIdForAuthor(caseId, requesterUserId);
  if (!caseRow) {
    throw new HttpError(404, "Slučaj nije pronađen ili nemaš pristup ovom slučaju.");
  }
}
