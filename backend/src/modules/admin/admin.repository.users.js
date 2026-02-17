import { getDatabase } from "../../db/database.js";
import { getMany, getOne, runQuery } from "../../db/sqliteClient.js";
import { buildUpdateStatement } from "./admin.repository.shared.js";

function mapAdminUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminOverviewCounts() {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        (SELECT COUNT(*) FROM users) AS users_count,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS admins_count,
        (SELECT COUNT(*) FROM cases) AS cases_count,
        (SELECT COUNT(*) FROM support_tickets) AS tickets_count,
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'open') AS open_tickets_count,
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'in_progress') AS in_progress_tickets_count
    `
  );

  return {
    usersCount: row?.users_count || 0,
    adminsCount: row?.admins_count || 0,
    casesCount: row?.cases_count || 0,
    ticketsCount: row?.tickets_count || 0,
    openTicketsCount: row?.open_tickets_count || 0,
    inProgressTicketsCount: row?.in_progress_tickets_count || 0,
  };
}

export async function getAdminUsers() {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        id,
        first_name,
        last_name,
        email,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC, id DESC
    `
  );

  return rows.map(mapAdminUserRow);
}

export async function updateAdminUser(userId, updates) {
  const database = getDatabase();
  const updateStatement = buildUpdateStatement(
    {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      role: "role",
    },
    updates
  );

  if (!updateStatement) {
    return null;
  }

  const result = await runQuery(
    database,
    `
      UPDATE users
      SET ${updateStatement.sqlFragment}
      WHERE id = ?
    `,
    [...updateStatement.values, userId]
  );
  if (result.changes === 0) {
    return null;
  }

  const row = await getOne(
    database,
    `
      SELECT
        id,
        first_name,
        last_name,
        email,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return mapAdminUserRow(row);
}
