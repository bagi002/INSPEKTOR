import {
  clearAdminSession,
  loadAdminSession,
  saveAdminSession,
} from "./adminSessionStorage";
const ADMIN_API_BASE = "/api/admin";

function parseResponseBody(response) {
  return response
    .json()
    .catch(() => null);
}

function resolveMessage(payload, fallbackMessage) {
  return payload?.message || fallbackMessage;
}
export { clearAdminSession, loadAdminSession, saveAdminSession };

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
      message: resolveMessage(responsePayload, "Admin prijava je uspešna."),
      data: responsePayload?.data || null,
    };
  } catch {
    return {
      ok: false,
      message: "Backend nije dostupan. Pokreni backend server i pokušaj ponovo.",
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
      message: resolveMessage(responsePayload, "Admin zahtev je uspešan."),
      data: responsePayload?.data || null,
      errors: null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: "Backend nije dostupan. Pokreni backend server i pokušaj ponovo.",
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

export function fetchAdminSettings() {
  return requestAdmin("/settings");
}

export function updateAdminTicketStatus(ticketId, payload) {
  return requestAdmin(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function updateAdminActiveAppVersion(payload) {
  return requestAdmin("/settings/active-app-version", {
    method: "PATCH",
    body: payload,
  });
}

export function fetchAdminAnnouncements() {
  return requestAdmin("/announcements");
}

export function createAdminAnnouncement(payload) {
  return requestAdmin("/announcements", {
    method: "POST",
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
