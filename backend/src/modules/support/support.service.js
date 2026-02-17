import { HttpError } from "../../utils/httpError.js";
import {
  createSupportTicket,
  getSupportTicketsByReporterUserId,
} from "./support.repository.js";
import { validateCreateSupportTicketPayload } from "./support.validation.js";

function throwValidationIfNeeded(errors) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Podaci za tiket nisu validni.", errors);
  }
}

export async function createSupportTicketForUser(payload, reporterUserId) {
  const { errors, sanitized } = validateCreateSupportTicketPayload(payload);
  throwValidationIfNeeded(errors);

  const createdTicket = await createSupportTicket({
    reporterUserId,
    ticketType: sanitized.ticketType,
    title: sanitized.title,
    description: sanitized.description,
    appLocation: sanitized.appLocation,
    appVersion: sanitized.appVersion,
  });

  return {
    ticket: createdTicket,
  };
}

export async function getMySupportTickets(userId) {
  const tickets = await getSupportTicketsByReporterUserId(userId);
  return {
    tickets,
  };
}
