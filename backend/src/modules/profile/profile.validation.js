import { AUTH_PASSWORD_MIN_LENGTH } from "../auth/auth.validation.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value) {
  return toText(value).toLowerCase();
}

export function validateProfileBasicPayload(payload) {
  const errors = {};
  const firstName = toText(payload?.firstName);
  const lastName = toText(payload?.lastName);
  const email = normalizeEmail(payload?.email);

  if (firstName.length < 2) {
    errors.firstName = "Ime mora imati najmanje 2 karaktera.";
  }
  if (lastName.length < 2) {
    errors.lastName = "Prezime mora imati najmanje 2 karaktera.";
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Unesi ispravnu email adresu.";
  }

  return {
    errors,
    sanitized: {
      firstName,
      lastName,
      email,
    },
  };
}

export function validateProfilePasswordPayload(payload) {
  const errors = {};
  const currentPassword =
    typeof payload?.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword = typeof payload?.newPassword === "string" ? payload.newPassword : "";

  if (currentPassword.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.currentPassword =
      `Trenutna lozinka mora imati najmanje ${AUTH_PASSWORD_MIN_LENGTH} karaktera.`;
  }
  if (newPassword.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.newPassword =
      `Nova lozinka mora imati najmanje ${AUTH_PASSWORD_MIN_LENGTH} karaktera.`;
  }
  if (!errors.newPassword && currentPassword === newPassword) {
    errors.newPassword = "Nova lozinka mora biti razlicita od trenutne.";
  }

  return {
    errors,
    sanitized: {
      currentPassword,
      newPassword,
    },
  };
}

export function validateProfileDeletePayload(payload) {
  const errors = {};
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.password = `Lozinka mora imati najmanje ${AUTH_PASSWORD_MIN_LENGTH} karaktera.`;
  }

  return {
    errors,
    sanitized: { password },
  };
}
