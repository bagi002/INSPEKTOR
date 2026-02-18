import { getSession } from "./sessionStorage";

const PROFILE_API_BASE = "/api/profile";

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

function resolveErrors(payload) {
  return payload?.errors && typeof payload.errors === "object" ? payload.errors : null;
}

function buildAuthorizationHeader() {
  const session = getSession();
  if (!session?.token) {
    return null;
  }

  return `Bearer ${session.token}`;
}

async function performProfileRequest(pathname, method, payload, fallbackMessage) {
  const authorizationHeader = buildAuthorizationHeader();
  if (!authorizationHeader) {
    return {
      ok: false,
      unauthorized: true,
      message: "Sesija nije aktivna. Prijavi se ponovo.",
      errors: null,
      data: null,
    };
  }

  try {
    const response = await fetch(`${PROFILE_API_BASE}${pathname}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      body: payload === undefined ? undefined : JSON.stringify(payload || {}),
    });
    const responsePayload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        unauthorized: response.status === 401,
        message: resolveMessage(responsePayload, fallbackMessage),
        errors: resolveErrors(responsePayload),
        data: responsePayload?.data || null,
      };
    }

    return {
      ok: true,
      unauthorized: false,
      message: resolveMessage(responsePayload, "Uspesno."),
      errors: null,
      data: responsePayload?.data || null,
    };
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: "Backend nije dostupan. Pokreni backend server i pokusaj ponovo.",
      errors: null,
      data: null,
    };
  }
}

export async function fetchMyProfile() {
  return performProfileRequest("/", "GET", undefined, "Ucitavanje profila nije uspelo.");
}

export async function updateMyProfileBasic(payload) {
  return performProfileRequest("/basic", "PUT", payload, "Azuriranje osnovnih podataka nije uspelo.");
}

export async function updateMyProfilePassword(payload) {
  return performProfileRequest("/password", "PUT", payload, "Promena lozinke nije uspela.");
}

export async function deleteMyProfile(payload) {
  return performProfileRequest("/", "DELETE", payload, "Brisanje naloga nije uspelo.");
}
