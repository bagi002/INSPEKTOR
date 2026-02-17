import { getDatabase } from "../../db/database.js";
import { getMany, getOne, runQuery } from "../../db/sqliteClient.js";
import {
  mapCaseInterrogationNodeRow,
  mapCaseInterrogationRow,
} from "./cases.repository.interrogations.mapping.js";
async function findInterrogationNodesByInterrogationIds(interrogationIds) {
  if (!Array.isArray(interrogationIds) || interrogationIds.length === 0) {
    return new Map();
  }
  const database = getDatabase();
  const placeholders = interrogationIds.map(() => "?").join(", ");
  const rows = await getMany(
    database,
    `
      SELECT
        id,
        interrogation_id,
        node_key,
        parent_node_key,
        question_reference_key,
        question_text,
        answer_text,
        sequence_order
      FROM case_interrogation_nodes
      WHERE interrogation_id IN (${placeholders})
      ORDER BY interrogation_id ASC, sequence_order ASC, id ASC
    `,
    interrogationIds
  );

  const nodesByInterrogationId = new Map();
  rows.forEach((row) => {
    const interrogationId = row.interrogation_id;
    if (!nodesByInterrogationId.has(interrogationId)) {
      nodesByInterrogationId.set(interrogationId, []);
    }
    nodesByInterrogationId.get(interrogationId).push(mapCaseInterrogationNodeRow(row));
  });

  return nodesByInterrogationId;
}

export async function getCaseInterrogationsByCaseId(caseId) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        id,
        case_id,
        person_id,
        title,
        opening_prompt,
        created_by_user_id,
        created_at,
        updated_at
      FROM case_interrogations
      WHERE case_id = ?
      ORDER BY updated_at DESC, id DESC
    `,
    [caseId]
  );

  if (rows.length === 0) {
    return [];
  }
  const interrogations = rows.map(mapCaseInterrogationRow);
  const nodesByInterrogationId = await findInterrogationNodesByInterrogationIds(
    interrogations.map((interrogation) => interrogation.id)
  );

  return interrogations.map((interrogation) => ({
    ...interrogation,
    nodes: nodesByInterrogationId.get(interrogation.id) || [],
  }));
}

export async function getCaseInterrogationById(interrogationId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        id,
        case_id,
        person_id,
        title,
        opening_prompt,
        created_by_user_id,
        created_at,
        updated_at
      FROM case_interrogations
      WHERE id = ?
      LIMIT 1
    `,
    [interrogationId]
  );

  if (!row) {
    return null;
  }
  const interrogation = mapCaseInterrogationRow(row);
  const nodesByInterrogationId = await findInterrogationNodesByInterrogationIds([interrogation.id]);
  return {
    ...interrogation,
    nodes: nodesByInterrogationId.get(interrogation.id) || [],
  };
}

export async function upsertCaseInterrogationForPerson(caseId, payload, createdByUserId) {
  const database = getDatabase();
  await runQuery(database, "BEGIN");
  try {
    const existingRow = await getOne(
      database,
      `
        SELECT id
        FROM case_interrogations
        WHERE case_id = ? AND person_id = ?
        LIMIT 1
      `,
      [caseId, payload.personId]
    );

    let interrogationId = existingRow?.id || null;
    if (interrogationId) {
      await runQuery(
        database,
        `
          UPDATE case_interrogations
          SET
            title = ?,
            opening_prompt = ?,
            created_by_user_id = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [payload.title, payload.openingPrompt, createdByUserId, interrogationId]
      );
      await runQuery(
        database,
        `
          DELETE FROM case_interrogation_nodes
          WHERE interrogation_id = ?
        `,
        [interrogationId]
      );
    } else {
      const insertResult = await runQuery(
        database,
        `
          INSERT INTO case_interrogations (
            case_id,
            person_id,
            title,
            opening_prompt,
            created_by_user_id
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [caseId, payload.personId, payload.title, payload.openingPrompt, createdByUserId]
      );
      interrogationId = insertResult.lastID;
    }

    for (const node of payload.nodes) {
      await runQuery(
        database,
        `
          INSERT INTO case_interrogation_nodes (
            interrogation_id,
            node_key,
            parent_node_key,
            question_reference_key,
            question_text,
            answer_text,
            sequence_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          interrogationId,
          node.nodeKey,
          node.parentKey || null,
          node.questionReferenceKey || node.nodeKey,
          node.question,
          node.answer,
          node.sequenceOrder,
        ]
      );
    }

    await runQuery(database, "COMMIT");
    return getCaseInterrogationById(interrogationId);
  } catch (error) {
    await runQuery(database, "ROLLBACK").catch(() => null);
    throw error;
  }
}
