import { HttpError } from "../../utils/httpError.js";
import {
  getAllSupportTickets,
  updateSupportTicketStatus,
} from "../support/support.repository.js";
import { getAdminOverviewCounts } from "./admin.repository.js";
import { throwValidationIfNeeded, parseRequiredPositiveId } from "./admin.service.helpers.js";
import { validateAdminTicketStatusPayload } from "./admin.validation.js";

export async function getAdminOverview() {
  const overview = await getAdminOverviewCounts();
  return { overview };
}

export async function getAdminTickets() {
  const tickets = await getAllSupportTickets();
  return { tickets };
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
    throw new HttpError(404, "Tiket nije pronađen.");
  }

  return {
    ticket: updatedTicket,
  };
}
