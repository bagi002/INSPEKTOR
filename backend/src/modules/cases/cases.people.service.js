import { HttpError } from "../../utils/httpError.js";
import { findCaseByIdForAuthor } from "./cases.repository.js";
import { createCasePersonForCase, getCasePeopleByCaseId } from "./cases.repository.people.js";
import { validateCreateCasePersonPayload } from "./cases.people.validation.js";
import {
  CASE_READ_SCOPES,
  getSolveVisibilityForUser,
  normalizeCaseReadScope,
} from "./cases.solve.visibility.js";
import { getSolvePeopleRoleState } from "./cases.solve.roles.service.js";
import {
  buildCaseSolveRoleProgress,
  normalizeCasePersonRole,
} from "./cases.solve.roles.shared.js";
import { upsertCasePersonRoleSelection } from "./cases.repository.people.roles.js";

function throwValidationIfNeeded(errors) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Podaci osobe nisu validni.", errors);
  }
}

function parseCaseId(caseIdInput) {
  const normalizedValue =
    typeof caseIdInput === "string" ? caseIdInput.trim() : String(caseIdInput ?? "");
  if (!/^\d+$/.test(normalizedValue)) {
    throw new HttpError(400, "Prosleđeni slučaj nije validan.");
  }

  const caseId = Number.parseInt(normalizedValue, 10);
  if (!Number.isInteger(caseId) || caseId <= 0) {
    throw new HttpError(400, "Prosleđeni slučaj nije validan.");
  }

  return caseId;
}

function parsePersonId(personIdInput) {
  const normalizedValue =
    typeof personIdInput === "string" ? personIdInput.trim() : String(personIdInput ?? "");
  if (!/^\d+$/.test(normalizedValue)) {
    throw new HttpError(400, "Prosledjena osoba nije validna.");
  }

  const personId = Number.parseInt(normalizedValue, 10);
  if (!Number.isInteger(personId) || personId <= 0) {
    throw new HttpError(400, "Prosledjena osoba nije validna.");
  }

  return personId;
}

async function assertAuthorAccess(caseId, authorUserId) {
  const caseRow = await findCaseByIdForAuthor(caseId, authorUserId);
  if (!caseRow) {
    throw new HttpError(404, "Slučaj nije pronađen ili nemaš pristup ovom slučaju.");
  }
}

function parseSolveRolePayload(payload) {
  const normalizedRole = normalizeCasePersonRole(payload?.apparentRole ?? payload?.role);
  if (!normalizedRole) {
    throw new HttpError(400, "Uloga osobe nije podržana.", {
      apparentRole: "Dozvoljene vrednosti su unknown, suspect, victim i witness.",
    });
  }

  return normalizedRole;
}

export async function getCreatorCasePeople(caseIdInput, authorUserId, scopeInput = CASE_READ_SCOPES.CREATE) {
  const caseId = parseCaseId(caseIdInput);
  const readScope = normalizeCaseReadScope(scopeInput);

  if (readScope === CASE_READ_SCOPES.SOLVE) {
    const visibility = await getSolveVisibilityForUser(caseId, authorUserId);
    const solvePeopleState = await getSolvePeopleRoleState(
      caseId,
      authorUserId,
      visibility.unlockedPersonIds
    );

    return {
      caseId,
      total: solvePeopleState.solvePeople.length,
      people: solvePeopleState.solvePeople,
      roleProgress: solvePeopleState.roleProgress,
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
    throw new HttpError(500, "Osoba je sačuvana, ali odgovor nije moguće učitati.");
  }

  return {
    caseId,
    person: createdPerson,
  };
}

export async function updateSolveCasePersonRole(caseIdInput, personIdInput, payload, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  const personId = parsePersonId(personIdInput);
  const selectedRole = parseSolveRolePayload(payload);

  const visibility = await getSolveVisibilityForUser(caseId, requesterUserId);
  const solvePeopleState = await getSolvePeopleRoleState(caseId, requesterUserId, visibility.unlockedPersonIds);

  const personExistsInSolveScope = solvePeopleState.visiblePeople.some((person) => person.id === personId);
  if (!personExistsInSolveScope) {
    throw new HttpError(404, "Osoba nije pronađena ili još nije otključana za rešavanje.");
  }

  await upsertCasePersonRoleSelection(caseId, personId, requesterUserId, selectedRole);

  const nextSelectedRolesByPersonId = new Map(solvePeopleState.selectedRolesByPersonId);
  nextSelectedRolesByPersonId.set(personId, selectedRole);

  return {
    caseId,
    personId,
    apparentRole: selectedRole,
    roleProgress: buildCaseSolveRoleProgress(
      solvePeopleState.visiblePeople,
      nextSelectedRolesByPersonId
    ),
  };
}
