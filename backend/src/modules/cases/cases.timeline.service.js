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
import { getCasePersonRoleSelectionsByPersonIds } from "./cases.repository.people.roles.js";
import { CASE_PERSON_UNKNOWN_ROLE } from "./cases.solve.roles.shared.js";
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

function applySolveRolesToPeople(people, selectedRolesByPersonId) {
  return people.map((person) => ({
    ...person,
    apparentRole: selectedRolesByPersonId.get(person.id) || CASE_PERSON_UNKNOWN_ROLE,
  }));
}

function applySolveRolesToTimelineItems(items, selectedRolesByPersonId) {
  return items.map((item) => {
    if (item.itemType !== "person") {
      return item;
    }

    return {
      ...item,
      sourceMeta: {
        ...(item.sourceMeta || {}),
        apparentRole: selectedRolesByPersonId.get(item.sourceId) || CASE_PERSON_UNKNOWN_ROLE,
      },
    };
  });
}

async function resolveSolveRoleViews(caseId, requesterUserId, people, items) {
  const selectedRolesByPersonId = await getCasePersonRoleSelectionsByPersonIds(
    caseId,
    requesterUserId,
    people.map((person) => person.id)
  );

  return {
    people: applySolveRolesToPeople(people, selectedRolesByPersonId),
    items: applySolveRolesToTimelineItems(items, selectedRolesByPersonId),
  };
}

export async function getCreatorCaseTimeline(caseIdInput, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  const caseRow = await assertTimelineReadAccess(caseId, requesterUserId);

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

  if (caseRow.authorUserId !== requesterUserId) {
    const solveRoleViews = await resolveSolveRoleViews(caseId, requesterUserId, people, items);
    return {
      caseId,
      total: solveRoleViews.items.length,
      items: solveRoleViews.items,
      people: solveRoleViews.people,
      documents,
      userProgress,
    };
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
  const caseRow = await assertTimelineReadAccess(caseId, requesterUserId);

  const [items, progressRow, people] = await Promise.all([
    getCaseTimelineItemsByCaseId(caseId),
    ensureCaseUserProgressByCaseIdAndUserId(caseId, requesterUserId),
    getCaseTimelinePeopleSourcesByCaseId(caseId),
  ]);

  const currentProgress = buildProgressSnapshot(progressRow, items);
  const isSolveUser = caseRow.authorUserId !== requesterUserId;

  if (!currentProgress.hasNextItem) {
    const solveRoleViews = isSolveUser
      ? await resolveSolveRoleViews(caseId, requesterUserId, people, items)
      : { people, items };

    return {
      caseId,
      total: solveRoleViews.items.length,
      items: solveRoleViews.items,
      userProgress: currentProgress,
      hasNewUnlock: false,
      unlockedItem:
        currentProgress.unlockedCount > 0
          ? solveRoleViews.items[currentProgress.unlockedCount - 1] || null
          : null,
    };
  }

  const nextUnlockedCount = currentProgress.unlockedCount + 1;
  const nextProgress = buildProgressSnapshot(progressRow, items, nextUnlockedCount);
  await upsertCaseUserProgress(caseId, requesterUserId, nextProgress);

  const solveRoleViews = isSolveUser
    ? await resolveSolveRoleViews(caseId, requesterUserId, people, items)
    : { people, items };

  return {
    caseId,
    total: solveRoleViews.items.length,
    items: solveRoleViews.items,
    userProgress: nextProgress,
    hasNewUnlock: true,
    unlockedItem: solveRoleViews.items[nextUnlockedCount - 1] || null,
  };
}
