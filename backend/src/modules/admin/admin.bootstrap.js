import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import {
  createUser,
  findUserByEmail,
  hasAdminUsers,
  updateUserRoleById,
} from "../auth/auth.repository.js";

const SALT_ROUNDS = 10;

function normalizeText(value, fallback) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

export async function ensureAdminBootstrapUser() {
  const alreadyExists = await hasAdminUsers();
  if (alreadyExists) {
    return { created: false };
  }

  const password = env.adminBootstrapPassword;
  if (typeof password !== "string" || password.length < 8) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PASSWORD mora biti definisana i imati najmanje 8 karaktera."
    );
  }

  const normalizedEmail = normalizeText(env.adminBootstrapEmail, "admin@inspektor.local").toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    const wasPromoted = existingUser.role !== "admin";
    if (wasPromoted) {
      await updateUserRoleById(existingUser.id, "admin");
    }

    return {
      created: wasPromoted,
      user: {
        id: existingUser.id,
        email: existingUser.email,
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const createdUser = await createUser({
    firstName: normalizeText(env.adminBootstrapFirstName, "System"),
    lastName: normalizeText(env.adminBootstrapLastName, "Admin"),
    email: normalizedEmail,
    passwordHash,
    role: "admin",
  });

  return {
    created: true,
    user: {
      id: createdUser.id,
      email: createdUser.email,
    },
  };
}
