import { HttpError } from "../../utils/httpError.js";
import { findCaseByIdForAuthor } from "./cases.repository.js";
import {
  getCaseInterrogationsByCaseId,
  upsertCaseInterrogationForPerson,
} from "./cases.repository.interrogations.js";
import { getCasePeopleDirectoryByCaseId } from "./cases.repository.documents.js";
import { validateCreateCaseInterrogationPayload } from "./cases.interrogations.validation.js";
import {
  filterInterrogationsByUnlockedPeople,
  filterPeopleByUnlockedIds,
} from "./cases.solve.visibility.filters.js";
import {
  CASE_READ_SCOPES,
  getSolveVisibilityForUser,
  normalizeCaseReadScope,
} from "./cases.solve.visibility.js";

function throwValidationIfNeeded(errors, message) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, message, errors);
  }
}

function parseCaseId(caseIdInput) {
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

async function assertAuthorAccess(caseId, authorUserId) {
  const caseRow = await findCaseByIdForAuthor(caseId, authorUserId);
  if (!caseRow) {
    throw new HttpError(404, "Slucaj nije pronadjen ili nemas pristup ovom slucaju.");
  }
}

function buildPeopleMap(peopleDirectory) {
  return new Map(peopleDirectory.map((person) => [person.id, person]));
}

function normalizeInterrogation(interrogation, peopleMap) {
  const person = peopleMap.get(interrogation.personId) || null;
  return {
    ...interrogation,
    person,
  };
}

function validateInterrogationPerson(personId, peopleMap, errors) {
  const person = peopleMap.get(personId);
  if (!person) {
    errors.personId = "Izabrana osoba ne postoji u trazenom slucaju.";
    return;
  }
  if (!person.isAlive) {
    errors.personId = "Saslusanje je dozvoljeno samo za zive osobe.";
  }
}

export async function getCreatorCaseInterrogations(
  caseIdInput,
  authorUserId,
  scopeInput = CASE_READ_SCOPES.CREATE
) {
  const caseId = parseCaseId(caseIdInput);
  const readScope = normalizeCaseReadScope(scopeInput);

  if (readScope === CASE_READ_SCOPES.SOLVE) {
    const [interrogations, peopleDirectory, visibility] = await Promise.all([
      getCaseInterrogationsByCaseId(caseId),
      getCasePeopleDirectoryByCaseId(caseId),
      getSolveVisibilityForUser(caseId, authorUserId),
    ]);

    const peopleMap = buildPeopleMap(peopleDirectory);
    const normalizedInterrogations = interrogations.map((interrogation) =>
      normalizeInterrogation(interrogation, peopleMap)
    );
    const visiblePeople = filterPeopleByUnlockedIds(
      peopleDirectory,
      visibility.unlockedPersonIds
    );
    const visibleInterrogations = filterInterrogationsByUnlockedPeople(
      normalizedInterrogations,
      visibility.unlockedPersonIds
    );

    return {
      caseId,
      total: visibleInterrogations.length,
      interrogations: visibleInterrogations,
      people: visiblePeople,
    };
  }

  await assertAuthorAccess(caseId, authorUserId);

  const [interrogations, peopleDirectory] = await Promise.all([
    getCaseInterrogationsByCaseId(caseId),
    getCasePeopleDirectoryByCaseId(caseId),
  ]);

  const peopleMap = buildPeopleMap(peopleDirectory);
  const normalizedInterrogations = interrogations.map((interrogation) =>
    normalizeInterrogation(interrogation, peopleMap)
  );

  return {
    caseId,
    total: normalizedInterrogations.length,
    interrogations: normalizedInterrogations,
    people: peopleDirectory,
  };
}

export async function createCreatorCaseInterrogation(caseIdInput, payload, authorUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertAuthorAccess(caseId, authorUserId);

  const { errors, sanitized } = validateCreateCaseInterrogationPayload(payload);
  const peopleDirectory = await getCasePeopleDirectoryByCaseId(caseId);
  const peopleMap = buildPeopleMap(peopleDirectory);

  validateInterrogationPerson(sanitized.personId, peopleMap, errors);
  throwValidationIfNeeded(errors, "Podaci saslusanja nisu validni.");

  const interrogation = await upsertCaseInterrogationForPerson(caseId, sanitized, authorUserId);
  if (!interrogation) {
    throw new HttpError(500, "Saslusanje je sacuvano, ali odgovor nije moguce ucitati.");
  }

  return {
    caseId,
    interrogation: normalizeInterrogation(interrogation, peopleMap),
  };
}
