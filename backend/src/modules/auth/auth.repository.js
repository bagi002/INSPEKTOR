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
    role: row.role,
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
      SELECT id, first_name, last_name, email, role, password_hash, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return mapUserRow(row);
}

export async function createUser({ firstName, lastName, email, passwordHash, role = "user" }) {
  const database = getDatabase();
  const insertResult = await runQuery(
    database,
    `
      INSERT INTO users (first_name, last_name, email, role, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `,
    [firstName, lastName, email, role, passwordHash]
  );

  const row = await getOne(
    database,
    `
      SELECT id, first_name, last_name, email, role, password_hash, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [insertResult.lastID]
  );

  return mapUserRow(row);
}

export async function hasAdminUsers() {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT COUNT(*) AS admin_count
      FROM users
      WHERE role = 'admin'
      LIMIT 1
    `
  );

  return Number(row?.admin_count || 0) > 0;
}

export async function updateUserRoleById(userId, role) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      UPDATE users
      SET role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [role, userId]
  );

  return result.changes > 0;
}
