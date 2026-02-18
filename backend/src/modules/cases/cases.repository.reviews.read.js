import { getDatabase } from "../../db/database.js";
import { getMany, getOne } from "../../db/sqliteClient.js";

const DEFAULT_REVIEWS_LIMIT = 120;

function toInteger(value) {
  return Number.isInteger(value) ? value : 0;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCaseReviewSummary(row) {
  return {
    averageRating: toNumber(row?.average_rating),
    ratingCount: toInteger(row?.rating_count),
    commentCount: toInteger(row?.comment_count),
    activeSolverCount: toInteger(row?.active_solver_count),
    resolvedSolverCount: toInteger(row?.resolved_solver_count),
  };
}

function buildDisplayName(firstName, lastName) {
  return `${firstName || ""} ${lastName || ""}`.trim();
}

function mapCaseReviewRow(row) {
  return {
    userId: row.user_id,
    userDisplayName: buildDisplayName(row.first_name, row.last_name),
    rating: toNumber(row.user_rating),
    comment: typeof row.user_review_comment === "string" ? row.user_review_comment : "",
    ratedAt: row.user_rated_at || null,
    resolvedAt: row.resolved_at || null,
  };
}

function mapResolvedCaseUserRow(row) {
  const comment = typeof row.user_review_comment === "string" ? row.user_review_comment : "";
  return {
    userId: row.user_id,
    userDisplayName: buildDisplayName(row.first_name, row.last_name),
    resolvedAt: row.resolved_at || null,
    hasReview: row.user_rating !== null && row.user_rating !== undefined,
    rating:
      row.user_rating === null || row.user_rating === undefined ? null : toNumber(row.user_rating),
    comment,
    ratedAt: row.user_rated_at || null,
  };
}

export async function getCaseReviewSummary(caseId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        ROUND(
          COALESCE(
            AVG(
              CASE
                WHEN p.user_rating IS NOT NULL AND p.user_id <> c.author_user_id THEN p.user_rating
                ELSE NULL
              END
            ),
            0
          ),
          1
        ) AS average_rating,
        SUM(
          CASE
            WHEN p.user_rating IS NOT NULL AND p.user_id <> c.author_user_id THEN 1
            ELSE 0
          END
        ) AS rating_count,
        SUM(
          CASE
            WHEN p.user_id <> c.author_user_id AND TRIM(COALESCE(p.user_review_comment, '')) <> '' THEN 1
            ELSE 0
          END
        ) AS comment_count,
        SUM(
          CASE
            WHEN p.progress_status = 'in_progress' AND p.user_id <> c.author_user_id THEN 1
            ELSE 0
          END
        ) AS active_solver_count,
        SUM(
          CASE
            WHEN p.progress_status = 'resolved' AND p.user_id <> c.author_user_id THEN 1
            ELSE 0
          END
        ) AS resolved_solver_count
      FROM cases c
      LEFT JOIN case_user_progress p ON p.case_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `,
    [caseId]
  );

  return mapCaseReviewSummary(row);
}

export async function getCaseCommunityStats(caseId) {
  return await getCaseReviewSummary(caseId);
}

export async function getCaseReviewsByCaseId(caseId, limit = DEFAULT_REVIEWS_LIMIT) {
  const database = getDatabase();
  const normalizedLimit = Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_REVIEWS_LIMIT;
  const rows = await getMany(
    database,
    `
      SELECT
        p.user_id,
        p.user_rating,
        p.user_review_comment,
        p.user_rated_at,
        p.resolved_at,
        u.first_name,
        u.last_name
      FROM case_user_progress p
      INNER JOIN users u ON u.id = p.user_id
      INNER JOIN cases c ON c.id = p.case_id
      WHERE
        p.case_id = ?
        AND p.user_rating IS NOT NULL
        AND p.user_id <> c.author_user_id
      ORDER BY COALESCE(p.user_rated_at, p.updated_at) DESC, p.user_id DESC
      LIMIT ?
    `,
    [caseId, normalizedLimit]
  );

  return rows.map(mapCaseReviewRow);
}

export async function getResolvedCaseUsersByCaseId(caseId, limit = DEFAULT_REVIEWS_LIMIT) {
  const database = getDatabase();
  const normalizedLimit = Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_REVIEWS_LIMIT;
  const rows = await getMany(
    database,
    `
      SELECT
        p.user_id,
        p.user_rating,
        p.user_review_comment,
        p.user_rated_at,
        p.resolved_at,
        u.first_name,
        u.last_name
      FROM case_user_progress p
      INNER JOIN users u ON u.id = p.user_id
      INNER JOIN cases c ON c.id = p.case_id
      WHERE
        p.case_id = ?
        AND p.progress_status = 'resolved'
        AND p.user_id <> c.author_user_id
      ORDER BY COALESCE(p.resolved_at, p.updated_at) DESC, p.user_id DESC
      LIMIT ?
    `,
    [caseId, normalizedLimit]
  );

  return rows.map(mapResolvedCaseUserRow);
}

export async function getCaseUserReviewByCaseIdAndUserId(caseId, userId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        p.user_id,
        p.user_rating,
        p.user_review_comment,
        p.user_rated_at,
        p.resolved_at,
        u.first_name,
        u.last_name
      FROM case_user_progress p
      INNER JOIN users u ON u.id = p.user_id
      WHERE p.case_id = ? AND p.user_id = ?
      LIMIT 1
    `,
    [caseId, userId]
  );

  if (!row || row.user_rating === null || row.user_rating === undefined) {
    return null;
  }

  return mapCaseReviewRow(row);
}

