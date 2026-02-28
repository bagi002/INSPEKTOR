const THEME_STORAGE_KEY_PREFIX = "inspektor_theme_preference_v1";
const LEGACY_THEME_STORAGE_KEY = "inspektor_theme_preference_v1";
const DEFAULT_THEME = "light";
const DEFAULT_THEME_SCOPE = "guest";
const SUPPORTED_THEMES = new Set(["light", "dark"]);

function isBrowser() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function normalizeThemePreference(value) {
  if (typeof value !== "string") {
    return DEFAULT_THEME;
  }

  const normalized = value.trim().toLowerCase();
  return SUPPORTED_THEMES.has(normalized) ? normalized : DEFAULT_THEME;
}

function normalizeThemeScope(scope) {
  if (typeof scope !== "string") {
    return DEFAULT_THEME_SCOPE;
  }

  const normalized = scope.trim().toLowerCase();
  return normalized || DEFAULT_THEME_SCOPE;
}

function buildThemeStorageKey(scope) {
  return `${THEME_STORAGE_KEY_PREFIX}:${normalizeThemeScope(scope)}`;
}

export function resolveThemePreferenceScope(user) {
  if (!user || typeof user !== "object") {
    return DEFAULT_THEME_SCOPE;
  }

  const userId = user.id ?? user.userId ?? null;
  if (userId !== null && userId !== undefined) {
    const normalizedId = String(userId).trim();
    if (normalizedId) {
      return `user:${normalizedId}`;
    }
  }

  if (typeof user.email === "string" && user.email.trim()) {
    return `email:${user.email.trim().toLowerCase()}`;
  }

  return DEFAULT_THEME_SCOPE;
}

export function applyThemePreference(themePreference) {
  if (typeof window === "undefined" || !window.document?.documentElement) {
    return;
  }

  const normalized = normalizeThemePreference(themePreference);
  window.document.documentElement.setAttribute("data-theme", normalized);
}

export function getStoredThemePreference(scope = DEFAULT_THEME_SCOPE) {
  if (!isBrowser()) {
    return DEFAULT_THEME;
  }

  const storageKey = buildThemeStorageKey(scope);
  const scopedValue = window.localStorage.getItem(storageKey);
  if (scopedValue !== null) {
    return normalizeThemePreference(scopedValue);
  }

  const legacyValue = window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
  if (legacyValue !== null) {
    const normalizedLegacyValue = normalizeThemePreference(legacyValue);
    window.localStorage.setItem(storageKey, normalizedLegacyValue);
    return normalizedLegacyValue;
  }

  return DEFAULT_THEME;
}

export function setStoredThemePreference(themePreference, scope = DEFAULT_THEME_SCOPE) {
  if (!isBrowser()) {
    return normalizeThemePreference(themePreference);
  }

  const normalized = normalizeThemePreference(themePreference);
  window.localStorage.setItem(buildThemeStorageKey(scope), normalized);
  return normalized;
}

export function initializeThemePreference(scope = DEFAULT_THEME_SCOPE) {
  const initialThemePreference = getStoredThemePreference(scope);
  applyThemePreference(initialThemePreference);
  return initialThemePreference;
}
