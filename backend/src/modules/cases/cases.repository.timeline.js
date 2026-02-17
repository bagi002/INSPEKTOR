import { getDatabase } from "../../db/database.js";
import { getMany, runQuery } from "../../db/sqliteClient.js";

function mapTimelineItemRow(row) {
  const isDocument = row.item_type === "document";

  return {
    id: row.id,
    caseId: row.case_id,
    itemType: row.item_type,
    sourceId: isDocument ? row.document_id : row.person_id,
    sourceLabel: isDocument ? row.document_title || "Dokument" : row.person_full_name || "Osoba",
    sourceMeta: isDocument
      ? {
          documentType: row.document_type || "",
          sequenceOrder: row.document_sequence_order || null,
        }
      : {
          apparentRole: row.person_apparent_role || "unknown",
        },
    unlockOrder: row.unlock_order,
    unlockNote: row.unlock_note || "",
    unlockAt: row.unlock_at || "",
    createdAt: row.created_at,
  };
}

function mapTimelinePersonSourceRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    apparentRole: row.apparent_role,
    isAlive: row.is_alive === 1,
  };
}

function mapTimelineDocumentSourceRow(row) {
  return {
    id: row.id,
    title: row.title,
    documentType: row.document_type,
    sequenceOrder: row.sequence_order,
  };
}

export async function getCaseTimelineItemsByCaseId(caseId) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        t.id,
        t.case_id,
        t.item_type,
        t.document_id,
        t.person_id,
        t.unlock_order,
        t.unlock_note,
        t.unlock_at,
        t.created_at,
        d.title AS document_title,
        d.document_type,
        d.sequence_order AS document_sequence_order,
        p.full_name AS person_full_name,
        p.apparent_role AS person_apparent_role
      FROM case_timeline_items t
      LEFT JOIN case_documents d ON d.id = t.document_id
      LEFT JOIN case_people p ON p.id = t.person_id
      WHERE t.case_id = ?
      ORDER BY t.unlock_order ASC, t.id ASC
    `,
    [caseId]
  );

  return rows.map(mapTimelineItemRow);
}

export async function getCaseTimelinePeopleSourcesByCaseId(caseId) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        p.id,
        p.full_name,
        p.apparent_role,
        COALESCE(d.is_alive, 1) AS is_alive
      FROM case_people p
      LEFT JOIN case_person_dossiers d ON d.person_id = p.id
      WHERE p.case_id = ?
      ORDER BY p.full_name ASC, p.id ASC
    `,
    [caseId]
  );

  return rows.map(mapTimelinePersonSourceRow);
}

export async function getCaseTimelineDocumentSourcesByCaseId(caseId) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        id,
        title,
        document_type,
        sequence_order
      FROM case_documents
      WHERE case_id = ?
      ORDER BY sequence_order ASC, id ASC
    `,
    [caseId]
  );

  return rows.map(mapTimelineDocumentSourceRow);
}

export async function replaceCaseTimelineItems(caseId, items) {
  const database = getDatabase();
  await runQuery(database, "BEGIN");

  try {
    await runQuery(database, `DELETE FROM case_timeline_items WHERE case_id = ?`, [caseId]);

    for (const item of items) {
      const documentId = item.itemType === "document" ? item.sourceId : null;
      const personId = item.itemType === "person" ? item.sourceId : null;

      await runQuery(
        database,
        `
          INSERT INTO case_timeline_items (
            case_id,
            item_type,
            document_id,
            person_id,
            unlock_order,
            unlock_note,
            unlock_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          caseId,
          item.itemType,
          documentId,
          personId,
          item.unlockOrder,
          item.unlockNote,
          item.unlockAt,
        ]
      );
    }

    await runQuery(database, "COMMIT");
  } catch (error) {
    await runQuery(database, "ROLLBACK").catch(() => null);
    throw error;
  }
}
