const CASE_PERSON_ROLES = new Set(["unknown", "suspect", "victim", "witness"]);
const CASE_DOSSIER_RISK_LEVELS = new Set(["unknown", "low", "medium", "high", "critical"]);
export const CASE_DOSSIER_GENDER_OPTIONS = new Set(["unknown", "male", "female", "non_binary"]);
export const CASE_DOSSIER_MARITAL_STATUS_OPTIONS = new Set([
  "unknown",
  "single",
  "married",
  "divorced",
  "widowed",
  "separated",
]);
export const CASE_DOSSIER_NATIONALITY_OPTIONS = new Set([
  "unknown",
  "ba",
  "rs",
  "hr",
  "me",
  "mk",
  "si",
  "other",
]);
export const CASE_DOSSIER_EDUCATION_OPTIONS = new Set([
  "unknown",
  "elementary",
  "high_school",
  "college",
  "bachelor",
  "master",
  "doctorate",
]);
export const CASE_DOSSIER_EYE_COLOR_OPTIONS = new Set([
  "unknown",
  "brown",
  "blue",
  "green",
  "hazel",
  "gray",
  "black",
]);
export const CASE_DOSSIER_HAIR_COLOR_OPTIONS = new Set([
  "unknown",
  "black",
  "brown",
  "blonde",
  "red",
  "gray",
  "white",
  "other",
]);
const CASE_DOSSIER_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const CASE_DOSSIER_PHOTO_MAX_LENGTH = 2_800_000;

export function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function toInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function toDateText(value) {
  const text = toText(value);
  if (text.length === 0) {
    return "";
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

export function sanitizePersonRole(value) {
  const role = toText(value).toLowerCase() || "unknown";
  return CASE_PERSON_ROLES.has(role) ? role : null;
}

export function sanitizeIsAlive(value) {
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

  return true;
}

export function sanitizeRiskLevel(value) {
  const riskLevel = toText(value).toLowerCase() || "unknown";
  return CASE_DOSSIER_RISK_LEVELS.has(riskLevel) ? riskLevel : null;
}

export function sanitizeKnownValue(value, optionsSet) {
  const normalized = toText(value).toLowerCase() || "unknown";
  return optionsSet.has(normalized) ? normalized : null;
}

export function sanitizePhotoDataUrl(value) {
  const photoDataUrl = toText(value);
  if (photoDataUrl.length === 0) {
    return "";
  }

  const mimeMatch = photoDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  if (!mimeMatch) {
    return null;
  }

  if (!CASE_DOSSIER_PHOTO_MIME_TYPES.includes(mimeMatch[1])) {
    return null;
  }

  return photoDataUrl;
}
