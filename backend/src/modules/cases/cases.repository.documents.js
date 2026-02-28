import { getDatabase } from "../../db/database.js";
import { getMany, getOne, runQuery } from "../../db/sqliteClient.js";
import { mapCaseDocumentRow } from "./cases.repository.documents.mapping.js";

export async function createCaseDocumentForCase(caseId, payload) {
  const database = getDatabase();

  const insertResult = await runQuery(
    database,
    `
      INSERT INTO case_documents (
        case_id,
        document_type,
        title,
        content,
        sequence_order,
        is_unlocked_by_default,
        metadata_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      caseId,
      payload.documentType,
      payload.title,
      payload.content,
      payload.sequenceOrder,
      payload.isUnlockedByDefault ? 1 : 0,
      JSON.stringify(payload.metadata || {}),
    ]
  );

  const row = await getOne(
    database,
    `
      SELECT
        id,
        case_id,
        document_type,
        title,
        content,
        sequence_order,
        is_unlocked_by_default,
        metadata_json,
        created_at,
        updated_at
      FROM case_documents
      WHERE id = ?
      LIMIT 1
    `,
    [insertResult.lastID]
  );

  return row ? mapCaseDocumentRow(row) : null;
}

export async function getCaseDocumentsByCaseIdAndTypes(caseId, documentTypes) {
  if (!Array.isArray(documentTypes) || documentTypes.length === 0) {
    return [];
  }

  const database = getDatabase();
  const placeholders = documentTypes.map(() => "?").join(", ");
  const rows = await getMany(
    database,
    `
      SELECT
        id,
        case_id,
        document_type,
        title,
        content,
        sequence_order,
        is_unlocked_by_default,
        metadata_json,
        created_at,
        updated_at
      FROM case_documents
      WHERE case_id = ? AND document_type IN (${placeholders})
      ORDER BY sequence_order ASC, id ASC
    `,
    [caseId, ...documentTypes]
  );

  return rows.map(mapCaseDocumentRow);
}

export async function findCaseDocumentByIdAndCaseId(documentId, caseId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        id,
        case_id,
        document_type,
        title,
        content,
        sequence_order,
        is_unlocked_by_default,
        metadata_json,
        created_at,
        updated_at
      FROM case_documents
      WHERE id = ? AND case_id = ?
      LIMIT 1
    `,
    [documentId, caseId]
  );

  return row ? mapCaseDocumentRow(row) : null;
}

export async function updateCaseDocumentForCase(caseId, documentId, payload) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      UPDATE case_documents
      SET
        document_type = ?,
        title = ?,
        content = ?,
        sequence_order = ?,
        is_unlocked_by_default = ?,
        metadata_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND case_id = ?
    `,
    [
      payload.documentType,
      payload.title,
      payload.content,
      payload.sequenceOrder,
      payload.isUnlockedByDefault ? 1 : 0,
      JSON.stringify(payload.metadata || {}),
      documentId,
      caseId,
    ]
  );

  return await findCaseDocumentByIdAndCaseId(documentId, caseId);
}

export async function getCasePeopleDirectoryByCaseId(caseId) {
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

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    apparentRole: row.apparent_role,
    isAlive: row.is_alive === 1,
  }));
}
