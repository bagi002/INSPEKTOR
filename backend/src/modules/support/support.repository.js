import { getDatabase } from "../../db/database.js";
import { getMany, getOne, runQuery } from "../../db/sqliteClient.js";

function mapSupportTicketRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    reporterUserId: row.reporter_user_id,
    ticketType: row.ticket_type,
    title: row.title,
    description: row.description,
    appLocation: row.app_location,
    appVersion: row.app_version,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reporter: {
      id: row.reporter_id,
      firstName: row.reporter_first_name,
      lastName: row.reporter_last_name,
      email: row.reporter_email,
      role: row.reporter_role,
    },
  };
}

export async function createSupportTicket({
  reporterUserId,
  ticketType,
  title,
  description,
  appLocation,
  appVersion,
}) {
  const database = getDatabase();
  const insertResult = await runQuery(
    database,
    `
      INSERT INTO support_tickets (
        reporter_user_id,
        ticket_type,
        title,
        description,
        app_location,
        app_version
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [reporterUserId, ticketType, title, description, appLocation, appVersion]
  );

  return getSupportTicketById(insertResult.lastID);
}

export async function getSupportTicketById(ticketId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        st.id,
        st.reporter_user_id,
        st.ticket_type,
        st.title,
        st.description,
        st.app_location,
        st.app_version,
        st.status,
        st.admin_note,
        st.created_at,
        st.updated_at,
        u.id AS reporter_id,
        u.first_name AS reporter_first_name,
        u.last_name AS reporter_last_name,
        u.email AS reporter_email,
        u.role AS reporter_role
      FROM support_tickets st
      INNER JOIN users u ON u.id = st.reporter_user_id
      WHERE st.id = ?
      LIMIT 1
    `,
    [ticketId]
  );

  return mapSupportTicketRow(row);
}

export async function getSupportTicketsByReporterUserId(userId) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        st.id,
        st.reporter_user_id,
        st.ticket_type,
        st.title,
        st.description,
        st.app_location,
        st.app_version,
        st.status,
        st.admin_note,
        st.created_at,
        st.updated_at,
        u.id AS reporter_id,
        u.first_name AS reporter_first_name,
        u.last_name AS reporter_last_name,
        u.email AS reporter_email,
        u.role AS reporter_role
      FROM support_tickets st
      INNER JOIN users u ON u.id = st.reporter_user_id
      WHERE st.reporter_user_id = ?
      ORDER BY st.created_at DESC, st.id DESC
    `,
    [userId]
  );

  return rows.map(mapSupportTicketRow);
}

export async function getAllSupportTickets() {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        st.id,
        st.reporter_user_id,
        st.ticket_type,
        st.title,
        st.description,
        st.app_location,
        st.app_version,
        st.status,
        st.admin_note,
        st.created_at,
        st.updated_at,
        u.id AS reporter_id,
        u.first_name AS reporter_first_name,
        u.last_name AS reporter_last_name,
        u.email AS reporter_email,
        u.role AS reporter_role
      FROM support_tickets st
      INNER JOIN users u ON u.id = st.reporter_user_id
      ORDER BY st.created_at DESC, st.id DESC
    `
  );

  return rows.map(mapSupportTicketRow);
}

export async function updateSupportTicketStatus(ticketId, status, adminNote) {
  const database = getDatabase();
  const result = await runQuery(
    database,
    `
      UPDATE support_tickets
      SET status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, adminNote, ticketId]
  );

  if (result.changes === 0) {
    return null;
  }

  return getSupportTicketById(ticketId);
}
