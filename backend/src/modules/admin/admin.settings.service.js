import { HttpError } from "../../utils/httpError.js";
import {
  getActiveAppVersionSetting,
  setActiveAppVersionSetting,
} from "../appSettings/appSettings.repository.js";
import { validateAdminActiveAppVersionPayload } from "./admin.validation.js";

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
