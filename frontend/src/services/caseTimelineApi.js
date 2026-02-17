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

async function requestCaseTimeline(caseId, method, payload, fallbackMessage, endpoint = "timeline") {
  const authorizationHeader = buildAuthorizationHeader();
  if (!authorizationHeader) {
    return {
      ok: false,
      unauthorized: true,
      message: "Sesija nije aktivna. Prijavi se ponovo.",
      errors: null,
    };
  }

  try {
    const response = await fetch(`${CASES_API_BASE}/${caseId}/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      body: method === "GET" ? undefined : JSON.stringify(payload || {}),
    });

    const responsePayload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        unauthorized: response.status === 401,
        message: resolveMessage(responsePayload, fallbackMessage),
        errors:
          responsePayload?.errors && typeof responsePayload.errors === "object"
            ? responsePayload.errors
            : null,
      };
    }

    return {
      ok: true,
      message: resolveMessage(responsePayload, "Zahtev je uspesan."),
      data: responsePayload?.data || null,
      errors: null,
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

export function fetchCaseTimeline(caseId) {
  return requestCaseTimeline(caseId, "GET", null, "Ucitavanje vremenske linije nije uspelo.");
}

export function replaceCaseTimeline(caseId, payload) {
  return requestCaseTimeline(
    caseId,
    "PUT",
    payload,
    "Cuvanje vremenske linije nije uspelo."
  );
}

export function advanceCaseTimeline(caseId) {
  return requestCaseTimeline(
    caseId,
    "POST",
    {},
    "Otkljucavanje sledece timeline stavke nije uspelo.",
    "timeline/advance"
  );
}
