import {
  CASE_DOSSIER_EDUCATION_OPTIONS,
  CASE_DOSSIER_EYE_COLOR_OPTIONS,
  CASE_DOSSIER_GENDER_OPTIONS,
  CASE_DOSSIER_HAIR_COLOR_OPTIONS,
  CASE_DOSSIER_MARITAL_STATUS_OPTIONS,
  CASE_DOSSIER_NATIONALITY_OPTIONS,
  CASE_DOSSIER_PHOTO_MAX_LENGTH,
  sanitizeIsAlive,
  sanitizeKnownValue,
  sanitizePersonRole,
  sanitizePhotoDataUrl,
  sanitizeRiskLevel,
  toDateText,
  toInteger,
  toText,
} from "./cases.people.validation.shared.js";

export function validateCreateCasePersonPayload(payload) {
  const errors = {};
  const fullName = toText(payload?.fullName);
  const apparentRole = sanitizePersonRole(payload?.apparentRole);
  const biography = toText(payload?.biography);
  const phoneNumber = toText(payload?.phoneNumber);
  const address = toText(payload?.address);
  const birthDate = toDateText(payload?.birthDate);
  const birthPlace = toText(payload?.birthPlace);
  const nationality = sanitizeKnownValue(payload?.nationality, CASE_DOSSIER_NATIONALITY_OPTIONS);
  const gender = sanitizeKnownValue(payload?.gender, CASE_DOSSIER_GENDER_OPTIONS);
  const maritalStatus = sanitizeKnownValue(payload?.maritalStatus, CASE_DOSSIER_MARITAL_STATUS_OPTIONS);
  const occupation = toText(payload?.occupation);
  const employer = toText(payload?.employer);
  const educationLevel = sanitizeKnownValue(payload?.educationLevel, CASE_DOSSIER_EDUCATION_OPTIONS);
  const eyeColor = sanitizeKnownValue(payload?.eyeColor, CASE_DOSSIER_EYE_COLOR_OPTIONS);
  const hairColor = sanitizeKnownValue(payload?.hairColor, CASE_DOSSIER_HAIR_COLOR_OPTIONS);
  const identifyingMarks = toText(payload?.identifyingMarks);
  const knownAssociates = toText(payload?.knownAssociates);
  const lastKnownLocation = toText(payload?.lastKnownLocation);
  const photoDataUrl = sanitizePhotoDataUrl(payload?.photoDataUrl);
  const notes = toText(payload?.notes);
  const priorOffenses = toText(payload?.priorOffenses);
  const riskLevel = sanitizeRiskLevel(payload?.riskLevel);
  const isAlive = sanitizeIsAlive(payload?.isAlive);
  const rawHeightCm = payload?.heightCm;
  const rawWeightKg = payload?.weightKg;
  const hasHeightCm =
    rawHeightCm !== undefined && rawHeightCm !== null && String(rawHeightCm).trim().length > 0;
  const hasWeightKg =
    rawWeightKg !== undefined && rawWeightKg !== null && String(rawWeightKg).trim().length > 0;
  const heightCm = hasHeightCm ? toInteger(rawHeightCm) : null;
  const weightKg = hasWeightKg ? toInteger(rawWeightKg) : null;

  if (fullName.length < 2) {
    errors.fullName = "Ime osobe mora imati najmanje 2 karaktera.";
  }
  if (!apparentRole) {
    errors.apparentRole = "Uloga osobe nije podrzana.";
  }
  if (biography.length > 4000) {
    errors.biography = "Biografija osobe moze imati najvise 4000 karaktera.";
  }
  if (phoneNumber.length > 40) {
    errors.phoneNumber = "Telefon osobe moze imati najvise 40 karaktera.";
  }
  if (address.length > 220) {
    errors.address = "Adresa osobe moze imati najvise 220 karaktera.";
  }
  if (birthDate === null) {
    errors.birthDate = "Datum rodjenja mora biti u formatu YYYY-MM-DD.";
  }
  if (birthPlace.length > 120) {
    errors.birthPlace = "Mjesto rodjenja moze imati najvise 120 karaktera.";
  }
  if (!nationality) {
    errors.nationality = "Nacionalnost nije podrzana.";
  }
  if (!gender) {
    errors.gender = "Pol nije podrzan.";
  }
  if (!maritalStatus) {
    errors.maritalStatus = "Bracni status nije podrzan.";
  }
  if (occupation.length > 120) {
    errors.occupation = "Zanimanje moze imati najvise 120 karaktera.";
  }
  if (employer.length > 120) {
    errors.employer = "Poslodavac moze imati najvise 120 karaktera.";
  }
  if (!educationLevel) {
    errors.educationLevel = "Obrazovanje nije podrzano.";
  }
  if (!eyeColor) {
    errors.eyeColor = "Boja ociju nije podrzana.";
  }
  if (!hairColor) {
    errors.hairColor = "Boja kose nije podrzana.";
  }
  if (identifyingMarks.length > 2000) {
    errors.identifyingMarks = "Posebna obiljezja mogu imati najvise 2000 karaktera.";
  }
  if (knownAssociates.length > 2000) {
    errors.knownAssociates = "Poznate veze mogu imati najvise 2000 karaktera.";
  }
  if (lastKnownLocation.length > 220) {
    errors.lastKnownLocation = "Posljednja lokacija moze imati najvise 220 karaktera.";
  }
  if (photoDataUrl === null) {
    errors.photoDataUrl = "Fotografija mora biti JPG/PNG/WEBP data URL.";
  }
  if (typeof photoDataUrl === "string" && photoDataUrl.length > CASE_DOSSIER_PHOTO_MAX_LENGTH) {
    errors.photoDataUrl = "Fotografija je prevelika. Maksimalna velicina je oko 2MB.";
  }
  if (notes.length > 4000) {
    errors.notes = "Napomene mogu imati najvise 4000 karaktera.";
  }
  if (priorOffenses.length > 4000) {
    errors.priorOffenses = "Istorija dela moze imati najvise 4000 karaktera.";
  }
  if (!riskLevel) {
    errors.riskLevel = "Nivo rizika nije podrzan.";
  }
  if (heightCm !== null && (heightCm < 50 || heightCm > 260)) {
    errors.heightCm = "Visina osobe mora biti broj izmedju 50 i 260 cm.";
  }
  if (hasHeightCm && heightCm === null) {
    errors.heightCm = "Visina osobe mora biti ceo broj u centimetrima.";
  }
  if (weightKg !== null && (weightKg < 25 || weightKg > 300)) {
    errors.weightKg = "Tezina osobe mora biti broj izmedju 25 i 300 kg.";
  }
  if (hasWeightKg && weightKg === null) {
    errors.weightKg = "Tezina osobe mora biti ceo broj u kilogramima.";
  }

  return {
    errors,
    sanitized: {
      fullName,
      apparentRole: apparentRole || "unknown",
      biography,
      phoneNumber,
      address,
      birthDate: birthDate || "",
      birthPlace,
      nationality: nationality || "unknown",
      gender: gender || "unknown",
      maritalStatus: maritalStatus || "unknown",
      occupation,
      employer,
      educationLevel: educationLevel || "unknown",
      eyeColor: eyeColor || "unknown",
      hairColor: hairColor || "unknown",
      heightCm,
      weightKg,
      isAlive,
      identifyingMarks,
      knownAssociates,
      riskLevel: riskLevel || "unknown",
      lastKnownLocation,
      photoDataUrl: typeof photoDataUrl === "string" ? photoDataUrl : "",
      priorOffenses,
      notes,
    },
  };
}
