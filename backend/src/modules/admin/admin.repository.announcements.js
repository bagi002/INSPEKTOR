import { getDatabase } from "../../db/database.js";
import { getMany, getOne, runQuery } from "../../db/sqliteClient.js";

function mapAnnouncementRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByAdmin: row.creator_id
      ? {
          id: row.creator_id,
          firstName: row.creator_first_name,
          lastName: row.creator_last_name,
          email: row.creator_email,
        }
      : null,
  };
}

function sanitizeLimit(rawLimit, fallback = 50) {
  const parsed = Number.parseInt(rawLimit, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, 100);
}

async function getAnnouncementById(announcementId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        aa.id,
        aa.title,
        aa.content,
        aa.created_at,
        aa.updated_at,
        creator.id AS creator_id,
        creator.first_name AS creator_first_name,
        creator.last_name AS creator_last_name,
        creator.email AS creator_email
      FROM admin_announcements aa
      LEFT JOIN users creator ON creator.id = aa.created_by_admin_user_id
      WHERE aa.id = ?
      LIMIT 1
    `,
    [announcementId]
  );

  return mapAnnouncementRow(row);
}

export async function createAdminAnnouncement({
  title,
  content,
  createdByAdminUserId,
}) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      INSERT INTO admin_announcements (title, content, created_by_admin_user_id)
      VALUES (?, ?, ?)
    `,
    [title, content, createdByAdminUserId]
  );

  return getAnnouncementById(result.lastID);
}

export async function getAdminAnnouncements(limit = 50) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        aa.id,
        aa.title,
        aa.content,
        aa.created_at,
        aa.updated_at,
        creator.id AS creator_id,
        creator.first_name AS creator_first_name,
        creator.last_name AS creator_last_name,
        creator.email AS creator_email
      FROM admin_announcements aa
      LEFT JOIN users creator ON creator.id = aa.created_by_admin_user_id
      ORDER BY aa.created_at DESC, aa.id DESC
      LIMIT ?
    `,
    [sanitizeLimit(limit)]
  );

  return rows.map(mapAnnouncementRow);
}

export async function getPendingAdminAnnouncementsForUser(userId) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        aa.id,
        aa.title,
        aa.content,
        aa.created_at,
        aa.updated_at,
        creator.id AS creator_id,
        creator.first_name AS creator_first_name,
        creator.last_name AS creator_last_name,
        creator.email AS creator_email
      FROM admin_announcements aa
      INNER JOIN users target_user ON target_user.id = ?
      LEFT JOIN admin_announcement_dismissals dismissals
        ON dismissals.announcement_id = aa.id
        AND dismissals.user_id = target_user.id
      LEFT JOIN users creator ON creator.id = aa.created_by_admin_user_id
      WHERE dismissals.id IS NULL
        AND target_user.created_at <= aa.created_at
      ORDER BY aa.created_at ASC, aa.id ASC
    `,
    [userId]
  );

  return rows.map(mapAnnouncementRow);
}

export async function findPendingAdminAnnouncementForUserById(
  announcementId,
  userId
) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        aa.id,
        aa.title,
        aa.content,
        aa.created_at,
        aa.updated_at,
        creator.id AS creator_id,
        creator.first_name AS creator_first_name,
        creator.last_name AS creator_last_name,
        creator.email AS creator_email
      FROM admin_announcements aa
      INNER JOIN users target_user ON target_user.id = ?
      LEFT JOIN admin_announcement_dismissals dismissals
        ON dismissals.announcement_id = aa.id
        AND dismissals.user_id = target_user.id
      LEFT JOIN users creator ON creator.id = aa.created_by_admin_user_id
      WHERE aa.id = ?
        AND dismissals.id IS NULL
        AND target_user.created_at <= aa.created_at
      LIMIT 1
    `,
    [userId, announcementId]
  );

  return mapAnnouncementRow(row);
}

export async function dismissAdminAnnouncementForUser(announcementId, userId) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      INSERT INTO admin_announcement_dismissals (announcement_id, user_id)
      VALUES (?, ?)
      ON CONFLICT(announcement_id, user_id)
      DO UPDATE SET dismissed_at = CURRENT_TIMESTAMP
    `,
    [announcementId, userId]
  );
}
