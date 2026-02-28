import { AUTH_PASSWORD_MIN_LENGTH } from "../auth/auth.validation.js";

export function validateAdminPasswordPatchPayload(payload) {
  const errors = {};
  const currentPassword =
    typeof payload?.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword = typeof payload?.newPassword === "string" ? payload.newPassword : "";

  if (currentPassword.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.currentPassword =
      `Trenutna lozinka mora imati najmanje ${AUTH_PASSWORD_MIN_LENGTH} karaktera.`;
  }
  if (newPassword.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Nova lozinka mora imati najmanje ${AUTH_PASSWORD_MIN_LENGTH} karaktera.`;
  }
  if (!errors.newPassword && currentPassword === newPassword) {
    errors.newPassword = "Nova lozinka mora biti različita od trenutne.";
  }

  return {
    errors,
    sanitized: {
      currentPassword,
      newPassword,
    },
  };
}
