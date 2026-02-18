import {
  createSupportTicketForUser,
  getMySupportTickets,
} from "./support.service.js";

export async function createSupportTicketController(req, res) {
  const result = await createSupportTicketForUser(req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Tiket je uspešno kreiran.",
    data: result,
  });
}

export async function getMySupportTicketsController(req, res) {
  const result = await getMySupportTickets(req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Ticketi su uspešno učitani.",
    data: result,
  });
}
