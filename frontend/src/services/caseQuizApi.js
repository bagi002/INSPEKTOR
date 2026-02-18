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

async function requestCaseQuiz(caseId, method, payload, fallbackMessage, endpointPath) {
  const authorizationHeader = buildAuthorizationHeader();
  if (!authorizationHeader) {
    return {
      ok: false,
      unauthorized: true,
      statusCode: 401,
      message: "Sesija nije aktivna. Prijavi se ponovo.",
      errors: null,
    };
  }

  try {
    const response = await fetch(`${CASES_API_BASE}/${caseId}/${endpointPath}`, {
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
        statusCode: response.status,
        message: resolveMessage(responsePayload, fallbackMessage),
        errors:
          responsePayload?.errors && typeof responsePayload.errors === "object"
            ? responsePayload.errors
            : null,
      };
    }

    return {
      ok: true,
      statusCode: response.status,
      message: resolveMessage(responsePayload, "Zahtev je uspešan."),
      data: responsePayload?.data || null,
      errors: null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      statusCode: 0,
      message: "Backend nije dostupan. Pokreni backend server i pokušaj ponovo.",
      errors: null,
    };
  }
}

export function fetchCaseQuiz(caseId, scope = "create") {
  const resolvedScope = scope === "solve" ? "solve" : "create";
  return requestCaseQuiz(
    caseId,
    "GET",
    null,
    "Učitavanje kviza nije uspelo.",
    `quiz?scope=${resolvedScope}`
  );
}

export function saveCaseQuiz(caseId, payload) {
  return requestCaseQuiz(caseId, "PUT", payload, "Čuvanje kviza nije uspelo.", "quiz");
}

export function submitCaseQuiz(caseId, payload) {
  return requestCaseQuiz(
    caseId,
    "POST",
    payload,
    "Predaja završnog kviza nije uspela.",
    "quiz/submit"
  );
}

export function fetchCaseReviews(caseId, scope = "solve") {
  const resolvedScope = scope === "create" ? "create" : "solve";
  return requestCaseQuiz(
    caseId,
    "GET",
    null,
    "Učitavanje recenzija nije uspelo.",
    `reviews?scope=${resolvedScope}`
  );
}

export function submitCaseReview(caseId, payload) {
  return requestCaseQuiz(
    caseId,
    "POST",
    payload,
    "Čuvanje ocjene nije uspelo.",
    "reviews"
  );
}
