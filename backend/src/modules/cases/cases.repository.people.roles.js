import { getDatabase } from "../../db/database.js";
import { getMany, runQuery } from "../../db/sqliteClient.js";
import {
  CASE_PERSON_UNKNOWN_ROLE,
  normalizeCasePersonRole,
} from "./cases.solve.roles.shared.js";

function normalizeRoleForStorage(value) {
  return normalizeCasePersonRole(value) || CASE_PERSON_UNKNOWN_ROLE;
}

export async function getCasePersonRoleSelectionsByPersonIds(caseId, userId, personIds) {
  if (!Array.isArray(personIds) || personIds.length === 0) {
    return new Map();
  }

  const database = getDatabase();
  const placeholders = personIds.map(() => "?").join(", ");
  const rows = await getMany(
    database,
    `
      SELECT person_id, assigned_role
      FROM case_person_role_assignments
      WHERE case_id = ? AND user_id = ? AND person_id IN (${placeholders})
    `,
    [caseId, userId, ...personIds]
  );

  const selectedRolesByPersonId = new Map();
  rows.forEach((row) => {
    const personId = Number.parseInt(row?.person_id, 10);
    if (!Number.isInteger(personId) || personId <= 0) {
      return;
    }

    selectedRolesByPersonId.set(personId, normalizeRoleForStorage(row?.assigned_role));
  });

  return selectedRolesByPersonId;
}

export async function upsertCasePersonRoleSelection(caseId, personId, userId, assignedRole) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      INSERT INTO case_person_role_assignments (case_id, person_id, user_id, assigned_role)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(case_id, person_id, user_id) DO UPDATE SET
        assigned_role = excluded.assigned_role,
        updated_at = CURRENT_TIMESTAMP
    `,
    [caseId, personId, userId, normalizeRoleForStorage(assignedRole)]
  );
}
