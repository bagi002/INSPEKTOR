export const PUBLIC_ROUTES = {
  HOME: "/",
  REGISTRATION: "/registracija",
  LOGIN: "/prijava",
};

export const AUTH_ROUTES = {
  HOME: "/app",
  CREATE_CASE: "/slucaj/novi",
  PROFILE: "/profil",
};

export const CASE_WORKSPACE_MODES = {
  CREATE: "kreiranje",
  SOLVE: "resavanje",
};

const CASE_WORKSPACE_ROUTE_PATTERN =
  /^\/slucaj\/(\d+)\/(kreiranje|resavanje)(?:\/([a-z0-9-]+))?$/;
const CASE_WORKSPACE_TAB_SLUGS = new Set([
  "vremenska-linija",
  "osobe-i-dosijei",
  "dokumenti",
  "izjave",
  "saslusanja",
  "kviz",
]);
const DEFAULT_CASE_WORKSPACE_TAB = "vremenska-linija";

export function normalizePath(pathname) {
  if (!pathname) {
    return PUBLIC_ROUTES.HOME;
  }

  const sanitized = pathname.trim();
  if (sanitized.length === 0) {
    return PUBLIC_ROUTES.HOME;
  }

  const withoutTrailingSlash = sanitized.replace(/\/+$/, "");
  return withoutTrailingSlash.length === 0
    ? PUBLIC_ROUTES.HOME
    : withoutTrailingSlash;
}

export function buildCaseCreatorRoute(caseId) {
  return buildCaseWorkspaceRoute(caseId, CASE_WORKSPACE_MODES.CREATE);
}

export function buildCaseWorkspaceRoute(caseId, mode, tabSlug = DEFAULT_CASE_WORKSPACE_TAB) {
  const parsedCaseId = Number.parseInt(caseId, 10);
  if (!Number.isInteger(parsedCaseId) || parsedCaseId <= 0 || !mode) {
    return AUTH_ROUTES.CREATE_CASE;
  }

  const normalizedMode = String(mode).trim().toLowerCase();
  const resolvedMode =
    normalizedMode === CASE_WORKSPACE_MODES.SOLVE
      ? CASE_WORKSPACE_MODES.SOLVE
      : CASE_WORKSPACE_MODES.CREATE;

  const normalizedTab = String(tabSlug || "")
    .trim()
    .toLowerCase();
  const resolvedTab = CASE_WORKSPACE_TAB_SLUGS.has(normalizedTab)
    ? normalizedTab
    : DEFAULT_CASE_WORKSPACE_TAB;

  return `/slucaj/${parsedCaseId}/${resolvedMode}/${resolvedTab}`;
}

export function parseCaseWorkspacePath(pathname) {
  const normalizedPath = normalizePath(pathname);
  const match = normalizedPath.match(CASE_WORKSPACE_ROUTE_PATTERN);
  if (!match) {
    return null;
  }

  const parsedCaseId = Number.parseInt(match[1], 10);
  if (!Number.isInteger(parsedCaseId) || parsedCaseId <= 0) {
    return null;
  }

  const mode = match[2];
  const rawTabSlug = match[3] || DEFAULT_CASE_WORKSPACE_TAB;
  const tabSlug = CASE_WORKSPACE_TAB_SLUGS.has(rawTabSlug)
    ? rawTabSlug
    : DEFAULT_CASE_WORKSPACE_TAB;

  return {
    caseId: parsedCaseId,
    mode,
    tabSlug,
  };
}

export function parseCaseCreatorPath(pathname) {
  const parsedWorkspacePath = parseCaseWorkspacePath(pathname);
  if (!parsedWorkspacePath || parsedWorkspacePath.mode !== CASE_WORKSPACE_MODES.CREATE) {
    return null;
  }

  return parsedWorkspacePath.caseId;
}
