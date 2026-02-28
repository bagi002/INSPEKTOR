import { getDatabase } from "../../db/database.js";
import { getOne, runQuery } from "../../db/sqliteClient.js";

function mapAdminAccountRow(row, includePasswordHash = false) {
  if (!row) {
    return null;
  }

  const account = {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    isActive: Number(row.is_active) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (includePasswordHash) {
    account.passwordHash = row.password_hash;
  }

  return account;
}

export async function findAdminAccountByEmail(email, { includePasswordHash = false } = {}) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        id,
        first_name,
        last_name,
        email,
        password_hash,
        is_active,
        created_at,
        updated_at
      FROM admin_accounts
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return mapAdminAccountRow(row, includePasswordHash);
}

export async function findAdminAccountById(adminAccountId, { includePasswordHash = false } = {}) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        id,
        first_name,
        last_name,
        email,
        password_hash,
        is_active,
        created_at,
        updated_at
      FROM admin_accounts
      WHERE id = ?
      LIMIT 1
    `,
    [adminAccountId]
  );

  return mapAdminAccountRow(row, includePasswordHash);
}

export async function hasAdminAccounts() {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT COUNT(*) AS admin_count
      FROM admin_accounts
      WHERE is_active = 1
      LIMIT 1
    `
  );

  return Number(row?.admin_count || 0) > 0;
}

export async function countAdminAccounts() {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT COUNT(*) AS admin_count
      FROM admin_accounts
      WHERE is_active = 1
      LIMIT 1
    `
  );

  return Number(row?.admin_count || 0);
}

export async function createAdminAccount({ firstName, lastName, email, passwordHash }) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      INSERT INTO admin_accounts (first_name, last_name, email, password_hash, is_active)
      VALUES (?, ?, ?, ?, 1)
    `,
    [firstName, lastName, email, passwordHash]
  );

  return findAdminAccountById(result.lastID);
}

export async function upsertAdminAccountFromUserProfile({
  firstName,
  lastName,
  email,
  passwordHash,
}) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      INSERT INTO admin_accounts (first_name, last_name, email, password_hash, is_active)
      VALUES (?, ?, ?, ?, 1)
      ON CONFLICT(email) DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        password_hash = CASE
          WHEN admin_accounts.is_active = 0 THEN excluded.password_hash
          ELSE admin_accounts.password_hash
        END,
        is_active = 1,
        updated_at = CURRENT_TIMESTAMP
    `,
    [firstName, lastName, email, passwordHash]
  );

  return findAdminAccountByEmail(email);
}

export async function deactivateAdminAccountByEmail(email) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      UPDATE admin_accounts
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `,
    [email]
  );

  return result.changes > 0;
}

export async function updateAdminAccountPasswordById(adminAccountId, passwordHash) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      UPDATE admin_accounts
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `,
    [passwordHash, adminAccountId]
  );

  return result.changes > 0;
}
