import { getDatabase } from "../../db/database.js";
import { getOne, runQuery } from "../../db/sqliteClient.js";

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findUserByEmail(email) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT id, first_name, last_name, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return mapUserRow(row);
}

export async function createUser({ firstName, lastName, email, passwordHash }) {
  const database = getDatabase();
  const insertResult = await runQuery(
    database,
    `
      INSERT INTO users (first_name, last_name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `,
    [firstName, lastName, email, passwordHash]
  );

  const row = await getOne(
    database,
    `
      SELECT id, first_name, last_name, email, password_hash, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [insertResult.lastID]
  );

  return mapUserRow(row);
}
