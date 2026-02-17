import { getDatabase } from "../../db/database.js";
import { getMany, getOne, runQuery } from "../../db/sqliteClient.js";
import { buildUpdateStatement } from "./admin.repository.shared.js";

function mapAdminCaseRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    publicationStatus: row.publication_status,
    averageRating: row.average_rating,
    ratingCount: row.rating_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
      id: row.author_user_id,
      firstName: row.author_first_name,
      lastName: row.author_last_name,
      email: row.author_email,
      role: row.author_role,
    },
  };
}

export async function getAdminCases() {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        c.id,
        c.author_user_id,
        c.title,
        c.description,
        c.publication_status,
        c.average_rating,
        c.rating_count,
        c.created_at,
        c.updated_at,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name,
        u.email AS author_email,
        u.role AS author_role
      FROM cases c
      INNER JOIN users u ON u.id = c.author_user_id
      ORDER BY c.created_at DESC, c.id DESC
    `
  );

  return rows.map(mapAdminCaseRow);
}

export async function updateAdminCase(caseId, updates) {
  const database = getDatabase();
  const updateStatement = buildUpdateStatement(
    {
      title: "title",
      description: "description",
      publicationStatus: "publication_status",
      averageRating: "average_rating",
      ratingCount: "rating_count",
    },
    updates
  );

  if (!updateStatement) {
    return null;
  }

  const result = await runQuery(
    database,
    `
      UPDATE cases
      SET ${updateStatement.sqlFragment}
      WHERE id = ?
    `,
    [...updateStatement.values, caseId]
  );
  if (result.changes === 0) {
    return null;
  }

  const row = await getOne(
    database,
    `
      SELECT
        c.id,
        c.author_user_id,
        c.title,
        c.description,
        c.publication_status,
        c.average_rating,
        c.rating_count,
        c.created_at,
        c.updated_at,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name,
        u.email AS author_email,
        u.role AS author_role
      FROM cases c
      INNER JOIN users u ON u.id = c.author_user_id
      WHERE c.id = ?
      LIMIT 1
    `,
    [caseId]
  );

  return mapAdminCaseRow(row);
}
