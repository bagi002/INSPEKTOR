import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import {
  createAdminAccount,
  findAdminAccountByEmail,
  hasAdminAccounts,
} from "./admin.repository.js";

const SALT_ROUNDS = 10;

function normalizeText(value, fallback) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

export async function ensureAdminBootstrapAccount() {
  const alreadyExists = await hasAdminAccounts();
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
  const existingAccount = await findAdminAccountByEmail(normalizedEmail);
  if (existingAccount) {
    return {
      created: false,
      user: {
        id: existingAccount.id,
        email: existingAccount.email,
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const createdAccount = await createAdminAccount({
    firstName: normalizeText(env.adminBootstrapFirstName, "System"),
    lastName: normalizeText(env.adminBootstrapLastName, "Admin"),
    email: normalizedEmail,
    passwordHash,
  });

  return {
    created: true,
    user: {
      id: createdAccount.id,
      email: createdAccount.email,
    },
  };
}
