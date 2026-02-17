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
    reader.onerror = () => reject(new Error("Greska pri citanju fajla."));
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
