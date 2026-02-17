import {
  ensureCaseUserProgressByCaseIdAndUserId,
  normalizeCaseUserProgressForTimeline,
  upsertCaseUserProgress,
} from "./cases.repository.progress.js";
import {
  getCaseTimelineDocumentSourcesByCaseId,
  getCaseTimelineItemsByCaseId,
  getCaseTimelinePeopleSourcesByCaseId,
  replaceCaseTimelineItems,
} from "./cases.repository.timeline.js";
import { validateReplaceCaseTimelinePayload } from "./cases.timeline.validation.js";
import {
  assertTimelineReadAccess,
  assertTimelineWriteAccess,
  buildAvailableSourceSets,
  buildProgressSnapshot,
  parseCaseId,
  shouldPersistProgress,
  throwValidationIfNeeded,
} from "./cases.timeline.service.shared.js";

export async function getCreatorCaseTimeline(caseIdInput, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertTimelineReadAccess(caseId, requesterUserId);

  const [items, people, documents, progressRow] = await Promise.all([
    getCaseTimelineItemsByCaseId(caseId),
    getCaseTimelinePeopleSourcesByCaseId(caseId),
    getCaseTimelineDocumentSourcesByCaseId(caseId),
    ensureCaseUserProgressByCaseIdAndUserId(caseId, requesterUserId),
  ]);

  const userProgress = buildProgressSnapshot(progressRow, items);
  if (shouldPersistProgress(progressRow, userProgress)) {
    await upsertCaseUserProgress(caseId, requesterUserId, userProgress);
  }

  return {
    caseId,
    total: items.length,
    items,
    people,
    documents,
    userProgress,
  };
}

export async function replaceCreatorCaseTimeline(caseIdInput, payload, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertTimelineWriteAccess(caseId, requesterUserId);

  const [people, documents] = await Promise.all([
    getCaseTimelinePeopleSourcesByCaseId(caseId),
    getCaseTimelineDocumentSourcesByCaseId(caseId),
  ]);

  const availableSources = buildAvailableSourceSets(people, documents);
  const { errors, sanitized } = validateReplaceCaseTimelinePayload(payload, availableSources);
  throwValidationIfNeeded(errors, "Podaci vremenske linije nisu validni.");

  await replaceCaseTimelineItems(caseId, sanitized);
  const updatedItems = await getCaseTimelineItemsByCaseId(caseId);
  await normalizeCaseUserProgressForTimeline(caseId, updatedItems.length);

  return {
    caseId,
    total: updatedItems.length,
    items: updatedItems,
    people,
    documents,
  };
}

export async function advanceCaseTimeline(caseIdInput, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertTimelineReadAccess(caseId, requesterUserId);

  const [items, progressRow] = await Promise.all([
    getCaseTimelineItemsByCaseId(caseId),
    ensureCaseUserProgressByCaseIdAndUserId(caseId, requesterUserId),
  ]);

  const currentProgress = buildProgressSnapshot(progressRow, items);
  if (!currentProgress.hasNextItem) {
    return {
      caseId,
      total: items.length,
      items,
      userProgress: currentProgress,
      hasNewUnlock: false,
      unlockedItem: currentProgress.unlockedCount > 0 ? items[currentProgress.unlockedCount - 1] : null,
    };
  }

  const nextUnlockedCount = currentProgress.unlockedCount + 1;
  const nextProgress = buildProgressSnapshot(progressRow, items, nextUnlockedCount);
  await upsertCaseUserProgress(caseId, requesterUserId, nextProgress);

  return {
    caseId,
    total: items.length,
    items,
    userProgress: nextProgress,
    hasNewUnlock: true,
    unlockedItem: items[nextUnlockedCount - 1] || null,
  };
}
