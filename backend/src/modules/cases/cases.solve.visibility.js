import { ensureCaseUserProgressByCaseIdAndUserId } from "./cases.repository.progress.js";
import { getCaseTimelineItemsByCaseId } from "./cases.repository.timeline.js";
import {
  assertTimelineReadAccess,
  buildProgressSnapshot,
} from "./cases.timeline.service.shared.js";

export const CASE_READ_SCOPES = {
  CREATE: "create",
  SOLVE: "solve",
};

export function normalizeCaseReadScope(scopeInput) {
  const normalizedScope =
    typeof scopeInput === "string" ? scopeInput.trim().toLowerCase() : "";

  return normalizedScope === CASE_READ_SCOPES.SOLVE
    ? CASE_READ_SCOPES.SOLVE
    : CASE_READ_SCOPES.CREATE;
}

function buildUnlockedSourceIds(unlockedTimelineItems, itemType) {
  const ids = new Set();
  unlockedTimelineItems.forEach((item) => {
    if (item?.itemType !== itemType) {
      return;
    }
    if (Number.isInteger(item?.sourceId) && item.sourceId > 0) {
      ids.add(item.sourceId);
    }
  });
  return ids;
}

export async function getSolveVisibilityForUser(caseId, requesterUserId) {
  await assertTimelineReadAccess(caseId, requesterUserId);

  const [timelineItems, progressRow] = await Promise.all([
    getCaseTimelineItemsByCaseId(caseId),
    ensureCaseUserProgressByCaseIdAndUserId(caseId, requesterUserId),
  ]);

  const progress = buildProgressSnapshot(progressRow, timelineItems);
  const unlockedTimelineItems = timelineItems.slice(0, progress.unlockedCount);

  return {
    progress,
    unlockedTimelineItems,
    unlockedPersonIds: buildUnlockedSourceIds(unlockedTimelineItems, "person"),
    unlockedDocumentIds: buildUnlockedSourceIds(unlockedTimelineItems, "document"),
  };
}
