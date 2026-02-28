import { getDatabase } from "../../db/database.js";
import { getMany, getOne, runQuery } from "../../db/sqliteClient.js";

function toInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : 0;
}

function mapMissingTimelineDocumentRow(row) {
  return {
    id: row.id,
    title: row.title || "Dokument",
    documentType: row.document_type || "",
  };
}

function mapMissingTimelinePersonRow(row) {
  return {
    id: row.id,
    fullName: row.full_name || "Osoba",
  };
}

export async function getCasePublishReadinessSnapshot(caseId) {
  const database = getDatabase();
  const [
    peopleCountRow,
    victimCountRow,
    suspectCountRow,
    documentsTotalRow,
    quizQuestionsCountRow,
    timelineTotalRow,
    missingTimelinePeopleRows,
    missingTimelineDocumentRows,
  ] = await Promise.all([
    getOne(
      database,
      `
        SELECT COUNT(*) AS total
        FROM case_people
        WHERE case_id = ?
      `,
      [caseId]
    ),
    getOne(
      database,
      `
        SELECT COUNT(*) AS total
        FROM case_people
        WHERE case_id = ?
          AND apparent_role = 'victim'
      `,
      [caseId]
    ),
    getOne(
      database,
      `
        SELECT COUNT(*) AS total
        FROM case_people
        WHERE case_id = ?
          AND apparent_role = 'suspect'
      `,
      [caseId]
    ),
    getOne(
      database,
      `
        SELECT COUNT(*) AS total
        FROM case_documents
        WHERE case_id = ?
      `,
      [caseId]
    ),
    getOne(
      database,
      `
        SELECT COUNT(*) AS total
        FROM case_quiz_questions
        WHERE case_id = ?
      `,
      [caseId]
    ),
    getOne(
      database,
      `
        SELECT COUNT(*) AS total
        FROM case_timeline_items
        WHERE case_id = ?
      `,
      [caseId]
    ),
    getMany(
      database,
      `
        SELECT
          p.id,
          p.full_name
        FROM case_people p
        LEFT JOIN case_timeline_items t
          ON t.case_id = p.case_id
          AND t.item_type = 'person'
          AND t.person_id = p.id
        WHERE p.case_id = ?
          AND t.id IS NULL
        ORDER BY p.id ASC
      `,
      [caseId]
    ),
    getMany(
      database,
      `
        SELECT
          d.id,
          d.title,
          d.document_type
        FROM case_documents d
        LEFT JOIN case_timeline_items t
          ON t.case_id = d.case_id
          AND t.item_type = 'document'
          AND t.document_id = d.id
        WHERE d.case_id = ?
          AND t.id IS NULL
        ORDER BY d.sequence_order ASC, d.id ASC
      `,
      [caseId]
    ),
  ]);

  return {
    peopleCount: toInteger(peopleCountRow?.total),
    victimCount: toInteger(victimCountRow?.total),
    suspectCount: toInteger(suspectCountRow?.total),
    documentsCount: toInteger(documentsTotalRow?.total),
    quizQuestionsCount: toInteger(quizQuestionsCountRow?.total),
    timelineItemsCount: toInteger(timelineTotalRow?.total),
    missingTimelinePeople: missingTimelinePeopleRows.map(mapMissingTimelinePersonRow),
    missingTimelineDocuments: missingTimelineDocumentRows.map(mapMissingTimelineDocumentRow),
  };
}

export async function updateCasePublicationStatus(caseId, publicationStatus) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      UPDATE cases
      SET
        publication_status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [publicationStatus, caseId]
  );
}
