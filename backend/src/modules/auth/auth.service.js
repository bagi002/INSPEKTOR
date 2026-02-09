import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { HttpError } from "../../utils/httpError.js";
import { createUser, findUserByEmail } from "./auth.repository.js";
import {
  validateLoginPayload,
  validateRegistrationPayload,
} from "./auth.validation.js";

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function throwValidationIfNeeded(errors) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Podaci nisu validni.", errors);
  }
}

export async function registerUser(payload) {
  const { errors, sanitized } = validateRegistrationPayload(payload);
  throwValidationIfNeeded(errors);

  const existingUser = await findUserByEmail(sanitized.email);
  if (existingUser) {
    throw new HttpError(409, "Nalog sa ovom email adresom vec postoji.", {
      email: "Nalog sa ovom email adresom vec postoji.",
    });
  }

  const passwordHash = await bcrypt.hash(sanitized.password, SALT_ROUNDS);
  const createdUser = await createUser({
    firstName: sanitized.firstName,
    lastName: sanitized.lastName,
    email: sanitized.email,
    passwordHash,
  });

  return {
    user: sanitizeUser(createdUser),
  };
}

export async function loginUser(payload) {
  const { errors, sanitized } = validateLoginPayload(payload);
  throwValidationIfNeeded(errors);

  const user = await findUserByEmail(sanitized.email);
  if (!user) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      email: "Nalog sa ovom email adresom ne postoji.",
    });
  }

  const passwordMatches = await bcrypt.compare(sanitized.password, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Neispravni kredencijali.", {
      password: "Pogresna lozinka.",
    });
  }

  return {
    token: createAccessToken(user),
    user: sanitizeUser(user),
  };
}
