export const AUTH_PASSWORD_MIN_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmail(value) {
  return toText(value).toLowerCase();
}

export function validateRegistrationPayload(payload) {
  const errors = {};
  const firstName = toText(payload.firstName);
  const lastName = toText(payload.lastName);
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (firstName.length < 2) {
    errors.firstName = "Ime mora imati najmanje 2 karaktera.";
  }

  if (lastName.length < 2) {
    errors.lastName = "Prezime mora imati najmanje 2 karaktera.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Unesi ispravnu email adresu.";
  }

  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.password = `Lozinka mora imati najmanje ${AUTH_PASSWORD_MIN_LENGTH} karaktera.`;
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

export function validateLoginPayload(payload) {
  const errors = {};
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Unesi ispravnu email adresu.";
  }

  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.password = `Lozinka mora imati najmanje ${AUTH_PASSWORD_MIN_LENGTH} karaktera.`;
  }

  return {
    errors,
    sanitized: {
      email,
      password,
    },
  };
}
