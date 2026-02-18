const ADMIN_API_BASE = "/api/admin";
const ADMIN_TOKEN_STORAGE_KEY = "inspektor_admin_panel_token_v1";
const ADMIN_USER_STORAGE_KEY = "inspektor_admin_panel_user_v1";

function isBrowser() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function parseResponseBody(response) {
  return response
    .json()
    .catch(() => null);
}

function resolveMessage(payload, fallbackMessage) {
  return payload?.message || fallbackMessage;
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

export async function loginAdmin(payload) {
  try {
    const response = await fetch(`${ADMIN_API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload || {}),
    });
    const responsePayload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        message: resolveMessage(responsePayload, "Admin prijava nije uspela."),
        errors:
          responsePayload?.errors && typeof responsePayload.errors === "object"
            ? responsePayload.errors
            : null,
      };
    }

    const token = responsePayload?.data?.token;
    const user = responsePayload?.data?.user;
    if (!token || !user) {
      return {
        ok: false,
        message: "Admin prijava nije uspela zbog neispravnog odgovora servera.",
        errors: null,
      };
    }

    saveAdminSession(token, user);
    return {
      ok: true,
      message: resolveMessage(responsePayload, "Admin prijava je uspesna."),
      data: responsePayload?.data || null,
    };
  } catch {
    return {
      ok: false,
      message: "Backend nije dostupan. Pokreni backend server i pokusaj ponovo.",
      errors: null,
    };
  }
}

async function requestAdmin(path, options = {}) {
  const session = loadAdminSession();
  if (!session?.token) {
    return {
      ok: false,
      unauthorized: true,
      message: "Admin sesija nije aktivna.",
      data: null,
      errors: null,
    };
  }

  try {
    const response = await fetch(`${ADMIN_API_BASE}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const responsePayload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        unauthorized: response.status === 401 || response.status === 403,
        message: resolveMessage(responsePayload, "Admin zahtev nije uspeo."),
        data: null,
        errors:
          responsePayload?.errors && typeof responsePayload.errors === "object"
            ? responsePayload.errors
            : null,
      };
    }

    return {
      ok: true,
      unauthorized: false,
      message: resolveMessage(responsePayload, "Admin zahtev je uspesan."),
      data: responsePayload?.data || null,
      errors: null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: "Backend nije dostupan. Pokreni backend server i pokusaj ponovo.",
      data: null,
      errors: null,
    };
  }
}

export function fetchAdminOverview() {
  return requestAdmin("/overview");
}

export function fetchAdminTickets() {
  return requestAdmin("/tickets");
}

export function updateAdminTicketStatus(ticketId, payload) {
  return requestAdmin(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function fetchAdminUsers() {
  return requestAdmin("/users");
}

export function updateAdminUser(userId, payload) {
  return requestAdmin(`/users/${userId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminUser(userId) {
  return requestAdmin(`/users/${userId}`, {
    method: "DELETE",
  });
}

export function fetchAdminCases() {
  return requestAdmin("/cases");
}

export function updateAdminCase(caseId, payload) {
  return requestAdmin(`/cases/${caseId}`, {
    method: "PATCH",
    body: payload,
  });
}
