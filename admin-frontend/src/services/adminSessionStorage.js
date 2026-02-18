const ADMIN_TOKEN_STORAGE_KEY = "inspektor_admin_panel_token_v1";
const ADMIN_USER_STORAGE_KEY = "inspektor_admin_panel_user_v1";

function isBrowser() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadAdminSession() {
  if (!isBrowser()) {
    return null;
  }

  const token = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  const rawUser = window.localStorage.getItem(ADMIN_USER_STORAGE_KEY);
  if (!token || !rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    return { token, user };
  } catch {
    return null;
  }
}

export function saveAdminSession(token, user) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
}
