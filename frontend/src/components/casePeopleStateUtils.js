export const MAX_PHOTO_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export function normalizeFieldValue({ name, type, checked, value }) {
  if (type === "checkbox") {
    return checked;
  }

  if (name === "isAlive") {
    return String(value) === "false" ? false : true;
  }

  return value;
}

export function readPhotoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Greška pri čitanju fajla."));
    reader.readAsDataURL(file);
  });
}

export function buildCreatePersonPayload(formData) {
  return {
    fullName: (formData.fullName || "").trim(),
    apparentRole: formData.apparentRole,
    biography: (formData.biography || "").trim(),
    phoneNumber: (formData.phoneNumber || "").trim(),
    address: (formData.address || "").trim(),
    birthDate: (formData.birthDate || "").trim(),
    birthPlace: (formData.birthPlace || "").trim(),
    nationality: (formData.nationality || "").trim(),
    gender: (formData.gender || "").trim(),
    maritalStatus: (formData.maritalStatus || "").trim(),
    occupation: (formData.occupation || "").trim(),
    employer: (formData.employer || "").trim(),
    educationLevel: (formData.educationLevel || "").trim(),
    eyeColor: (formData.eyeColor || "").trim(),
    hairColor: (formData.hairColor || "").trim(),
    heightCm: String(formData.heightCm || "").trim(),
    weightKg: String(formData.weightKg || "").trim(),
    isAlive: Boolean(formData.isAlive),
    identifyingMarks: (formData.identifyingMarks || "").trim(),
    knownAssociates: (formData.knownAssociates || "").trim(),
    riskLevel: formData.riskLevel,
    lastKnownLocation: (formData.lastKnownLocation || "").trim(),
    photoDataUrl: (formData.photoDataUrl || "").trim(),
    priorOffenses: (formData.priorOffenses || "").trim(),
    notes: (formData.notes || "").trim(),
  };
}

function toStringValue(value, fallback = "") {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value);
}

export function buildPersonFormDataFromPerson(person) {
  const dossier = person?.dossier || {};

  return {
    fullName: toStringValue(person?.fullName),
    apparentRole: toStringValue(person?.apparentRole, "unknown") || "unknown",
    biography: toStringValue(person?.biography),
    phoneNumber: toStringValue(dossier.phoneNumber),
    address: toStringValue(dossier.address),
    birthDate: toStringValue(dossier.birthDate),
    birthPlace: toStringValue(dossier.birthPlace),
    nationality: toStringValue(dossier.nationality, "unknown") || "unknown",
    gender: toStringValue(dossier.gender, "unknown") || "unknown",
    maritalStatus: toStringValue(dossier.maritalStatus, "unknown") || "unknown",
    occupation: toStringValue(dossier.occupation),
    employer: toStringValue(dossier.employer),
    educationLevel: toStringValue(dossier.educationLevel, "unknown") || "unknown",
    eyeColor: toStringValue(dossier.eyeColor, "unknown") || "unknown",
    hairColor: toStringValue(dossier.hairColor, "unknown") || "unknown",
    heightCm:
      dossier.heightCm === undefined || dossier.heightCm === null
        ? ""
        : String(dossier.heightCm),
    weightKg:
      dossier.weightKg === undefined || dossier.weightKg === null
        ? ""
        : String(dossier.weightKg),
    isAlive: dossier.isAlive !== false,
    identifyingMarks: toStringValue(dossier.identifyingMarks),
    knownAssociates: toStringValue(dossier.knownAssociates),
    riskLevel: toStringValue(dossier.riskLevel, "unknown") || "unknown",
    lastKnownLocation: toStringValue(dossier.lastKnownLocation),
    photoDataUrl: toStringValue(dossier.photoDataUrl),
    priorOffenses: toStringValue(dossier.priorOffenses),
    notes: toStringValue(dossier.notes),
  };
}
