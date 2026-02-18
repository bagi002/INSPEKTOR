import {
  createAdminAnnouncementMessage,
  listAdminAnnouncements,
} from "./admin.announcements.service.js";
import {
  deleteAdminUser,
  getAdminOverview,
  getAdminTickets,
  listAdminCases,
  listAdminUsers,
  loginToAdminPanel,
  patchAdminCase,
  patchAdminTicketStatus,
  patchAdminUser,
} from "./admin.service.js";

export async function adminLoginController(req, res) {
  const result = await loginToAdminPanel(req.body || {});

  res.status(200).json({
    ok: true,
    message: "Admin prijava je uspešna.",
    data: result,
  });
}

export async function adminOverviewController(req, res) {
  const result = await getAdminOverview();

  res.status(200).json({
    ok: true,
    message: "Admin overview je uspešno učitan.",
    data: result,
  });
}

export async function adminTicketsController(req, res) {
  const result = await getAdminTickets();

  res.status(200).json({
    ok: true,
    message: "Admin lista tiketa je uspešno učitana.",
    data: result,
  });
}

export async function adminAnnouncementsController(req, res) {
  const result = await listAdminAnnouncements();

  res.status(200).json({
    ok: true,
    message: "Admin lista obavještenja je uspešno učitana.",
    data: result,
  });
}

export async function adminCreateAnnouncementController(req, res) {
  const result = await createAdminAnnouncementMessage(
    req.body || {},
    req.adminAuth.userId
  );

  res.status(201).json({
    ok: true,
    message: "Admin obavještenje je uspešno kreirano.",
    data: result,
  });
}

export async function adminUpdateTicketStatusController(req, res) {
  const result = await patchAdminTicketStatus(req.params.ticketId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Status tiketa je uspešno izmenjen.",
    data: result,
  });
}

export async function adminUsersController(req, res) {
  const result = await listAdminUsers();

  res.status(200).json({
    ok: true,
    message: "Admin lista korisnika je uspešno učitana.",
    data: result,
  });
}

export async function adminUpdateUserController(req, res) {
  const result = await patchAdminUser(req.params.userId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Korisnik je uspešno izmenjen.",
    data: result,
  });
}

export async function adminDeleteUserController(req, res) {
  const result = await deleteAdminUser(req.params.userId, req.adminAuth.userId);

  res.status(200).json({
    ok: true,
    message: "Korisnik je uspešno obrisan.",
    data: result,
  });
}

export async function adminCasesController(req, res) {
  const result = await listAdminCases();

  res.status(200).json({
    ok: true,
    message: "Admin lista slučajeva je uspešno učitana.",
    data: result,
  });
}

export async function adminUpdateCaseController(req, res) {
  const result = await patchAdminCase(req.params.caseId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Slučaj je uspešno izmenjen.",
    data: result,
  });
}
