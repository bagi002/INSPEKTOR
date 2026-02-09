const CASE_PUBLICATION_STATUSES = new Set(["draft", "published"]);
const CASE_DOCUMENT_TYPES = new Set([
  "police_report",
  "forensic_report",
  "dossier",
  "witness_statement",
  "suspect_statement",
  "victim_statement",
]);
const CASE_PERSON_ROLES = new Set(["unknown", "suspect", "victim", "witness"]);
const CASE_PROGRESS_STATUSES = new Set(["in_progress", "resolved"]);
function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}
function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function sanitizePublicationStatus(value) {
  const status = toText(value).toLowerCase() || "draft";
  return CASE_PUBLICATION_STATUSES.has(status) ? status : null;
}

function sanitizePersonRole(value) {
  const role = toText(value).toLowerCase() || "unknown";
  return CASE_PERSON_ROLES.has(role) ? role : null;
}

function sanitizeDocumentType(value) {
  const type = toText(value).toLowerCase();
  return CASE_DOCUMENT_TYPES.has(type) ? type : null;
}

function sanitizeProgressStatus(value) {
  const status = toText(value).toLowerCase() || "in_progress";
  return CASE_PROGRESS_STATUSES.has(status) ? status : null;
}

function validatePeople(rawPeople, errors) {
  if (!Array.isArray(rawPeople)) {
    return [];
  }

  return rawPeople.map((person, index) => {
    const fullName = toText(person?.fullName);
    const apparentRole = sanitizePersonRole(person?.apparentRole);
    const biography = toText(person?.biography);

    if (fullName.length < 2) {
      errors[`people.${index}.fullName`] = "Ime osobe mora imati najmanje 2 karaktera.";
    }

    if (!apparentRole) {
      errors[`people.${index}.apparentRole`] = "Uloga osobe nije podrzana.";
    }

    return {
      fullName,
      apparentRole: apparentRole || "unknown",
      biography,
    };
  });
}

function validateDocuments(rawDocuments, errors) {
  if (!Array.isArray(rawDocuments)) {
    return [];
  }

  return rawDocuments.map((document, index) => {
    const documentType = sanitizeDocumentType(document?.documentType);
    const title = toText(document?.title);
    const content = toText(document?.content);
    const sequenceOrder = Math.max(1, toInteger(document?.sequenceOrder, index + 1));
    const isUnlockedByDefault = Boolean(document?.isUnlockedByDefault);

    if (!documentType) {
      errors[`documents.${index}.documentType`] = "Tip dokumenta nije podrzan.";
    }
    if (title.length < 3) {
      errors[`documents.${index}.title`] = "Naslov dokumenta mora imati najmanje 3 karaktera.";
    }
    if (content.length < 10) {
      errors[`documents.${index}.content`] = "Sadrzaj dokumenta mora imati najmanje 10 karaktera.";
    }

    return {
      documentType: documentType || "police_report",
      title,
      content,
      sequenceOrder,
      isUnlockedByDefault,
    };
  });
}

function validateTimeline(rawTimeline, errors) {
  if (!Array.isArray(rawTimeline)) {
    return [];
  }

  return rawTimeline.map((item, index) => {
    const itemType = toText(item?.itemType).toLowerCase();
    const sourceIndex = toInteger(item?.sourceIndex, -1);
    const unlockOrder = Math.max(1, toInteger(item?.unlockOrder, index + 1));
    const unlockNote = toText(item?.unlockNote);

    if (itemType !== "person" && itemType !== "document") {
      errors[`timeline.${index}.itemType`] = "Timeline stavka mora biti person ili document.";
    }

    if (sourceIndex < 0) {
      errors[`timeline.${index}.sourceIndex`] =
        "Timeline stavka mora referencirati postojecu osobu ili dokument.";
    }
    return {
      itemType: itemType === "person" || itemType === "document" ? itemType : "document",
      sourceIndex,
      unlockOrder,
      unlockNote,
    };
  });
}

function validateProgressItems(rawProgress, errors) {
  if (!Array.isArray(rawProgress)) {
    return [];
  }

  return rawProgress.map((item, index) => {
    const userId = toInteger(item?.userId, 0);
    const progressStatus = sanitizeProgressStatus(item?.progressStatus);
    const progressPercent = Math.min(100, Math.max(0, toInteger(item?.progressPercent, 0)));
    const ratingCandidate = item?.userRating;
    const userRating =
      ratingCandidate === undefined || ratingCandidate === null
        ? null
        : Math.min(5, Math.max(0, toNumber(ratingCandidate, 0)));

    if (userId <= 0) {
      errors[`progress.${index}.userId`] = "Napredak mora imati validan userId.";
    }
    if (!progressStatus) {
      errors[`progress.${index}.progressStatus`] = "Status napretka nije podrzan.";
    }

    return {
      userId,
      progressStatus: progressStatus || "in_progress",
      progressPercent,
      userRating,
    };
  });
}

export function validateCreateCasePayload(payload) {
  const errors = {};
  const title = toText(payload?.title);
  const description = toText(payload?.description);
  const publicationStatus = sanitizePublicationStatus(payload?.publicationStatus);
  const people = validatePeople(payload?.people, errors);
  const documents = validateDocuments(payload?.documents, errors);
  const timeline = validateTimeline(payload?.timeline, errors);
  const progress = validateProgressItems(payload?.progress, errors);

  if (title.length < 3) {
    errors.title = "Naziv slucaja mora imati najmanje 3 karaktera.";
  }

  if (description.length < 20) {
    errors.description = "Opis slucaja mora imati najmanje 20 karaktera.";
  }

  if (!publicationStatus) {
    errors.publicationStatus = "Status objave mora biti draft ili published.";
  }

  return {
    errors,
    sanitized: {
      title,
      description,
      publicationStatus: publicationStatus || "draft",
      people,
      documents,
      timeline,
      progress,
    },
  };
}
