import {
  IMAGE_EVIDENCE_SUPPORTED_TYPES,
  TYPE_SPECIFIC_FIELDS_BY_DOCUMENT_TYPE,
} from "./caseDocumentTypeSpecificDefinitions";

function toInitialValueByFieldType(field) {
  if (field.inputType === "checkbox") {
    return false;
  }

  return "";
}

export function getTypeSpecificFieldsForDocumentType(documentType) {
  return TYPE_SPECIFIC_FIELDS_BY_DOCUMENT_TYPE[documentType] || [];
}

export function buildTypeSpecificDefaults(documentType) {
  const fields = getTypeSpecificFieldsForDocumentType(documentType);
  const defaults = {};

  fields.forEach((field) => {
    defaults[field.name] = toInitialValueByFieldType(field);
  });

  return defaults;
}

export function getTypeSpecificFieldByName(documentType, fieldName) {
  return getTypeSpecificFieldsForDocumentType(documentType).find((field) => field.name === fieldName) || null;
}

export function supportsImageEvidenceForDocumentType(documentType) {
  return IMAGE_EVIDENCE_SUPPORTED_TYPES.has(documentType);
}
