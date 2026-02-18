import { CASE_DOCUMENT_CLASSIFICATION_OPTIONS } from "./caseDocumentConfig";
import { toRoleLabel } from "./casePeopleHelpers";
import { getTypeSpecificFieldsForDocumentType } from "./caseDocumentTypeSpecificConfig";

const DOCUMENT_TYPE_LABELS = {
  police_report: "Policijski izvještaj",
  forensic_report: "Forenzički nalaz",
  witness_statement: "Izjava svjedoka",
  suspect_statement: "Izjava osumnjičenog",
  victim_statement: "Izjava žrtve",
};

function toLabel(options, value, fallback) {
  const option = options.find((item) => item.value === value);
  return option?.label || fallback;
}

export function toDocumentTypeLabel(documentType) {
  return DOCUMENT_TYPE_LABELS[documentType] || "Dokument";
}

export function toClassificationLabel(classificationLevel) {
  return toLabel(CASE_DOCUMENT_CLASSIFICATION_OPTIONS, classificationLevel, "Interno");
}

export function formatRecordedAt(recordedAt) {
  if (!recordedAt) {
    return "Nije evidentirano";
  }

  return String(recordedAt).replace("T", " ");
}

export function normalizeSearchText(value) {
  return String(value || "").toLowerCase().trim();
}

export function toPersonRoleLabel(apparentRole) {
  return toRoleLabel(apparentRole);
}

export function buildDocumentStats(documents) {
  return [
    { label: "Ukupno", value: documents.length },
    {
      label: "Otključani",
      value: documents.filter((document) => document.isUnlockedByDefault).length,
    },
    {
      label: "Sa osobama",
      value: documents.filter((document) => (document.relatedPeople || []).length > 0).length,
    },
    {
      label: "Sa lokacijom",
      value: documents.filter((document) => (document.metadata?.location || "").length > 0).length,
    },
    {
      label: "Sa slikama",
      value: documents.filter((document) => (document.metadata?.imageEvidence || []).length > 0).length,
    },
  ];
}

function toYesNo(value) {
  return value ? "Da" : "Ne";
}

function resolveTypeSpecificFieldValue(field, rawValue) {
  if (field.inputType === "checkbox") {
    return toYesNo(Boolean(rawValue));
  }

  if (field.inputType === "select") {
    const option = (field.options || []).find((item) => item.value === rawValue);
    return option?.label || "";
  }

  if (rawValue === undefined || rawValue === null) {
    return "";
  }

  return String(rawValue).trim();
}

export function buildTypeSpecificRows(documentType, typeSpecific) {
  const fields = getTypeSpecificFieldsForDocumentType(documentType);
  return fields.map((field) => ({
    label: field.label,
    value: resolveTypeSpecificFieldValue(field, typeSpecific?.[field.name]),
  }));
}
