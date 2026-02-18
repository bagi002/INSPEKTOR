import bcrypt from "bcryptjs";
import { HttpError } from "../../utils/httpError.js";
import {
  deleteProfileUserById,
  findProfileUserById,
  findProfileUserByIdWithPassword,
  findUserByEmailExceptId,
  getProfileUserActivity,
  updateProfileUserBasicById,
  updateProfileUserPasswordById,
} from "./profile.repository.js";
import {
  validateProfileBasicPayload,
  validateProfileDeletePayload,
  validateProfilePasswordPayload,
} from "./profile.validation.js";

const SALT_ROUNDS = 10;

function throwValidationIfNeeded(errors) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Podaci nisu validni.", errors);
  }
}

function sanitizeUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role || "user",
    createdAt: user.createdAt,
  };
}

async function requireExistingUserById(userId) {
  const user = await findProfileUserById(userId);
  if (!user) {
    throw new HttpError(404, "Korisnik nije pronadjen.");
  }

  return user;
}

async function requireExistingUserByIdWithPassword(userId) {
  const user = await findProfileUserByIdWithPassword(userId);
  if (!user) {
    throw new HttpError(404, "Korisnik nije pronadjen.");
  }

  return user;
}

export async function getMyProfile(userId) {
  const user = await requireExistingUserById(userId);
  const activity = await getProfileUserActivity(userId);

  return {
    user: sanitizeUser(user),
    activity,
  };
}

export async function updateMyProfileBasic(userId, payload) {
  const { errors, sanitized } = validateProfileBasicPayload(payload);
  throwValidationIfNeeded(errors);

  await requireExistingUserById(userId);
  const conflictingUser = await findUserByEmailExceptId(sanitized.email, userId);
  if (conflictingUser) {
    throw new HttpError(409, "Nalog sa ovom email adresom vec postoji.", {
      email: "Nalog sa ovom email adresom vec postoji.",
    });
  }

  const updatedUser = await updateProfileUserBasicById(userId, sanitized);
  if (!updatedUser) {
    throw new HttpError(404, "Korisnik nije pronadjen.");
  }

  return {
    user: sanitizeUser(updatedUser),
  };
}

export async function updateMyProfilePassword(userId, payload) {
  const { errors, sanitized } = validateProfilePasswordPayload(payload);
  throwValidationIfNeeded(errors);

  const user = await requireExistingUserByIdWithPassword(userId);
  const passwordMatches = await bcrypt.compare(sanitized.currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      currentPassword: "Trenutna lozinka nije ispravna.",
    });
  }

  const nextPasswordHash = await bcrypt.hash(sanitized.newPassword, SALT_ROUNDS);
  const updated = await updateProfileUserPasswordById(userId, nextPasswordHash);
  if (!updated) {
    throw new HttpError(404, "Korisnik nije pronadjen.");
  }

  return { success: true };
}

export async function deleteMyProfile(userId, payload) {
  const { errors, sanitized } = validateProfileDeletePayload(payload);
  throwValidationIfNeeded(errors);

  const user = await requireExistingUserByIdWithPassword(userId);
  const passwordMatches = await bcrypt.compare(sanitized.password, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      password: "Lozinka nije ispravna.",
    });
  }

  const deleted = await deleteProfileUserById(userId);
  if (!deleted) {
    throw new HttpError(404, "Korisnik nije pronadjen.");
  }

  return {
    deletedUserId: userId,
  };
}
