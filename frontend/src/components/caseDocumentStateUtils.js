import {
  CASE_DOCUMENT_CATEGORIES,
  getCaseDocumentTabConfig,
} from "./caseDocumentConfig";
import {
  MAX_DOCUMENT_IMAGE_COUNT,
  MAX_DOCUMENT_IMAGE_FILE_SIZE_BYTES,
} from "./caseDocumentUploadUtils";
import {
  buildTypeSpecificDefaults,
  getTypeSpecificFieldByName,
  getTypeSpecificFieldsForDocumentType,
  supportsImageEvidenceForDocumentType,
} from "./caseDocumentTypeSpecificConfig";

export {
  MAX_DOCUMENT_IMAGE_COUNT,
  MAX_DOCUMENT_IMAGE_FILE_SIZE_BYTES,
  supportsImageEvidenceForDocumentType,
};

export function buildInitialCaseDocumentFormData(category) {
  const tabConfig = getCaseDocumentTabConfig(category);
  const documentType = tabConfig.documentTypeOptions[0]?.value || "witness_statement";

  return {
    documentType,
    title: "",
    content: "",
    sequenceOrder: "1",
    isUnlockedByDefault: false,
    classificationLevel: "interno",
    recordedAt: "",
    location: "",
    officerName: "",
    badgeNumber: "",
    department: "",
    evidenceReference: "",
    legalReference: "",
    notes: "",
    giverPersonId: "",
    relatedPersonIds: [],
    typeSpecific: buildTypeSpecificDefaults(documentType),
    imageEvidence: [],
  };
}

function toSafeString(value, fallback = "") {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value);
}

export function normalizeCaseDocumentFieldValue({ type, checked, value }) {
  if (type === "checkbox") {
    return checked;
  }

  return value;
}

export function normalizeTypeSpecificFieldValue(documentType, fieldName, eventLike) {
  const field = getTypeSpecificFieldByName(documentType, fieldName);
  if (!field) {
    return eventLike?.value;
  }

  if (field.inputType === "checkbox") {
    return Boolean(eventLike?.checked);
  }

  return String(eventLike?.value || "");
}

export function toggleRelatedPersonIds(currentIds, personId, isChecked) {
  const parsedPersonId = Number.parseInt(personId, 10);
  if (!Number.isInteger(parsedPersonId) || parsedPersonId <= 0) {
    return currentIds;
  }

  const currentSet = new Set((currentIds || []).map((id) => Number.parseInt(id, 10)).filter(Boolean));
  if (isChecked) {
    currentSet.add(parsedPersonId);
  } else {
    currentSet.delete(parsedPersonId);
  }

  return Array.from(currentSet);
}

export function buildCreateCaseDocumentPayload(formData, category) {
  const relatedPersonIds = (formData.relatedPersonIds || [])
    .map((personId) => Number.parseInt(personId, 10))
    .filter((personId) => Number.isInteger(personId) && personId > 0);

  const typeSpecific = {};
  const fields = getTypeSpecificFieldsForDocumentType(formData.documentType);
  fields.forEach((field) => {
    const rawValue = formData.typeSpecific?.[field.name];
    typeSpecific[field.name] = field.inputType === "checkbox" ? Boolean(rawValue) : String(rawValue || "").trim();
  });

  const payload = {
    documentType: (formData.documentType || "").trim(),
    title: (formData.title || "").trim(),
    content: (formData.content || "").trim(),
    sequenceOrder: Number.parseInt(formData.sequenceOrder, 10),
    isUnlockedByDefault: Boolean(formData.isUnlockedByDefault),
    classificationLevel: (formData.classificationLevel || "").trim(),
    recordedAt: (formData.recordedAt || "").trim(),
    location: (formData.location || "").trim(),
    officerName: (formData.officerName || "").trim(),
    badgeNumber: (formData.badgeNumber || "").trim(),
    department: (formData.department || "").trim(),
    evidenceReference: (formData.evidenceReference || "").trim(),
    legalReference: (formData.legalReference || "").trim(),
    notes: (formData.notes || "").trim(),
    relatedPersonIds,
    typeSpecific,
    imageEvidence: supportsImageEvidenceForDocumentType(formData.documentType)
      ? [...(formData.imageEvidence || [])]
      : [],
  };

  if (category === CASE_DOCUMENT_CATEGORIES.STATEMENTS) {
    const giverPersonId = Number.parseInt(formData.giverPersonId, 10);
    payload.giverPersonId = Number.isInteger(giverPersonId) && giverPersonId > 0 ? giverPersonId : null;
  }

  return payload;
}

export function buildCaseDocumentFormDataFromDocument(document, category) {
  const base = buildInitialCaseDocumentFormData(category);
  if (!document) {
    return base;
  }

  const metadata = document.metadata || {};
  const documentType = toSafeString(document.documentType, base.documentType);
  const typeSpecificDefaults = buildTypeSpecificDefaults(documentType);
  const typeSpecific = { ...typeSpecificDefaults, ...(metadata.typeSpecific || {}) };

  return {
    ...base,
    documentType,
    title: toSafeString(document.title),
    content: toSafeString(document.content),
    sequenceOrder: toSafeString(document.sequenceOrder, "1"),
    isUnlockedByDefault: Boolean(document.isUnlockedByDefault),
    classificationLevel: toSafeString(metadata.classificationLevel, "interno"),
    recordedAt: toSafeString(metadata.recordedAt),
    location: toSafeString(metadata.location),
    officerName: toSafeString(metadata.officerName),
    badgeNumber: toSafeString(metadata.badgeNumber),
    department: toSafeString(metadata.department),
    evidenceReference: toSafeString(metadata.evidenceReference),
    legalReference: toSafeString(metadata.legalReference),
    notes: toSafeString(metadata.notes),
    giverPersonId: metadata.giverPersonId ? String(metadata.giverPersonId) : "",
    relatedPersonIds: Array.isArray(metadata.relatedPersonIds)
      ? metadata.relatedPersonIds
          .map((personId) => Number.parseInt(personId, 10))
          .filter((personId) => Number.isInteger(personId) && personId > 0)
      : [],
    typeSpecific,
    imageEvidence: Array.isArray(metadata.imageEvidence) ? [...metadata.imageEvidence] : [],
  };
}
