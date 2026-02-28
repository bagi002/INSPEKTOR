import { HttpError } from "../../utils/httpError.js";
import { getAdminCases, updateAdminCase } from "./admin.repository.js";
import { throwValidationIfNeeded, parseRequiredPositiveId } from "./admin.service.helpers.js";
import { validateAdminCasePatchPayload } from "./admin.validation.js";

export async function listAdminCases() {
  const cases = await getAdminCases();
  return { cases };
}

export async function patchAdminCase(caseId, payload) {
  const parsedCaseId = parseRequiredPositiveId(caseId, "Identifikator slučaja nije validan.");
  const { errors, sanitized } = validateAdminCasePatchPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za izmenu slučaja nisu validni.");

  const updatedCase = await updateAdminCase(parsedCaseId, sanitized);
  if (!updatedCase) {
    throw new HttpError(404, "Slučaj nije pronađen.");
  }

  return {
    case: updatedCase,
  };
}
