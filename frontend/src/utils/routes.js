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
