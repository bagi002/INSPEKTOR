import {
  deleteMyProfile,
  getMyProfile,
  updateMyProfileBasic,
  updateMyProfilePassword,
} from "./profile.service.js";

export async function getMyProfileController(req, res) {
  const result = await getMyProfile(req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Profil je uspesno ucitan.",
    data: result,
  });
}

export async function updateMyProfileBasicController(req, res) {
  const result = await updateMyProfileBasic(req.auth.userId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Osnovni podaci su uspesno azurirani.",
    data: result,
  });
}

export async function updateMyProfilePasswordController(req, res) {
  const result = await updateMyProfilePassword(req.auth.userId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Lozinka je uspesno promenjena.",
    data: result,
  });
}

export async function deleteMyProfileController(req, res) {
  const result = await deleteMyProfile(req.auth.userId, req.body || {});

  res.status(200).json({
    ok: true,
    message: "Nalog je uspesno obrisan.",
    data: result,
  });
}
