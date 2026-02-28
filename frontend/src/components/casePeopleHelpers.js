import {
  CASE_PERSON_EDUCATION_OPTIONS,
  CASE_PERSON_EYE_COLOR_OPTIONS,
  CASE_PERSON_GENDER_OPTIONS,
  CASE_PERSON_HAIR_COLOR_OPTIONS,
  CASE_PERSON_MARITAL_STATUS_OPTIONS,
  CASE_PERSON_NATIONALITY_OPTIONS,
  CASE_PERSON_RISK_OPTIONS,
  CASE_PERSON_ROLE_OPTIONS,
} from "./casePeopleOptions";

const MAX_PHOTO_DATA_URL_LENGTH = 2_800_000;

export {
  CASE_PERSON_EDUCATION_OPTIONS,
  CASE_PERSON_EYE_COLOR_OPTIONS,
  CASE_PERSON_GENDER_OPTIONS,
  CASE_PERSON_HAIR_COLOR_OPTIONS,
  CASE_PERSON_MARITAL_STATUS_OPTIONS,
  CASE_PERSON_NATIONALITY_OPTIONS,
  CASE_PERSON_RISK_OPTIONS,
  CASE_PERSON_ROLE_OPTIONS,
};

export const INITIAL_PERSON_FORM_DATA = {
  fullName: "",
  apparentRole: "unknown",
  biography: "",
  phoneNumber: "",
  address: "",
  birthDate: "",
  birthPlace: "",
  nationality: "unknown",
  gender: "unknown",
  maritalStatus: "unknown",
  occupation: "",
  employer: "",
  educationLevel: "unknown",
  eyeColor: "unknown",
  hairColor: "unknown",
  heightCm: "",
  weightKg: "",
  isAlive: true,
  identifyingMarks: "",
  knownAssociates: "",
  riskLevel: "unknown",
  lastKnownLocation: "",
  photoDataUrl: "",
  priorOffenses: "",
  notes: "",
};

function getOptionLabel(options, value, fallback = "Nepoznato") {
  const option = options.find((item) => item.value === value);
  return option?.label || fallback;
}

export function toRoleLabel(role) {
  return getOptionLabel(CASE_PERSON_ROLE_OPTIONS, role);
}

export function toRiskLabel(riskLevel) {
  return getOptionLabel(CASE_PERSON_RISK_OPTIONS, riskLevel, "Nepoznat");
}

export function toGenderLabel(gender) {
  return getOptionLabel(CASE_PERSON_GENDER_OPTIONS, gender);
}

export function toMaritalStatusLabel(status) {
  return getOptionLabel(CASE_PERSON_MARITAL_STATUS_OPTIONS, status);
}

export function toNationalityLabel(nationality) {
  return getOptionLabel(CASE_PERSON_NATIONALITY_OPTIONS, nationality);
}

export function toEducationLabel(education) {
  return getOptionLabel(CASE_PERSON_EDUCATION_OPTIONS, education);
}

export function toEyeColorLabel(eyeColor) {
  return getOptionLabel(CASE_PERSON_EYE_COLOR_OPTIONS, eyeColor);
}

export function toHairColorLabel(hairColor) {
  return getOptionLabel(CASE_PERSON_HAIR_COLOR_OPTIONS, hairColor);
}

export function normalizePersonFormErrors(errors) {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  const mappedErrors = {};
  const supportedFields = [
    "fullName",
    "apparentRole",
    "biography",
    "phoneNumber",
    "address",
    "birthDate",
    "birthPlace",
    "nationality",
    "gender",
    "maritalStatus",
    "occupation",
    "employer",
    "educationLevel",
    "eyeColor",
    "hairColor",
    "heightCm",
    "weightKg",
    "identifyingMarks",
    "knownAssociates",
    "riskLevel",
    "lastKnownLocation",
    "photoDataUrl",
    "priorOffenses",
    "notes",
  ];

  supportedFields.forEach((fieldName) => {
    if (typeof errors[fieldName] === "string") {
      mappedErrors[fieldName] = errors[fieldName];
    }
  });

  return mappedErrors;
}

export function validatePersonForm(formData) {
  const errors = {};
  if ((formData.fullName || "").trim().length < 2) {
    errors.fullName = "Ime osobe mora imati najmanje 2 karaktera.";
  }

  const apparentRole = (formData.apparentRole || "").trim();
  if (!apparentRole || apparentRole === "unknown") {
    errors.apparentRole = "Uloga u slučaju je obavezno polje dosijea.";
  }

  if ((formData.phoneNumber || "").trim().length === 0) {
    errors.phoneNumber = "Telefon je obavezno polje dosijea.";
  }

  if ((formData.address || "").trim().length === 0) {
    errors.address = "Adresa je obavezno polje dosijea.";
  }

  const hasHeight = String(formData.heightCm || "").trim().length > 0;
  if (hasHeight) {
    const parsedHeight = Number.parseInt(formData.heightCm, 10);
    if (!Number.isInteger(parsedHeight) || parsedHeight < 50 || parsedHeight > 260) {
      errors.heightCm = "Visina osobe mora biti ceo broj od 50 do 260 cm.";
    }
  }

  const hasWeight = String(formData.weightKg || "").trim().length > 0;
  if (hasWeight) {
    const parsedWeight = Number.parseInt(formData.weightKg, 10);
    if (!Number.isInteger(parsedWeight) || parsedWeight < 25 || parsedWeight > 300) {
      errors.weightKg = "Tezina osobe mora biti ceo broj od 25 do 300 kg.";
    }
  }

  const birthDate = String(formData.birthDate || "").trim();
  if (birthDate.length === 0) {
    errors.birthDate = "Datum rođenja je obavezno polje dosijea.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    errors.birthDate = "Datum rodjenja mora biti u formatu YYYY-MM-DD.";
  }

  if ((formData.birthPlace || "").trim().length === 0) {
    errors.birthPlace = "Mjesto rođenja je obavezno polje dosijea.";
  }

  const nationality = (formData.nationality || "").trim();
  if (!nationality || nationality === "unknown") {
    errors.nationality = "Nacionalnost je obavezno polje dosijea.";
  }

  const gender = (formData.gender || "").trim();
  if (!gender || gender === "unknown") {
    errors.gender = "Pol je obavezno polje dosijea.";
  }

  const riskLevel = (formData.riskLevel || "").trim();
  if (!riskLevel || riskLevel === "unknown") {
    errors.riskLevel = "Nivo rizika je obavezno polje dosijea.";
  }

  if ((formData.lastKnownLocation || "").trim().length === 0) {
    errors.lastKnownLocation = "Posljednja poznata lokacija je obavezno polje dosijea.";
  }

  const photoDataUrl = String(formData.photoDataUrl || "").trim();
  if (photoDataUrl.length > 0 && !photoDataUrl.startsWith("data:image/")) {
    errors.photoDataUrl = "Fotografija mora biti validna slika.";
  }
  if (photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
    errors.photoDataUrl = "Fotografija je prevelika. Maksimalna velicina je oko 2MB.";
  }

  return errors;
}
