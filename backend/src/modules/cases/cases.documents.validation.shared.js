const DOCUMENT_CLASSIFICATION_LEVELS = new Set([
  "interno",
  "povjerljivo",
  "strogo_povjerljivo",
  "javno",
]);

const DOCUMENT_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const DOCUMENT_IMAGE_MAX_COUNT = 8;
export const DOCUMENT_IMAGE_MAX_LENGTH = 2_800_000;

export const STATEMENT_DOCUMENT_TYPES = new Set([
  "witness_statement",
  "suspect_statement",
  "victim_statement",
]);

export const POLICE_DOCUMENT_TYPES = new Set(["police_report", "forensic_report"]);
export const IMAGE_EVIDENCE_SUPPORTED_DOCUMENT_TYPES = new Set([
  "police_report",
  "forensic_report",
]);

export const WITNESS_RELIABILITY_LEVELS = new Set(["low", "medium", "high"]);
export const SUSPECT_STATEMENT_STANCES = new Set(["denies", "partial", "full", "silent"]);
export const VICTIM_INJURY_LEVELS = new Set(["none", "minor", "serious", "critical"]);
export const THREAT_PERCEPTION_LEVELS = new Set(["low", "medium", "high", "critical"]);
export const INCIDENT_CATEGORIES = new Set(["theft", "assault", "homicide", "fraud", "other"]);
export const FORENSIC_TRACE_TYPES = new Set([
  "biological",
  "chemical",
  "digital",
  "ballistic",
  "mixed",
]);

export function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function toInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = toText(value).toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return false;
}

export function sanitizeDocumentType(value, allowedTypes, fallbackType) {
  const normalized = toText(value).toLowerCase();
  if (allowedTypes.has(normalized)) {
    return normalized;
  }

  return fallbackType;
}

export function sanitizeClassificationLevel(value) {
  const normalized = toText(value).toLowerCase() || "interno";
  return DOCUMENT_CLASSIFICATION_LEVELS.has(normalized) ? normalized : null;
}

export function sanitizeRecordedAt(value) {
  const recordedAt = toText(value);
  if (recordedAt.length === 0) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2})?$/.test(recordedAt)) {
    return recordedAt.replace(" ", "T");
  }

  return null;
}

export function sanitizeRelatedPersonIds(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const unique = new Set();
  for (const candidate of value) {
    const parsed = toInteger(candidate);
    if (parsed === null || parsed <= 0) {
      return null;
    }

    unique.add(parsed);
  }

  return Array.from(unique);
}

export function sanitizeKnownValue(value, optionsSet) {
  const normalized = toText(value).toLowerCase();
  if (normalized.length === 0) {
    return "";
  }

  return optionsSet.has(normalized) ? normalized : null;
}

export function sanitizeImageEvidence(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length > DOCUMENT_IMAGE_MAX_COUNT) {
    return null;
  }

  for (const imageDataUrlCandidate of value) {
    const imageDataUrl = toText(imageDataUrlCandidate);
    const mimeMatch = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    if (!mimeMatch) {
      return null;
    }

    if (!DOCUMENT_IMAGE_MIME_TYPES.includes(mimeMatch[1])) {
      return null;
    }

    if (imageDataUrl.length > DOCUMENT_IMAGE_MAX_LENGTH) {
      return null;
    }
  }

  return value.map((imageDataUrl) => toText(imageDataUrl));
}
