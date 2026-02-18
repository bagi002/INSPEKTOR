import { getDatabase } from "../../db/database.js";
import { getOne, runQuery } from "../../db/sqliteClient.js";

function toInteger(value) {
  return Number.isInteger(value) ? value : 0;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function saveCaseUserReview(caseId, userId, payload) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      UPDATE case_user_progress
      SET
        user_rating = ?,
        user_review_comment = ?,
        user_rated_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE case_id = ? AND user_id = ?
    `,
    [payload.rating, payload.comment, payload.ratedAt, caseId, userId]
  );
}

export async function recalculateCaseRatings(caseId) {
  const database = getDatabase();
  const aggregate = await getOne(
    database,
    `
      SELECT
        COALESCE(AVG(p.user_rating), 0) AS average_rating,
        COUNT(*) AS rating_count
      FROM case_user_progress p
      INNER JOIN cases c ON c.id = p.case_id
      WHERE
        p.case_id = ?
        AND p.user_rating IS NOT NULL
        AND p.user_id <> c.author_user_id
    `,
    [caseId]
  );

  const averageRating = toNumber(aggregate?.average_rating);
  const ratingCount = toInteger(aggregate?.rating_count);

  await runQuery(
    database,
    `
      UPDATE cases
      SET
        average_rating = ?,
        rating_count = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [averageRating, ratingCount, caseId]
  );

  return {
    averageRating,
    ratingCount,
  };
}

