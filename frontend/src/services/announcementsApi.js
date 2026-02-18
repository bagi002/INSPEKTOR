import { getSession } from "./sessionStorage";

const ANNOUNCEMENTS_API_BASE = "/api/announcements";

async function parseResponseBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resolveMessage(payload, fallbackMessage) {
  return payload?.message || fallbackMessage;
}

function getAuthorizationHeader() {
  const session = getSession();
  if (!session?.token) {
    return null;
  }
  return `Bearer ${session.token}`;
}

export async function fetchPendingAnnouncements() {
  const authorizationHeader = getAuthorizationHeader();
  if (!authorizationHeader) {
    return {
      ok: false,
      unauthorized: true,
      message: "Sesija nije aktivna. Prijavi se ponovo.",
      data: null,
    };
  }

  try {
    const response = await fetch(`${ANNOUNCEMENTS_API_BASE}/pending`, {
      method: "GET",
      headers: {
        Authorization: authorizationHeader,
      },
    });
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        unauthorized: response.status === 401,
        message: resolveMessage(payload, "Učitavanje obavještenja nije uspelo."),
        data: null,
      };
    }

    return {
      ok: true,
      unauthorized: false,
      message: resolveMessage(payload, "Obavještenja su uspešno učitana."),
      data: payload?.data || null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: "Backend nije dostupan. Pokreni backend server i pokušaj ponovo.",
      data: null,
    };
  }
}

export async function dismissAnnouncement(announcementId) {
  const authorizationHeader = getAuthorizationHeader();
  if (!authorizationHeader) {
    return {
      ok: false,
      unauthorized: true,
      message: "Sesija nije aktivna. Prijavi se ponovo.",
      data: null,
    };
  }

  try {
    const response = await fetch(
      `${ANNOUNCEMENTS_API_BASE}/${announcementId}/dismiss`,
      {
        method: "POST",
        headers: {
          Authorization: authorizationHeader,
        },
      }
    );
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        unauthorized: response.status === 401,
        message: resolveMessage(payload, "Zatvaranje obavještenja nije uspelo."),
        data: null,
      };
    }

    return {
      ok: true,
      unauthorized: false,
      message: resolveMessage(payload, "Obavještenje je zatvoreno."),
      data: payload?.data || null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: "Backend nije dostupan. Pokreni backend server i pokušaj ponovo.",
      data: null,
    };
  }
}
