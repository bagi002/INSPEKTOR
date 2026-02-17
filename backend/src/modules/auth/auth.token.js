import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user",
      scope: "user",
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function createAdminPanelToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: "admin",
      scope: "admin_panel",
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
