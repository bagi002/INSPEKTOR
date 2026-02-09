import { getSession } from "./sessionStorage";

const CASES_API_BASE = "/api/cases";

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

function buildAuthorizationHeader() {
  const session = getSession();
  if (!session?.token) {
    return null;
  }

  return `Bearer ${session.token}`;
}

export async function fetchLoggedHomeCases() {
  const authorizationHeader = buildAuthorizationHeader();
  if (!authorizationHeader) {
    return {
      ok: false,
      unauthorized: true,
      message: "Sesija nije aktivna. Prijavi se ponovo.",
    };
  }

  try {
    const response = await fetch(`${CASES_API_BASE}/home`, {
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
        message: resolveMessage(payload, "Ucitavanje slucajeva nije uspelo."),
      };
    }

    return {
      ok: true,
      data: payload?.data || null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: "Backend nije dostupan. Pokreni backend server i pokusaj ponovo.",
    };
  }
}

export async function createCase(payload) {
  const authorizationHeader = buildAuthorizationHeader();
  if (!authorizationHeader) {
    return {
      ok: false,
      unauthorized: true,
      message: "Sesija nije aktivna. Prijavi se ponovo.",
    };
  }

  try {
    const response = await fetch(CASES_API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      body: JSON.stringify(payload || {}),
    });
    const responsePayload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        unauthorized: response.status === 401,
        message: resolveMessage(responsePayload, "Cuvanje slucaja nije uspelo."),
        errors:
          responsePayload?.errors && typeof responsePayload.errors === "object"
            ? responsePayload.errors
            : null,
      };
    }

    return {
      ok: true,
      message: resolveMessage(responsePayload, "Slucaj je uspesno sacuvan."),
      data: responsePayload?.data || null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: "Backend nije dostupan. Pokreni backend server i pokusaj ponovo.",
      errors: null,
    };
  }
}
