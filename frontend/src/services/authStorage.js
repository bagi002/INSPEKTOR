const API_BASE = "/api/auth";
const SESSION_TOKEN_STORAGE_KEY = "inspektor_session_token_v1";
const SESSION_USER_STORAGE_KEY = "inspektor_session_user_v1";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

function isBrowser() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function saveSession(token, user) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(user));
}

async function parseResponseBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resolveApiError(payload, fallbackMessage) {
  if (payload?.errors && typeof payload.errors === "object") {
    return payload.errors;
  }

  return {
    general: payload?.message || fallbackMessage,
  };
}

function validateRegistrationInput(formData) {
  const errors = {};
  const firstName = (formData.firstName || "").trim();
  const lastName = (formData.lastName || "").trim();
  const email = normalizeEmail(formData.email);
  const password = formData.password || "";
  const confirmPassword = formData.confirmPassword || "";

  if (firstName.length < 2) {
    errors.firstName = "Ime mora imati najmanje 2 karaktera.";
  }

  if (lastName.length < 2) {
    errors.lastName = "Prezime mora imati najmanje 2 karaktera.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Unesi ispravnu email adresu.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Lozinka mora imati najmanje ${MIN_PASSWORD_LENGTH} karaktera.`;
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = "Lozinke se ne poklapaju.";
  }

  return {
    errors,
    sanitized: {
      firstName,
      lastName,
      email,
      password,
    },
  };
}

function validateLoginInput(formData) {
  const errors = {};
  const email = normalizeEmail(formData.email);
  const password = formData.password || "";

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Unesi ispravnu email adresu.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Lozinka mora imati najmanje ${MIN_PASSWORD_LENGTH} karaktera.`;
  }

  return {
    errors,
    sanitized: { email, password },
  };
}

export async function registerUser(formData) {
  const { errors, sanitized } = validateRegistrationInput(formData);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    });
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        errors: resolveApiError(payload, "Registracija nije uspela."),
      };
    }

    return {
      ok: true,
      message: payload?.message || "Registracija je uspesna.",
      user: payload?.data?.user || null,
    };
  } catch {
    return {
      ok: false,
      errors: {
        general: "Backend nije dostupan. Pokreni backend server i pokusaj ponovo.",
      },
    };
  }
}

export async function loginUser(formData) {
  const { errors, sanitized } = validateLoginInput(formData);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    });
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        errors: resolveApiError(payload, "Prijava nije uspela."),
      };
    }

    const token = payload?.data?.token;
    const user = payload?.data?.user;
    if (!token || !user) {
      return {
        ok: false,
        errors: {
          general: "Prijava nije uspela zbog neispravnog odgovora servera.",
        },
      };
    }

    saveSession(token, user);
    return {
      ok: true,
      token,
      user,
      message: payload?.message || "Prijava je uspesna.",
    };
  } catch {
    return {
      ok: false,
      errors: {
        general: "Backend nije dostupan. Pokreni backend server i pokusaj ponovo.",
      },
    };
  }
}
