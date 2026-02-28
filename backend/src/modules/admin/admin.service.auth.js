import bcrypt from "bcryptjs";
import { HttpError } from "../../utils/httpError.js";
import { createAdminPanelToken } from "../auth/auth.token.js";
import { findUserByEmail } from "../auth/auth.repository.js";
import {
  findAdminAccountByEmail,
  upsertAdminAccountFromUserProfile,
} from "./admin.repository.js";
import { validateAdminLoginPayload } from "./admin.validation.js";
import { throwValidationIfNeeded } from "./admin.service.helpers.js";

function sanitizeAdminUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: "admin_panel",
  };
}

async function autoProvisionAdminAccountFromLegacyRole(email, plainPassword) {
  const fallbackUser = await findUserByEmail(email);
  if (!fallbackUser || fallbackUser.role !== "admin") {
    return null;
  }

  const passwordMatches = await bcrypt.compare(plainPassword, fallbackUser.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      password: "Pogresna lozinka.",
    });
  }

  await upsertAdminAccountFromUserProfile({
    firstName: fallbackUser.firstName,
    lastName: fallbackUser.lastName,
    email: fallbackUser.email,
    passwordHash: fallbackUser.passwordHash,
  });

  return findAdminAccountByEmail(email, { includePasswordHash: true });
}

export async function loginToAdminPanel(payload) {
  const { errors, sanitized } = validateAdminLoginPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za prijavu nisu validni.");

  let adminAccount = await findAdminAccountByEmail(sanitized.email, {
    includePasswordHash: true,
  });
  if (!adminAccount || !adminAccount.isActive) {
    adminAccount = await autoProvisionAdminAccountFromLegacyRole(
      sanitized.email,
      sanitized.password
    ) || adminAccount;
  }
  if (!adminAccount) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      email: "Nalog sa ovom email adresom ne postoji.",
    });
  }
  if (!adminAccount.isActive) {
    throw new HttpError(403, "Admin nalog nije aktivan.");
  }

  const passwordMatches = await bcrypt.compare(sanitized.password, adminAccount.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      password: "Pogresna lozinka.",
    });
  }

  return {
    token: createAdminPanelToken(adminAccount),
    user: sanitizeAdminUser(adminAccount),
  };
}
