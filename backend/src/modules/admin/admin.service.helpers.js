import { HttpError } from "../../utils/httpError.js";
import { parsePositiveId } from "./admin.validation.js";

export function throwValidationIfNeeded(errors, message = "Podaci nisu validni.") {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, message, errors);
  }
}

export function parseRequiredPositiveId(rawId, errorMessage) {
  const parsedId = parsePositiveId(rawId);
  if (!parsedId) {
    throw new HttpError(400, errorMessage);
  }
  return parsedId;
}
