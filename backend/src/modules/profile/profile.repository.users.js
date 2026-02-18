import { getDatabase } from "../../db/database.js";
import { getOne, runQuery } from "../../db/sqliteClient.js";

function mapUserRow(row, includePasswordHash = false) {
  if (!row) {
    return null;
  }

  const user = {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (includePasswordHash) {
    user.passwordHash = row.password_hash;
  }

  return user;
}

export async function findProfileUserById(userId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT id, first_name, last_name, email, role, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return mapUserRow(row);
}

export async function findProfileUserByIdWithPassword(userId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT id, first_name, last_name, email, role, password_hash, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return mapUserRow(row, true);
}

export async function findUserByEmailExceptId(email, excludedUserId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT id, first_name, last_name, email, role, created_at, updated_at
      FROM users
      WHERE email = ? AND id <> ?
      LIMIT 1
    `,
    [email, excludedUserId]
  );

  return mapUserRow(row);
}

export async function updateProfileUserBasicById(userId, { firstName, lastName, email }) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [firstName, lastName, email, userId]
  );

  if (result.changes <= 0) {
    return null;
  }

  return findProfileUserById(userId);
}

export async function updateProfileUserPasswordById(userId, passwordHash) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      UPDATE users
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [passwordHash, userId]
  );

  return result.changes > 0;
}

export async function deleteProfileUserById(userId) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      DELETE FROM users
      WHERE id = ?
    `,
    [userId]
  );

  return result.changes > 0;
}
