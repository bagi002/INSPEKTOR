import { getDatabase } from "../../db/database.js";
import { getMany, getOne } from "../../db/sqliteClient.js";
import {
  mapCreatedCase,
  mapHomeActiveCase,
  mapHomeResolvedCase,
  mapTopRatedCase,
} from "./cases.repository.mappers.js";

export async function getHomeOverviewRows(userId) {
  const database = getDatabase();
  const [activeCases, resolvedCases, topRatedCases, createdCases, progressStats, createdStats] =
    await Promise.all([
      getMany(
        database,
        `
          SELECT c.id, c.title, c.description, p.progress_percent
          FROM case_user_progress p
          INNER JOIN cases c ON c.id = p.case_id
          WHERE p.user_id = ? AND p.progress_status = 'in_progress'
          ORDER BY p.updated_at DESC, c.id DESC
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
            c.rating_count AS reviews
          FROM case_user_progress p
          INNER JOIN cases c ON c.id = p.case_id
          WHERE p.user_id = ? AND p.progress_status = 'resolved'
          ORDER BY p.updated_at DESC, c.id DESC
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
            ROUND(c.average_rating, 1) AS rating,
            c.rating_count AS reviews,
            u.first_name AS author_first_name,
            u.last_name AS author_last_name
          FROM cases c
          INNER JOIN users u ON u.id = c.author_user_id
          WHERE c.publication_status = 'published'
          ORDER BY c.average_rating DESC, c.rating_count DESC, c.id DESC
          LIMIT 6
        `
      ),
      getMany(
        database,
        `
          SELECT
            c.id,
            c.title,
            c.publication_status,
            ROUND(c.average_rating, 1) AS rating,
            c.rating_count AS reviews
          FROM cases c
          WHERE c.author_user_id = ?
          ORDER BY c.created_at DESC, c.id DESC
          LIMIT 6
        `,
        [userId]
      ),
      getOne(
        database,
        `
          SELECT
            SUM(CASE WHEN progress_status = 'in_progress' THEN 1 ELSE 0 END) AS active_count,
            SUM(CASE WHEN progress_status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count,
            ROUND(AVG(CASE WHEN progress_status = 'resolved' THEN user_rating END), 1)
              AS average_resolved_rating
          FROM case_user_progress
          WHERE user_id = ?
        `,
        [userId]
      ),
      getOne(
        database,
        `
          SELECT COUNT(*) AS created_count
          FROM cases
          WHERE author_user_id = ?
        `,
        [userId]
      ),
    ]);

  return {
    activeCases: activeCases.map(mapHomeActiveCase),
    resolvedCases: resolvedCases.map(mapHomeResolvedCase),
    topRatedCases: topRatedCases.map(mapTopRatedCase),
    createdCases: createdCases.map(mapCreatedCase),
    stats: {
      activeCount: progressStats?.active_count || 0,
      resolvedCount: progressStats?.resolved_count || 0,
      createdCount: createdStats?.created_count || 0,
      averageResolvedRating: progressStats?.average_resolved_rating ?? null,
    },
  };
}
