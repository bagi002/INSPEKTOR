import { HttpError } from "../../utils/httpError.js";
import { findCaseByIdForAuthor } from "./cases.repository.js";
import {
  getCasePublishReadinessSnapshot,
  updateCasePublicationStatus,
} from "./cases.repository.publish.js";
import {
  REQUIRED_PUBLISH_DOCUMENT_TYPE_LABELS,
  REQUIRED_PUBLISH_DOCUMENT_TYPES,
} from "./cases.publish.shared.js";
import { parseCaseId } from "./cases.timeline.service.shared.js";

function buildRequiredDocumentTypeSummaries(documentCountByType) {
  return REQUIRED_PUBLISH_DOCUMENT_TYPES.map((documentType) => {
    const total = Number.isInteger(documentCountByType?.[documentType])
      ? documentCountByType[documentType]
      : 0;

    return {
      documentType,
      label: REQUIRED_PUBLISH_DOCUMENT_TYPE_LABELS[documentType] || documentType,
      total,
      isPresent: total > 0,
    };
  });
}

function buildPublishReadiness(snapshot) {
  const requiredDocumentTypes = buildRequiredDocumentTypeSummaries(snapshot.documentCountByType);
  const missingRequiredDocumentTypes = requiredDocumentTypes.filter((item) => !item.isPresent);
  const expectedTimelineItems = snapshot.peopleCount + snapshot.documentsCount;

  return {
    isReady:
      snapshot.peopleCount > 0 &&
      missingRequiredDocumentTypes.length === 0 &&
      expectedTimelineItems > 0 &&
      snapshot.timelineItemsCount > 0 &&
      snapshot.missingTimelinePeople.length === 0 &&
      snapshot.missingTimelineDocuments.length === 0,
    totals: {
      people: snapshot.peopleCount,
      documents: snapshot.documentsCount,
      timelineItems: snapshot.timelineItemsCount,
      expectedTimelineItems,
    },
    requiredDocumentTypes,
    missing: {
      requiredDocumentTypes: missingRequiredDocumentTypes,
      timelinePeople: snapshot.missingTimelinePeople,
      timelineDocuments: snapshot.missingTimelineDocuments,
    },
  };
}

function buildPublishBlockers(readiness) {
  const blockers = [];

  if (readiness.totals.people <= 0) {
    blockers.push("Dodaj najmanje jednu osobu i dosije prije objave slučaja.");
  }

  if (readiness.missing.requiredDocumentTypes.length > 0) {
    const labels = readiness.missing.requiredDocumentTypes.map((item) => item.label);
    blockers.push(
      `Nedostaju obavezni tipovi dokumenata za objavu: ${labels.join(", ")}.`
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
