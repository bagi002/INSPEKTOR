import { HttpError } from "../../utils/httpError.js";
import { findCaseByIdForAuthor } from "./cases.repository.js";
import {
  getCasePublishReadinessSnapshot,
  updateCasePublicationStatus,
} from "./cases.repository.publish.js";
import {
  MIN_PUBLISH_DOCUMENTS,
  MIN_PUBLISH_QUIZ_QUESTIONS,
  MIN_PUBLISH_SUSPECTS,
  MIN_PUBLISH_VICTIMS,
} from "./cases.publish.shared.js";
import { parseCaseId } from "./cases.timeline.service.shared.js";

function buildPublishReadiness(snapshot) {
  const expectedTimelineItems = snapshot.peopleCount + snapshot.documentsCount;
  const hasMinimumVictims = snapshot.victimCount >= MIN_PUBLISH_VICTIMS;
  const hasMinimumSuspects = snapshot.suspectCount >= MIN_PUBLISH_SUSPECTS;
  const hasMinimumDocuments = snapshot.documentsCount >= MIN_PUBLISH_DOCUMENTS;
  const hasMinimumQuizQuestions = snapshot.quizQuestionsCount >= MIN_PUBLISH_QUIZ_QUESTIONS;

  return {
    isReady:
      hasMinimumVictims &&
      hasMinimumSuspects &&
      hasMinimumDocuments &&
      hasMinimumQuizQuestions &&
      expectedTimelineItems > 0 &&
      snapshot.timelineItemsCount > 0 &&
      snapshot.missingTimelinePeople.length === 0 &&
      snapshot.missingTimelineDocuments.length === 0,
    totals: {
      people: snapshot.peopleCount,
      victims: snapshot.victimCount,
      suspects: snapshot.suspectCount,
      documents: snapshot.documentsCount,
      quizQuestions: snapshot.quizQuestionsCount,
      timelineItems: snapshot.timelineItemsCount,
      expectedTimelineItems,
    },
    minimums: {
      victims: MIN_PUBLISH_VICTIMS,
      suspects: MIN_PUBLISH_SUSPECTS,
      documents: MIN_PUBLISH_DOCUMENTS,
      quizQuestions: MIN_PUBLISH_QUIZ_QUESTIONS,
    },
    missing: {
      victims: hasMinimumVictims ? 0 : MIN_PUBLISH_VICTIMS - snapshot.victimCount,
      suspects: hasMinimumSuspects ? 0 : MIN_PUBLISH_SUSPECTS - snapshot.suspectCount,
      documents: hasMinimumDocuments ? 0 : MIN_PUBLISH_DOCUMENTS - snapshot.documentsCount,
      quizQuestions: hasMinimumQuizQuestions
        ? 0
        : MIN_PUBLISH_QUIZ_QUESTIONS - snapshot.quizQuestionsCount,
      timelinePeople: snapshot.missingTimelinePeople,
      timelineDocuments: snapshot.missingTimelineDocuments,
    },
  };
}

function buildPublishBlockers(readiness) {
  const blockers = [];

  if (readiness.missing.victims > 0) {
    blockers.push("Dodaj najmanje jednu žrtvu prije objave slučaja.");
  }

  if (readiness.missing.suspects > 0) {
    blockers.push("Dodaj najmanje jednog osumnjičenog prije objave slučaja.");
  }

  if (readiness.missing.documents > 0) {
    blockers.push("Dodaj najmanje jedan dokument prije objave slučaja.");
  }

  if (readiness.missing.quizQuestions > 0) {
    blockers.push(
      `Završni kviz mora imati najmanje ${readiness.minimums.quizQuestions} pitanja prije objave slučaja.`
    );
  }

  if (readiness.totals.timelineItems <= 0) {
    blockers.push("Kreiraj vremensku liniju prije objave slučaja.");
  } else if (
    readiness.missing.timelinePeople.length > 0 ||
    readiness.missing.timelineDocuments.length > 0
  ) {
    blockers.push(
      "Sve osobe i dokumenti moraju biti dodati u vremensku liniju prije objave."
    );
  }

  return blockers;
}

function formatCaseSummary(caseRow) {
  return {
    id: caseRow.id,
    publicationStatus: caseRow.publicationStatus,
    updatedAt: caseRow.updatedAt,
  };
}

async function assertAuthorAccess(caseId, requesterUserId) {
  const caseRow = await findCaseByIdForAuthor(caseId, requesterUserId);
  if (!caseRow) {
    throw new HttpError(404, "Slučaj nije pronađen ili nemaš pristup ovom slučaju.");
  }

  return caseRow;
}

export async function publishCreatorCase(caseIdInput, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  const caseRow = await assertAuthorAccess(caseId, requesterUserId);

  if (caseRow.publicationStatus === "published") {
    return {
      caseId,
      alreadyPublished: true,
      case: formatCaseSummary(caseRow),
      readiness: null,
    };
  }

  const snapshot = await getCasePublishReadinessSnapshot(caseId);
  const readiness = buildPublishReadiness(snapshot);
  const blockers = buildPublishBlockers(readiness);

  if (blockers.length > 0) {
    throw new HttpError(400, "Slučaj nije spreman za objavu.", {
      publish: blockers,
      readiness,
    });
  }

  await updateCasePublicationStatus(caseId, "published");
  const publishedCaseRow = await assertAuthorAccess(caseId, requesterUserId);

  return {
    caseId,
    alreadyPublished: false,
    case: formatCaseSummary(publishedCaseRow),
    readiness,
  };
}
