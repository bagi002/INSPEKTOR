import { buildCaseWorkspaceRoute } from "../utils/routes";

const STATEMENT_DOCUMENT_TYPES = new Set([
  "witness_statement",
  "suspect_statement",
  "victim_statement",
]);

function toPositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseQueryInteger(search, queryKey) {
  if (typeof search !== "string" || search.trim().length === 0) {
    return null;
  }

  const params = new URLSearchParams(search);
  return toPositiveInteger(params.get(queryKey));
}

function resolveDocumentTabSlug(documentType) {
  if (STATEMENT_DOCUMENT_TYPES.has(documentType)) {
    return "izjave";
  }

  return "dokumenti";
}

export function parsePersonIdFromLocationSearch(search) {
  return parseQueryInteger(search, "personId");
}

export function parseDocumentIdFromLocationSearch(search) {
  return parseQueryInteger(search, "documentId");
}

export function parseInterrogationPersonIdFromLocationSearch(search) {
  return parseQueryInteger(search, "interrogationPersonId");
}

export function consumeWorkspaceLinkingQueryParams(queryKeys) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  let hasChanges = false;

  (queryKeys || []).forEach((queryKey) => {
    if (url.searchParams.has(queryKey)) {
      url.searchParams.delete(queryKey);
      hasChanges = true;
    }
  });

  if (!hasChanges) {
    return;
  }

  const nextSearch = url.searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash || ""}`;
  window.history.replaceState({}, "", nextUrl);
}

export function buildPersonDossierHref(caseId, mode, personId) {
  const parsedPersonId = toPositiveInteger(personId);
  if (!parsedPersonId) {
    return "#";
  }

  const baseRoute = buildCaseWorkspaceRoute(caseId, mode, "osobe-i-dosijei");
  return `${baseRoute}?personId=${parsedPersonId}`;
}

export function buildDocumentPreviewHref(caseId, mode, document) {
  const parsedDocumentId = toPositiveInteger(document?.id);
  if (!parsedDocumentId) {
    return "#";
  }

  const tabSlug = resolveDocumentTabSlug(document?.documentType || "");
  const baseRoute = buildCaseWorkspaceRoute(caseId, mode, tabSlug);
  return `${baseRoute}?documentId=${parsedDocumentId}`;
}

export function buildInterrogationHref(caseId, mode, personId) {
  const parsedPersonId = toPositiveInteger(personId);
  if (!parsedPersonId) {
    return "#";
  }

  const baseRoute = buildCaseWorkspaceRoute(caseId, mode, "saslusanja");
  return `${baseRoute}?interrogationPersonId=${parsedPersonId}`;
}
