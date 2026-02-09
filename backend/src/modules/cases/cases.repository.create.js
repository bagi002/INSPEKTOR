import { getDatabase } from "../../db/database.js";
import { getOne, runQuery } from "../../db/sqliteClient.js";
import { mapCaseRow } from "./cases.repository.mappers.js";

export async function findCaseById(caseId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        c.id,
        c.author_user_id,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name,
        c.title,
        c.description,
        c.publication_status,
        c.average_rating,
        c.rating_count,
        c.created_at,
        c.updated_at
      FROM cases c
      INNER JOIN users u ON u.id = c.author_user_id
      WHERE c.id = ?
      LIMIT 1
    `,
    [caseId]
  );

  return mapCaseRow(row);
}

export async function findCaseByIdForAuthor(caseId, authorUserId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        c.id,
        c.author_user_id,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name,
        c.title,
        c.description,
        c.publication_status,
        c.average_rating,
        c.rating_count,
        c.created_at,
        c.updated_at
      FROM cases c
      INNER JOIN users u ON u.id = c.author_user_id
      WHERE c.id = ? AND c.author_user_id = ?
      LIMIT 1
    `,
    [caseId, authorUserId]
  );

  return mapCaseRow(row);
}

export async function createCaseWithDetails({
  authorUserId,
  title,
  description,
  publicationStatus,
  people,
  documents,
  timeline,
  progress,
}) {
  const database = getDatabase();
  const insertedPersonIds = [];
  const insertedDocumentIds = [];

  await runQuery(database, "BEGIN");

  try {
    const insertCaseResult = await runQuery(
      database,
      `
        INSERT INTO cases (author_user_id, title, description, publication_status)
        VALUES (?, ?, ?, ?)
      `,
      [authorUserId, title, description, publicationStatus]
    );
    const caseId = insertCaseResult.lastID;

    for (const person of people) {
      const insertPersonResult = await runQuery(
        database,
        `
          INSERT INTO case_people (case_id, full_name, apparent_role, biography)
          VALUES (?, ?, ?, ?)
        `,
        [caseId, person.fullName, person.apparentRole, person.biography]
      );
      insertedPersonIds.push(insertPersonResult.lastID);
    }

    for (const document of documents) {
      const insertDocumentResult = await runQuery(
        database,
        `
          INSERT INTO case_documents (
            case_id,
            document_type,
            title,
            content,
            sequence_order,
            is_unlocked_by_default
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          caseId,
          document.documentType,
          document.title,
          document.content,
          document.sequenceOrder,
          document.isUnlockedByDefault ? 1 : 0,
        ]
      );
      insertedDocumentIds.push(insertDocumentResult.lastID);
    }

    for (const item of timeline) {
      const documentId =
        item.itemType === "document" ? insertedDocumentIds[item.sourceIndex] || null : null;
      const personId =
        item.itemType === "person" ? insertedPersonIds[item.sourceIndex] || null : null;

      await runQuery(
        database,
        `
          INSERT INTO case_timeline_items (
            case_id,
            item_type,
            document_id,
            person_id,
            unlock_order,
            unlock_note
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [caseId, item.itemType, documentId, personId, item.unlockOrder, item.unlockNote]
      );
    }

    for (const progressItem of progress) {
      await runQuery(
        database,
        `
          INSERT INTO case_user_progress (
            case_id,
            user_id,
            progress_status,
            progress_percent,
            user_rating
          )
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(case_id, user_id) DO UPDATE SET
            progress_status = excluded.progress_status,
            progress_percent = excluded.progress_percent,
            user_rating = excluded.user_rating,
            updated_at = CURRENT_TIMESTAMP
        `,
        [
          caseId,
          progressItem.userId,
          progressItem.progressStatus,
          progressItem.progressPercent,
          progressItem.userRating,
        ]
      );
    }

    await runQuery(database, "COMMIT");
    return await findCaseById(caseId);
  } catch (error) {
    await runQuery(database, "ROLLBACK").catch(() => null);
    throw error;
  }
}
