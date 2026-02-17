import { HttpError } from "../../utils/httpError.js";
import { findCaseByIdForAuthor } from "./cases.repository.js";
import { createCasePersonForCase, getCasePeopleByCaseId } from "./cases.repository.people.js";
import { validateCreateCasePersonPayload } from "./cases.people.validation.js";
import {
  CASE_READ_SCOPES,
  getSolveVisibilityForUser,
  normalizeCaseReadScope,
} from "./cases.solve.visibility.js";
import { filterPeopleByUnlockedIds } from "./cases.solve.visibility.filters.js";

function throwValidationIfNeeded(errors) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Podaci osobe nisu validni.", errors);
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

export async function getCreatorCasePeople(caseIdInput, authorUserId, scopeInput = CASE_READ_SCOPES.CREATE) {
  const caseId = parseCaseId(caseIdInput);
  const readScope = normalizeCaseReadScope(scopeInput);

  if (readScope === CASE_READ_SCOPES.SOLVE) {
    const [people, visibility] = await Promise.all([
      getCasePeopleByCaseId(caseId),
      getSolveVisibilityForUser(caseId, authorUserId),
    ]);

    const visiblePeople = filterPeopleByUnlockedIds(people, visibility.unlockedPersonIds);
    return {
      caseId,
      total: visiblePeople.length,
      people: visiblePeople,
    };
  }

  await assertAuthorAccess(caseId, authorUserId);

  const people = await getCasePeopleByCaseId(caseId);
  return {
    caseId,
    total: people.length,
    people,
  };
}

export async function createCreatorCasePerson(caseIdInput, payload, authorUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertAuthorAccess(caseId, authorUserId);

  const { errors, sanitized } = validateCreateCasePersonPayload(payload);
  throwValidationIfNeeded(errors);

  const createdPerson = await createCasePersonForCase(caseId, sanitized, authorUserId);
  if (!createdPerson) {
    throw new HttpError(500, "Osoba je sacuvana, ali odgovor nije moguce ucitati.");
  }

  return {
    caseId,
    person: createdPerson,
  };
}
