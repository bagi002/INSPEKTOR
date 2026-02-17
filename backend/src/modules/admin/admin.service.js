import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { HttpError } from "../../utils/httpError.js";
import { findUserByEmail } from "../auth/auth.repository.js";
import { createAdminPanelToken } from "../auth/auth.token.js";
import {
  getAllSupportTickets,
  updateSupportTicketStatus,
} from "../support/support.repository.js";
import {
  getAdminCases,
  getAdminOverviewCounts,
  getAdminUsers,
  updateAdminCase,
  updateAdminUser,
} from "./admin.repository.js";
import {
  parsePositiveId,
  validateAdminCasePatchPayload,
  validateAdminLoginPayload,
  validateAdminTicketStatusPayload,
  validateAdminUserPatchPayload,
} from "./admin.validation.js";

function throwValidationIfNeeded(errors, message = "Podaci nisu validni.") {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, message, errors);
  }
}

function sanitizeAdminUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}

function parseRequiredPositiveId(rawId, errorMessage) {
  const parsedId = parsePositiveId(rawId);
  if (!parsedId) {
    throw new HttpError(400, errorMessage);
  }

  return parsedId;
}

export async function loginToAdminPanel(payload) {
  const { errors, sanitized } = validateAdminLoginPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za prijavu nisu validni.");

  if (sanitized.panelPassword !== env.adminPanelPassword) {
    throw new HttpError(401, "Lozinka za admin panel nije ispravna.", {
      panelPassword: "Lozinka za admin panel nije ispravna.",
    });
  }

  const user = await findUserByEmail(sanitized.email);
  if (!user) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      email: "Nalog sa ovom email adresom ne postoji.",
    });
  }
  if (user.role !== "admin") {
    throw new HttpError(403, "Korisnik nema admin prava.");
  }

  const passwordMatches = await bcrypt.compare(sanitized.password, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      password: "Pogresna lozinka.",
    });
  }

  return {
    token: createAdminPanelToken(user),
    user: sanitizeAdminUser(user),
  };
}

export async function getAdminOverview() {
  const overview = await getAdminOverviewCounts();
  return {
    overview,
  };
}

export async function getAdminTickets() {
  const tickets = await getAllSupportTickets();
  return {
    tickets,
  };
}

export async function patchAdminTicketStatus(ticketId, payload) {
  const parsedTicketId = parseRequiredPositiveId(ticketId, "Identifikator tiketa nije validan.");
  const { errors, sanitized } = validateAdminTicketStatusPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za izmenu tiketa nisu validni.");

  const updatedTicket = await updateSupportTicketStatus(
    parsedTicketId,
    sanitized.status,
    sanitized.adminNote
  );
  if (!updatedTicket) {
    throw new HttpError(404, "Tiket nije pronadjen.");
  }

  return {
    ticket: updatedTicket,
  };
}

export async function listAdminUsers() {
  const users = await getAdminUsers();
  return {
    users,
  };
}

export async function patchAdminUser(userId, payload) {
  const parsedUserId = parseRequiredPositiveId(userId, "Identifikator korisnika nije validan.");
  const { errors, sanitized } = validateAdminUserPatchPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za izmenu korisnika nisu validni.");

  let updatedUser = null;
  try {
    updatedUser = await updateAdminUser(parsedUserId, sanitized);
  } catch (error) {
    const errorMessage = String(error?.message || "");
    if (errorMessage.includes("UNIQUE constraint failed: users.email")) {
      throw new HttpError(409, "Email adresa je vec zauzeta.");
    }
    throw error;
  }
  if (!updatedUser) {
    throw new HttpError(404, "Korisnik nije pronadjen.");
  }

  return {
    user: updatedUser,
  };
}

export async function listAdminCases() {
  const cases = await getAdminCases();
  return {
    cases,
  };
}

export async function patchAdminCase(caseId, payload) {
  const parsedCaseId = parseRequiredPositiveId(caseId, "Identifikator slucaja nije validan.");
  const { errors, sanitized } = validateAdminCasePatchPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za izmenu slucaja nisu validni.");

  const updatedCase = await updateAdminCase(parsedCaseId, sanitized);
  if (!updatedCase) {
    throw new HttpError(404, "Slucaj nije pronadjen.");
  }

  return {
    case: updatedCase,
  };
}
