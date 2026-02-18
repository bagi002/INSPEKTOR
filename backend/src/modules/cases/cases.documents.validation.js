import {
  DOCUMENT_IMAGE_MAX_COUNT,
  IMAGE_EVIDENCE_SUPPORTED_DOCUMENT_TYPES,
  POLICE_DOCUMENT_TYPES,
  STATEMENT_DOCUMENT_TYPES,
  sanitizeClassificationLevel,
  sanitizeDocumentType,
  sanitizeImageEvidence,
  sanitizeRecordedAt,
  sanitizeRelatedPersonIds,
  toBoolean,
  toInteger,
  toText,
} from "./cases.documents.validation.shared.js";
import { validateTypeSpecificMetadata } from "./cases.documents.validation.typeSpecific.js";

const MAX_TITLE_LENGTH = 180;
const MAX_CONTENT_LENGTH = 12_000;
const MAX_LOCATION_LENGTH = 140;
const MAX_NAME_LENGTH = 120;
const MAX_BADGE_LENGTH = 40;
const MAX_EVIDENCE_REF_LENGTH = 160;
const MAX_NOTES_LENGTH = 2_500;

function validateCommonPayload(payload, { allowedTypes, fallbackType, requiresGiverPerson }) {
  const errors = {};

  const requestedDocumentType = toText(payload?.documentType).toLowerCase();
  const documentType = sanitizeDocumentType(payload?.documentType, allowedTypes, fallbackType);
  const title = toText(payload?.title);
  const content = toText(payload?.content);
  const sequenceOrderCandidate = toInteger(payload?.sequenceOrder);
  const sequenceOrder = sequenceOrderCandidate === null ? 1 : sequenceOrderCandidate;
  const isUnlockedByDefault = toBoolean(payload?.isUnlockedByDefault);

  const recordedAt = sanitizeRecordedAt(payload?.recordedAt);
  const location = toText(payload?.location);
  const classificationLevel = sanitizeClassificationLevel(payload?.classificationLevel);
  const officerName = toText(payload?.officerName);
  const badgeNumber = toText(payload?.badgeNumber);
  const department = toText(payload?.department);
  const evidenceReference = toText(payload?.evidenceReference);
  const legalReference = toText(payload?.legalReference);
  const notes = toText(payload?.notes);
  const relatedPersonIds = sanitizeRelatedPersonIds(payload?.relatedPersonIds);
  const rawImageEvidence = payload?.imageEvidence;
  const hasImageEvidenceInput = rawImageEvidence !== undefined && rawImageEvidence !== null;
  const typeSpecific = validateTypeSpecificMetadata(documentType, payload?.typeSpecific, errors);
  const supportsImageEvidence = IMAGE_EVIDENCE_SUPPORTED_DOCUMENT_TYPES.has(documentType);

  const hasGiverInput =
    payload?.giverPersonId !== undefined &&
    payload?.giverPersonId !== null &&
    String(payload?.giverPersonId).trim().length > 0;
  const giverPersonId = hasGiverInput ? toInteger(payload?.giverPersonId) : null;
  let imageEvidence = [];

  if (title.length < 3) {
    errors.title = "Naslov dokumenta mora imati najmanje 3 karaktera.";
  }
  if (requestedDocumentType.length > 0 && !allowedTypes.has(requestedDocumentType)) {
    errors.documentType = "Tip dokumenta nije podržan za izabranu sekciju.";
  }
  if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Naslov dokumenta može imati najviše ${MAX_TITLE_LENGTH} karaktera.`;
  }

  if (content.length < 30) {
    errors.content = "Sadržaj dokumenta mora imati najmanje 30 karaktera.";
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    errors.content = `Sadržaj dokumenta može imati najviše ${MAX_CONTENT_LENGTH} karaktera.`;
  }

  if (sequenceOrder <= 0 || sequenceOrder > 9999) {
    errors.sequenceOrder = "Redosled mora biti ceo broj između 1 i 9999.";
  }

  if (recordedAt === null) {
    errors.recordedAt = "Datum/vrijeme mora biti u formatu YYYY-MM-DD ili YYYY-MM-DDTHH:mm.";
  }

  if (location.length > MAX_LOCATION_LENGTH) {
    errors.location = `Lokacija može imati najviše ${MAX_LOCATION_LENGTH} karaktera.`;
  }

  if (!classificationLevel) {
    errors.classificationLevel = "Klasifikacija dokumenta nije podržana.";
  }

  if (officerName.length > MAX_NAME_LENGTH) {
    errors.officerName = `Ime službenika može imati najviše ${MAX_NAME_LENGTH} karaktera.`;
  }

  if (badgeNumber.length > MAX_BADGE_LENGTH) {
    errors.badgeNumber = `Broj značke može imati najviše ${MAX_BADGE_LENGTH} karaktera.`;
  }

  if (department.length > MAX_NAME_LENGTH) {
    errors.department = `Jedinica može imati najviše ${MAX_NAME_LENGTH} karaktera.`;
  }

  if (evidenceReference.length > MAX_EVIDENCE_REF_LENGTH) {
    errors.evidenceReference =
      `Referenca dokaza može imati najviše ${MAX_EVIDENCE_REF_LENGTH} karaktera.`;
  }

  if (legalReference.length > MAX_EVIDENCE_REF_LENGTH) {
    errors.legalReference =
      `Pravna referenca može imati najviše ${MAX_EVIDENCE_REF_LENGTH} karaktera.`;
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Napomene mogu imati najviše ${MAX_NOTES_LENGTH} karaktera.`;
  }

  if (relatedPersonIds === null) {
    errors.relatedPersonIds = "Povezane osobe moraju biti lista validnih identifikatora.";
  }

  if (supportsImageEvidence) {
    const normalizedImageEvidence = sanitizeImageEvidence(rawImageEvidence);
    if (normalizedImageEvidence === null) {
      errors.imageEvidence =
        `Fotodokumentacija mora biti lista do ${DOCUMENT_IMAGE_MAX_COUNT} validnih slika (JPEG, PNG ili WEBP).`;
    }
    imageEvidence = normalizedImageEvidence || [];
  } else if (Array.isArray(rawImageEvidence) && rawImageEvidence.length > 0) {
    errors.imageEvidence =
      "Slike su dozvoljene samo za policijske izvjestaje i forenzicke nalaze.";
  } else if (hasImageEvidenceInput && !Array.isArray(rawImageEvidence)) {
    errors.imageEvidence = "Fotodokumentacija mora biti lista slika.";
  }

  if (hasGiverInput && (giverPersonId === null || giverPersonId <= 0)) {
    errors.giverPersonId = "Davalac izjave mora biti validna osoba u slučaju.";
  }

  if (requiresGiverPerson && !giverPersonId) {
    errors.giverPersonId = "Izjava mora imati izabranu osobu koja je dala izjavu.";
  }

  const normalizedRelatedIds = relatedPersonIds || [];
  const normalizedGiverId = requiresGiverPerson ? giverPersonId : null;

  if (normalizedGiverId && !normalizedRelatedIds.includes(normalizedGiverId)) {
    normalizedRelatedIds.push(normalizedGiverId);
  }

  return {
    errors,
    sanitized: {
      documentType,
      title,
      content,
      sequenceOrder,
      isUnlockedByDefault,
      metadata: {
        classificationLevel: classificationLevel || "interno",
        recordedAt: recordedAt || "",
        location,
        officerName,
        badgeNumber,
        department,
        evidenceReference,
        legalReference,
        notes,
        giverPersonId: normalizedGiverId || null,
        relatedPersonIds: normalizedRelatedIds,
        typeSpecific,
        imageEvidence,
      },
    },
  };
}

export function validateCreateCaseStatementPayload(payload) {
  return validateCommonPayload(payload, {
    allowedTypes: STATEMENT_DOCUMENT_TYPES,
    fallbackType: "witness_statement",
    requiresGiverPerson: true,
  });
}

export function validateCreateCasePoliceDocumentPayload(payload) {
  return validateCommonPayload(payload, {
    allowedTypes: POLICE_DOCUMENT_TYPES,
    fallbackType: "police_report",
    requiresGiverPerson: false,
  });
}
