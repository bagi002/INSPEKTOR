import {
  validateCreateCasePoliceDocumentPayload,
  validateCreateCaseStatementPayload,
} from "./cases.documents.validation.js";
import {
  POLICE_DOCUMENT_TYPES,
  STATEMENT_DOCUMENT_TYPES,
} from "./cases.documents.validation.shared.js";
import {
  assertAuthorAccess,
  createDocumentForCase,
  getDocumentsForCase,
  parseCaseId,
} from "./cases.documents.service.shared.js";
import {
  filterDocumentsByUnlockedIds,
  filterPeopleByUnlockedIds,
} from "./cases.solve.visibility.filters.js";
import {
  CASE_READ_SCOPES,
  getSolveVisibilityForUser,
  normalizeCaseReadScope,
} from "./cases.solve.visibility.js";
import { getSolvePeopleRoleState } from "./cases.solve.roles.service.js";

function applySolveRolesToDocumentPeople(documents, solvePeopleById) {
  return documents.map((document) => ({
    ...document,
    relatedPeople: Array.isArray(document.relatedPeople)
      ? document.relatedPeople.map((person) => solvePeopleById.get(person.id) || person)
      : [],
    giverPerson: document.giverPerson
      ? solvePeopleById.get(document.giverPerson.id) || null
      : null,
  }));
}

async function getSolveScopedDocuments(caseId, requesterUserId, documentTypes) {
  const [documentsPayload, visibility] = await Promise.all([
    getDocumentsForCase(caseId, documentTypes),
    getSolveVisibilityForUser(caseId, requesterUserId),
  ]);
  const solvePeopleState = await getSolvePeopleRoleState(
    caseId,
    requesterUserId,
    visibility.unlockedPersonIds
  );
  const solvePeopleById = new Map(
    solvePeopleState.solvePeople.map((person) => [person.id, person])
  );

  const visibleDocuments = filterDocumentsByUnlockedIds(
    documentsPayload.documents,
    visibility.unlockedDocumentIds,
    visibility.unlockedPersonIds
  );

  return {
    caseId,
    total: visibleDocuments.length,
    documents: applySolveRolesToDocumentPeople(visibleDocuments, solvePeopleById),
    people: filterPeopleByUnlockedIds(solvePeopleState.solvePeople, visibility.unlockedPersonIds),
    roleProgress: solvePeopleState.roleProgress,
  };
}

export async function getCreatorCaseStatements(
  caseIdInput,
  requesterUserId,
  scopeInput = CASE_READ_SCOPES.CREATE
) {
  const caseId = parseCaseId(caseIdInput);
  const readScope = normalizeCaseReadScope(scopeInput);

  if (readScope === CASE_READ_SCOPES.SOLVE) {
    return await getSolveScopedDocuments(
      caseId,
      requesterUserId,
      Array.from(STATEMENT_DOCUMENT_TYPES)
    );
  }

  await assertAuthorAccess(caseId, requesterUserId);
  const { documents, peopleDirectory } = await getDocumentsForCase(
    caseId,
    Array.from(STATEMENT_DOCUMENT_TYPES)
  );

  return {
    caseId,
    total: documents.length,
    documents,
    people: peopleDirectory,
  };
}

export async function createCreatorCaseStatement(caseIdInput, payload, authorUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertAuthorAccess(caseId, authorUserId);

  const { document } = await createDocumentForCase({
    caseId,
    payload,
    validatePayload: validateCreateCaseStatementPayload,
    validationMessage: "Podaci izjave nisu validni.",
    requiresGiverPerson: true,
  });

  return {
    caseId,
    document,
  };
}

export async function getCreatorCasePoliceDocuments(
  caseIdInput,
  requesterUserId,
  scopeInput = CASE_READ_SCOPES.CREATE
) {
  const caseId = parseCaseId(caseIdInput);
  const readScope = normalizeCaseReadScope(scopeInput);

  if (readScope === CASE_READ_SCOPES.SOLVE) {
    return await getSolveScopedDocuments(
      caseId,
      requesterUserId,
      Array.from(POLICE_DOCUMENT_TYPES)
    );
  }

  await assertAuthorAccess(caseId, requesterUserId);
  const { documents, peopleDirectory } = await getDocumentsForCase(
    caseId,
    Array.from(POLICE_DOCUMENT_TYPES)
  );

  return {
    caseId,
    total: documents.length,
    documents,
    people: peopleDirectory,
  };
}

export async function createCreatorCasePoliceDocument(caseIdInput, payload, authorUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertAuthorAccess(caseId, authorUserId);

  const { document } = await createDocumentForCase({
    caseId,
    payload,
    validatePayload: validateCreateCasePoliceDocumentPayload,
    validationMessage: "Podaci policijskog dokumenta nisu validni.",
    requiresGiverPerson: false,
  });

  return {
    caseId,
    document,
  };
}
