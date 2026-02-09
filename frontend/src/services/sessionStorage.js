const SESSION_TOKEN_STORAGE_KEY = "inspektor_session_token_v1";
const SESSION_USER_STORAGE_KEY = "inspektor_session_user_v1";

function isBrowser() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function saveSession(token, user) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(user));
}

export function getSession() {
  if (!isBrowser()) {
    return null;
  }

  const token = window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
  const rawUser = window.localStorage.getItem(SESSION_USER_STORAGE_KEY);

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

export function clearSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_USER_STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(getSession());
}
