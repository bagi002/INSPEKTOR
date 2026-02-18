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
    message: "Admin prijava je uspesna.",
    data: result,
  });
}

export async function adminOverviewController(req, res) {
  const result = await getAdminOverview();

  res.status(200).json({
    ok: true,
    message: "Admin overview je uspesno ucitan.",
    data: result,
  });
}

export async function adminTicketsController(req, res) {
  const result = await getAdminTickets();

  res.status(200).json({
    ok: true,
    message: "Admin lista tiketa je uspesno ucitana.",
    data: result,
  });
}

export async function adminUpdateTicketStatusController(req, res) {
  const result = await patchAdminTicketStatus(req.params.ticketId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Status tiketa je uspesno izmenjen.",
    data: result,
  });
}

export async function adminUsersController(req, res) {
  const result = await listAdminUsers();

  res.status(200).json({
    ok: true,
    message: "Admin lista korisnika je uspesno ucitana.",
    data: result,
  });
}

export async function adminUpdateUserController(req, res) {
  const result = await patchAdminUser(req.params.userId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Korisnik je uspesno izmenjen.",
    data: result,
  });
}

export async function adminDeleteUserController(req, res) {
  const result = await deleteAdminUser(req.params.userId, req.adminAuth.userId);

  res.status(200).json({
    ok: true,
    message: "Korisnik je uspesno obrisan.",
    data: result,
  });
}

export async function adminCasesController(req, res) {
  const result = await listAdminCases();

  res.status(200).json({
    ok: true,
    message: "Admin lista slucajeva je uspesno ucitana.",
    data: result,
  });
}

export async function adminUpdateCaseController(req, res) {
  const result = await patchAdminCase(req.params.caseId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Slucaj je uspesno izmenjen.",
    data: result,
  });
}
