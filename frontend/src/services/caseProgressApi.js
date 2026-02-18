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

export async function resetCaseProgressToSolve(caseId) {
  const authorizationHeader = buildAuthorizationHeader();
  if (!authorizationHeader) {
    return {
      ok: false,
      unauthorized: true,
      message: "Sesija nije aktivna. Prijavi se ponovo.",
    };
  }

  try {
    const response = await fetch(
      `${CASES_API_BASE}/${caseId}/progress/reset-to-solve`,
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
        message: resolveMessage(payload, "Vraćanje slučaja u režim rešavanja nije uspelo."),
      };
    }

    return {
      ok: true,
      message: resolveMessage(payload, "Status slučaja je vraćen na režim rešavanja."),
      data: payload?.data || null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: "Backend nije dostupan. Pokreni backend server i pokušaj ponovo.",
    };
  }
}
