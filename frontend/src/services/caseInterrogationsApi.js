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

async function requestCaseInterrogations(caseId, method, payload, fallbackMessage) {
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
    const response = await fetch(`${CASES_API_BASE}/${caseId}/interrogations`, {
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

export function fetchCaseInterrogations(caseId) {
  return requestCaseInterrogations(caseId, "GET", null, "Ucitavanje saslusanja nije uspelo.");
}

export function createCaseInterrogation(caseId, payload) {
  return requestCaseInterrogations(caseId, "POST", payload, "Cuvanje saslusanja nije uspelo.");
}
