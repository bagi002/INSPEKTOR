import { updateSolveCasePersonRole } from "./cases.people.service.js";

export async function updateSolveCasePersonRoleController(req, res) {
  const result = await updateSolveCasePersonRole(
    req.params.caseId,
    req.params.personId,
    req.body || {},
    req.auth.userId
  );

  res.status(200).json({
    ok: true,
    message: "Uloga osobe je uspešno ažurirana za režim rešavanja.",
    data: result,
  });
}
