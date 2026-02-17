import { HttpError } from "../../utils/httpError.js";
import { findCaseByIdForAuthor } from "./cases.repository.js";
import {
  createCaseDocumentForCase,
  getCaseDocumentsByCaseIdAndTypes,
  getCasePeopleDirectoryByCaseId,
} from "./cases.repository.documents.js";

export function parseCaseId(caseIdInput) {
  const normalizedValue =
    typeof caseIdInput === "string" ? caseIdInput.trim() : String(caseIdInput ?? "");

  if (!/^\d+$/.test(normalizedValue)) {
    throw new HttpError(400, "Prosledjeni slucaj nije validan.");
  }

  const caseId = Number.parseInt(normalizedValue, 10);
  if (!Number.isInteger(caseId) || caseId <= 0) {
    throw new HttpError(400, "Prosledjeni slucaj nije validan.");
  }

  return caseId;
}

export async function assertAuthorAccess(caseId, authorUserId) {
  const caseRow = await findCaseByIdForAuthor(caseId, authorUserId);
  if (!caseRow) {
    throw new HttpError(404, "Slucaj nije pronadjen ili nemas pristup ovom slucaju.");
  }
}

function throwValidationIfNeeded(errors, message) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, message, errors);
  }
}

function buildPeopleMap(peopleDirectory) {
  return new Map(peopleDirectory.map((person) => [person.id, person]));
}

function enrichDocumentWithPeople(document, peopleMap) {
  const relatedIds = document?.metadata?.relatedPersonIds || [];
  const relatedPeople = relatedIds
    .map((personId) => peopleMap.get(personId) || null)
    .filter(Boolean);
  const giverPerson = document?.metadata?.giverPersonId
    ? peopleMap.get(document.metadata.giverPersonId) || null
    : null;

  return {
    ...document,
    relatedPeople,
    giverPerson,
  };
}

function validateReferencedPeople(metadata, peopleMap, errors, requiresGiverPerson) {
  const relatedPersonIds = metadata?.relatedPersonIds || [];
  const missingRelated = relatedPersonIds.filter((personId) => !peopleMap.has(personId));
  if (missingRelated.length > 0) {
    errors.relatedPersonIds = "Dokument referencira osobe koje ne postoje u trazenom slucaju.";
  }

  if (requiresGiverPerson && metadata?.giverPersonId && !peopleMap.has(metadata.giverPersonId)) {
    errors.giverPersonId = "Izabrana osoba za izjavu ne postoji u trazenom slucaju.";
  }
}

export async function getDocumentsForCase(caseId, documentTypes) {
  const [documents, peopleDirectory] = await Promise.all([
    getCaseDocumentsByCaseIdAndTypes(caseId, documentTypes),
    getCasePeopleDirectoryByCaseId(caseId),
  ]);

  const peopleMap = buildPeopleMap(peopleDirectory);
  return {
    documents: documents.map((document) => enrichDocumentWithPeople(document, peopleMap)),
    peopleDirectory,
  };
}

export async function createDocumentForCase({
  caseId,
  payload,
  validatePayload,
  validationMessage,
  requiresGiverPerson,
}) {
  const { errors, sanitized } = validatePayload(payload);
  const peopleDirectory = await getCasePeopleDirectoryByCaseId(caseId);
  const peopleMap = buildPeopleMap(peopleDirectory);

  validateReferencedPeople(sanitized.metadata, peopleMap, errors, requiresGiverPerson);
  throwValidationIfNeeded(errors, validationMessage);

  const createdDocument = await createCaseDocumentForCase(caseId, sanitized);
  if (!createdDocument) {
    throw new HttpError(500, "Dokument je sacuvan, ali odgovor nije moguce ucitati.");
  }

  return {
    document: enrichDocumentWithPeople(createdDocument, peopleMap),
  };
}
