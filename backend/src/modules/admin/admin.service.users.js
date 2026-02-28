import { HttpError } from "../../utils/httpError.js";
import { findUserByEmail } from "../auth/auth.repository.js";
import {
  countAdminUsers,
  deactivateAdminAccountByEmail,
  deleteAdminUserById,
  findAdminAccountById,
  findAdminUserById,
  findAdminUserByIdWithPassword,
  getAdminUsers,
  upsertAdminAccountFromUserProfile,
  updateAdminUser,
} from "./admin.repository.js";
import { throwValidationIfNeeded, parseRequiredPositiveId } from "./admin.service.helpers.js";
import { validateAdminUserPatchPayload } from "./admin.validation.js";

export async function listAdminUsers() {
  const users = await getAdminUsers();
  return { users };
}

export async function patchAdminUser(userId, payload) {
  const parsedUserId = parseRequiredPositiveId(userId, "Identifikator korisnika nije validan.");
  const { errors, sanitized } = validateAdminUserPatchPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za izmenu korisnika nisu validni.");
  const existingUser = await findAdminUserByIdWithPassword(parsedUserId);
  if (!existingUser) {
    throw new HttpError(404, "Korisnik nije pronađen.");
  }

  let updatedUser = null;
  try {
    updatedUser = await updateAdminUser(parsedUserId, sanitized);
  } catch (error) {
    const errorMessage = String(error?.message || "");
    if (errorMessage.includes("UNIQUE constraint failed: users.email")) {
      throw new HttpError(409, "Email adresa je već zauzeta.");
    }
    throw error;
  }
  if (!updatedUser) {
    throw new HttpError(404, "Korisnik nije pronađen.");
  }

  const previousEmail = String(existingUser.email || "").toLowerCase();
  const updatedEmail = String(updatedUser.email || "").toLowerCase();
  if (existingUser.role === "admin" && previousEmail && previousEmail !== updatedEmail) {
    await deactivateAdminAccountByEmail(previousEmail);
  }
  if (updatedUser.role === "admin") {
    const userWithPassword = await findUserByEmail(updatedUser.email);
    if (userWithPassword) {
      await upsertAdminAccountFromUserProfile({
        firstName: userWithPassword.firstName,
        lastName: userWithPassword.lastName,
        email: userWithPassword.email,
        passwordHash: userWithPassword.passwordHash,
      });
    }
  } else if (existingUser.role === "admin" && updatedEmail) {
    await deactivateAdminAccountByEmail(updatedEmail);
  }

  return {
    user: updatedUser,
  };
}

export async function deleteAdminUser(userId, requesterAdminAccountId) {
  const parsedUserId = parseRequiredPositiveId(userId, "Identifikator korisnika nije validan.");

  const targetUser = await findAdminUserById(parsedUserId);
  if (!targetUser) {
    throw new HttpError(404, "Korisnik nije pronađen.");
  }

  if (requesterAdminAccountId) {
    const requesterAdminAccount = await findAdminAccountById(requesterAdminAccountId);
    if (
      requesterAdminAccount &&
      requesterAdminAccount.email.toLowerCase() === String(targetUser.email || "").toLowerCase()
    ) {
      throw new HttpError(
        400,
        "Nije dozvoljeno brisanje korisničkog naloga koji deli email sa trenutnim admin nalogom."
      );
    }
  }

  if (targetUser.role === "admin") {
    const adminsCount = await countAdminUsers();
    if (adminsCount <= 1) {
      throw new HttpError(400, "Nije dozvoljeno brisanje poslednjeg admin naloga.");
    }
  }

  const deleted = await deleteAdminUserById(parsedUserId);
  if (!deleted) {
    throw new HttpError(404, "Korisnik nije pronađen.");
  }

  return {
    deletedUserId: parsedUserId,
  };
}
