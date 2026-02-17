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

export async function getCasePeopleDirectoryByCaseId(caseId) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT id, full_name, apparent_role
      FROM case_people
      WHERE case_id = ?
      ORDER BY full_name ASC, id ASC
    `,
    [caseId]
  );

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    apparentRole: row.apparent_role,
  }));
}
