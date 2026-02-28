import bcrypt from "bcryptjs";
import { HttpError } from "../../utils/httpError.js";
import {
  getActiveAppVersionSetting,
  setActiveAppVersionSetting,
} from "../appSettings/appSettings.repository.js";
import {
  findAdminAccountById,
  updateAdminAccountPasswordById,
} from "./admin.repository.js";
import {
  validateAdminActiveAppVersionPayload,
  validateAdminPasswordPatchPayload,
} from "./admin.validation.js";

const SALT_ROUNDS = 10;

function throwValidationIfNeeded(errors, message = "Podaci nisu validni.") {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, message, errors);
  }
}

export async function getAdminSettings() {
  const activeAppVersion = await getActiveAppVersionSetting();
  return {
    activeAppVersion,
  };
}

export async function patchAdminActiveAppVersion(payload) {
  const { errors, sanitized } = validateAdminActiveAppVersionPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za izmenu aktivne verzije nisu validni.");

  const activeAppVersion = await setActiveAppVersionSetting(sanitized.activeAppVersion);
  return {
    activeAppVersion,
  };
}

export async function patchAdminOwnPassword(adminAccountId, payload) {
  const { errors, sanitized } = validateAdminPasswordPatchPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za promjenu lozinke nisu validni.");

  const adminAccount = await findAdminAccountById(adminAccountId, {
    includePasswordHash: true,
  });
  if (!adminAccount || !adminAccount.isActive) {
    throw new HttpError(404, "Admin nalog nije pronađen.");
  }

  const passwordMatches = await bcrypt.compare(sanitized.currentPassword, adminAccount.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      currentPassword: "Trenutna lozinka nije ispravna.",
    });
  }

  const nextPasswordHash = await bcrypt.hash(sanitized.newPassword, SALT_ROUNDS);
  const updated = await updateAdminAccountPasswordById(adminAccountId, nextPasswordHash);
  if (!updated) {
    throw new HttpError(404, "Admin nalog nije pronađen.");
  }

  return {
    success: true,
  };
}
