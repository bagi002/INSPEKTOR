import { loginUser, registerUser } from "./auth.service.js";

export async function registerController(req, res) {
  const result = await registerUser(req.body || {});

  res.status(201).json({
    ok: true,
    message: "Registracija je uspesna.",
    data: result,
  });
}

export async function loginController(req, res) {
  const result = await loginUser(req.body || {});

  res.status(200).json({
    ok: true,
    message: "Prijava je uspesna.",
    data: result,
  });
}
