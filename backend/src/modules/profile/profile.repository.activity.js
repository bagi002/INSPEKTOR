import { getDatabase } from "../../db/database.js";
import { getMany, getOne } from "../../db/sqliteClient.js";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getProfileUserActivity(userId) {
  const database = getDatabase();
  const [
    createdStats,
    solveStats,
    ratingStats,
    createdCases,
    resolvedCases,
    ratingHistory,
  ] = await Promise.all([
    getOne(
      database,
      `
        SELECT
          COUNT(*) AS total_created_count,
          SUM(CASE WHEN publication_status = 'published' THEN 1 ELSE 0 END)
            AS published_created_count,
          SUM(CASE WHEN publication_status = 'draft' THEN 1 ELSE 0 END)
            AS draft_created_count
        FROM cases
        WHERE author_user_id = ?
      `,
      [userId]
    ),
    getOne(
      database,
      `
        SELECT
          SUM(CASE WHEN progress_status = 'in_progress' THEN 1 ELSE 0 END) AS active_solve_count,
          SUM(CASE WHEN progress_status = 'resolved' THEN 1 ELSE 0 END) AS resolved_solve_count
        FROM case_user_progress
        WHERE user_id = ?
      `,
      [userId]
    ),
    getOne(
      database,
      `
        SELECT
          COUNT(*) AS ratings_given_count,
          ROUND(AVG(user_rating), 1) AS average_rating_given
        FROM case_user_progress
        WHERE user_id = ? AND user_rating IS NOT NULL
      `,
      [userId]
    ),
    getMany(
      database,
      `
        SELECT
          c.id,
          c.title,
          c.publication_status,
          ROUND(c.average_rating, 1) AS average_rating,
          c.rating_count,
          c.created_at
        FROM cases c
        WHERE c.author_user_id = ?
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT 6
      `,
      [userId]
    ),
    getMany(
      database,
      `
        SELECT
          c.id,
          c.title,
          ROUND(COALESCE(p.user_rating, c.average_rating), 1) AS rating,
          COALESCE(p.resolved_at, p.updated_at) AS resolved_at
        FROM case_user_progress p
        INNER JOIN cases c ON c.id = p.case_id
        WHERE p.user_id = ? AND p.progress_status = 'resolved'
        ORDER BY COALESCE(p.resolved_at, p.updated_at) DESC, c.id DESC
        LIMIT 6
      `,
      [userId]
    ),
    getMany(
      database,
      `
        SELECT
          c.id,
          c.title,
          ROUND(p.user_rating, 1) AS rating,
          p.user_review_comment,
          COALESCE(p.user_rated_at, p.updated_at) AS rated_at,
          u.first_name AS author_first_name,
          u.last_name AS author_last_name
        FROM case_user_progress p
        INNER JOIN cases c ON c.id = p.case_id
        INNER JOIN users u ON u.id = c.author_user_id
        WHERE p.user_id = ? AND p.user_rating IS NOT NULL
        ORDER BY COALESCE(p.user_rated_at, p.updated_at) DESC, c.id DESC
        LIMIT 6
      `,
      [userId]
    ),
  ]);

  return {
    summary: {
      createdCount: toNumber(createdStats?.total_created_count, 0),
      publishedCreatedCount: toNumber(createdStats?.published_created_count, 0),
      draftCreatedCount: toNumber(createdStats?.draft_created_count, 0),
      activeSolveCount: toNumber(solveStats?.active_solve_count, 0),
      resolvedSolveCount: toNumber(solveStats?.resolved_solve_count, 0),
      ratingsGivenCount: toNumber(ratingStats?.ratings_given_count, 0),
      averageRatingGiven:
        ratingStats?.average_rating_given === null
          ? null
          : toNumber(ratingStats?.average_rating_given, 0),
    },
    createdCases: createdCases.map((row) => ({
      id: row.id,
      title: row.title,
      publicationStatus: row.publication_status,
      averageRating: row.average_rating === null ? null : toNumber(row.average_rating, 0),
      reviews: toNumber(row.rating_count, 0),
      createdAt: row.created_at,
    })),
    resolvedCases: resolvedCases.map((row) => ({
      id: row.id,
      title: row.title,
      rating: row.rating === null ? null : toNumber(row.rating, 0),
      resolvedAt: row.resolved_at,
    })),
    ratingHistory: ratingHistory.map((row) => ({
      caseId: row.id,
      caseTitle: row.title,
      rating: row.rating === null ? null : toNumber(row.rating, 0),
      reviewComment: row.user_review_comment || "",
      ratedAt: row.rated_at,
      authorName: `${row.author_first_name || ""} ${row.author_last_name || ""}`.trim(),
    })),
  };
}
