import { CASE_DOCUMENT_CATEGORIES } from "./caseDocumentConfig";
import {
  MAX_DOCUMENT_IMAGE_COUNT,
  supportsImageEvidenceForDocumentType,
} from "./caseDocumentStateUtils";
import { getTypeSpecificFieldsForDocumentType } from "./caseDocumentTypeSpecificConfig";

const COMMON_FORM_ERRORS = [
  "documentType",
  "title",
  "content",
  "sequenceOrder",
  "classificationLevel",
  "recordedAt",
  "location",
  "officerName",
  "badgeNumber",
  "department",
  "evidenceReference",
  "legalReference",
  "notes",
  "relatedPersonIds",
  "giverPersonId",
  "imageEvidence",
];

function validateTypeSpecificFields(documentType, typeSpecific) {
  const errors = {};
  const fields = getTypeSpecificFieldsForDocumentType(documentType);

  fields.forEach((field) => {
    const value = typeSpecific?.[field.name];
    const errorKey = `typeSpecific.${field.name}`;

    if (field.inputType === "checkbox") {
      return;
    }

    const textValue = String(value || "").trim();
    if (field.required && textValue.length === 0) {
      errors[errorKey] = `${field.label} je obavezno polje.`;
      return;
    }

    if (field.inputType === "number" && textValue.length > 0) {
      const parsedNumber = Number.parseInt(textValue, 10);
      if (!Number.isInteger(parsedNumber) || parsedNumber < 0) {
        errors[errorKey] = `${field.label} mora biti validan ceo broj.`;
      }
    }
  });

  return errors;
}

export function validateCaseDocumentForm(formData, category) {
  const errors = {};
  const requiresGiverPerson = category === CASE_DOCUMENT_CATEGORIES.STATEMENTS;

  if ((formData.title || "").trim().length < 3) {
    errors.title = "Naslov mora imati najmanje 3 karaktera.";
  }
  if ((formData.content || "").trim().length < 30) {
    errors.content = "Sadrzaj mora imati najmanje 30 karaktera.";
  }

  const sequenceOrder = Number.parseInt(formData.sequenceOrder, 10);
  if (!Number.isInteger(sequenceOrder) || sequenceOrder < 1) {
    errors.sequenceOrder = "Redosled mora biti ceo broj veci od nule.";
  }

  if ((formData.classificationLevel || "").trim().length === 0) {
    errors.classificationLevel = "Klasifikacija je obavezna.";
  }

  if (requiresGiverPerson) {
    const giverPersonId = Number.parseInt(formData.giverPersonId, 10);
    if (!Number.isInteger(giverPersonId) || giverPersonId <= 0) {
      errors.giverPersonId = "Izaberi osobu koja je dala izjavu.";
    }
  }

  if (!supportsImageEvidenceForDocumentType(formData.documentType) && (formData.imageEvidence || []).length > 0) {
    errors.imageEvidence = "Slike su dozvoljene samo za policijske i forenzicke dokumente.";
  }
  if ((formData.imageEvidence || []).length > MAX_DOCUMENT_IMAGE_COUNT) {
    errors.imageEvidence = `Maksimalan broj slika je ${MAX_DOCUMENT_IMAGE_COUNT}.`;
  }

  return { ...errors, ...validateTypeSpecificFields(formData.documentType, formData.typeSpecific) };
}

export function normalizeCaseDocumentFormErrors(errors) {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  const nextErrors = {};
  COMMON_FORM_ERRORS.forEach((fieldName) => {
    if (typeof errors[fieldName] === "string") {
      nextErrors[fieldName] = errors[fieldName];
    }
  });

  Object.entries(errors).forEach(([key, value]) => {
    if (key.startsWith("typeSpecific.") && typeof value === "string") {
      nextErrors[key] = value;
    }
  });

  return nextErrors;
}
