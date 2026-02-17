import { getDatabase } from "../../db/database.js";
import { getOne, runQuery } from "../../db/sqliteClient.js";

function mapCaseUserProgressRow(row) {
  if (!row) {
    return null;
  }

  return {
    caseId: row.case_id,
    userId: row.user_id,
    progressStatus: row.progress_status,
    progressPercent: row.progress_percent,
    unlockedTimelineCount: row.unlocked_timeline_count,
    lastUnlockedTimelineAt: row.last_unlocked_timeline_at || "",
    userRating: row.user_rating,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCaseUserProgressByCaseIdAndUserId(caseId, userId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        case_id,
        user_id,
        progress_status,
        progress_percent,
        user_rating,
        unlocked_timeline_count,
        last_unlocked_timeline_at,
        created_at,
        updated_at
      FROM case_user_progress
      WHERE case_id = ? AND user_id = ?
      LIMIT 1
    `,
    [caseId, userId]
  );

  return mapCaseUserProgressRow(row);
}

export async function ensureCaseUserProgressByCaseIdAndUserId(caseId, userId) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      INSERT INTO case_user_progress (
        case_id,
        user_id,
        progress_status,
        progress_percent,
        user_rating,
        unlocked_timeline_count,
        last_unlocked_timeline_at
      )
      VALUES (?, ?, 'in_progress', 0, NULL, 0, '')
      ON CONFLICT(case_id, user_id) DO NOTHING
    `,
    [caseId, userId]
  );

  return await getCaseUserProgressByCaseIdAndUserId(caseId, userId);
}

export async function upsertCaseUserProgress(caseId, userId, payload) {
  const rawUnlockedCount = Number.parseInt(
    payload?.unlockedTimelineCount ?? payload?.unlockedCount,
    10
  );
  const unlockedTimelineCount = Number.isInteger(rawUnlockedCount)
    ? Math.max(0, rawUnlockedCount)
    : 0;

  const database = getDatabase();
  await runQuery(
    database,
    `
      INSERT INTO case_user_progress (
        case_id,
        user_id,
        progress_status,
        progress_percent,
        user_rating,
        unlocked_timeline_count,
        last_unlocked_timeline_at
      )
      VALUES (?, ?, ?, ?, NULL, ?, ?)
      ON CONFLICT(case_id, user_id) DO UPDATE SET
        progress_status = excluded.progress_status,
        progress_percent = excluded.progress_percent,
        unlocked_timeline_count = excluded.unlocked_timeline_count,
        last_unlocked_timeline_at = excluded.last_unlocked_timeline_at,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      caseId,
      userId,
      payload.progressStatus,
      payload.progressPercent,
      unlockedTimelineCount,
      payload.lastUnlockedTimelineAt,
    ]
  );

  return await getCaseUserProgressByCaseIdAndUserId(caseId, userId);
}

export async function normalizeCaseUserProgressForTimeline(caseId, totalTimelineItems) {
  const database = getDatabase();
  if (!Number.isInteger(totalTimelineItems) || totalTimelineItems <= 0) {
    await runQuery(
      database,
      `
        UPDATE case_user_progress
        SET
          progress_status = 'in_progress',
          progress_percent = 0,
          unlocked_timeline_count = 0,
          last_unlocked_timeline_at = '',
          updated_at = CURRENT_TIMESTAMP
        WHERE case_id = ?
      `,
      [caseId]
    );
    return;
  }

  await runQuery(
    database,
    `
      UPDATE case_user_progress
      SET
        progress_status = 'in_progress',
        unlocked_timeline_count = CASE
          WHEN unlocked_timeline_count < 0 THEN 0
          WHEN unlocked_timeline_count > ? THEN ?
          ELSE unlocked_timeline_count
        END,
        progress_percent = CAST(
          ROUND(
            (
              CASE
                WHEN unlocked_timeline_count < 0 THEN 0
                WHEN unlocked_timeline_count > ? THEN ?
                ELSE unlocked_timeline_count
              END
            ) * 100.0 / ?
          ) AS INTEGER
        ),
        last_unlocked_timeline_at = CASE
          WHEN unlocked_timeline_count <= 0 THEN ''
          ELSE last_unlocked_timeline_at
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE case_id = ?
    `,
    [
      totalTimelineItems,
      totalTimelineItems,
      totalTimelineItems,
      totalTimelineItems,
      totalTimelineItems,
      caseId,
    ]
  );
}
