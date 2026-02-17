import { getDatabase } from "../../db/database.js";
import { getMany, getOne } from "../../db/sqliteClient.js";
import {
  CASE_PERSON_WITH_DOSSIER_SELECT,
  mapCasePersonWithDossier,
} from "./cases.repository.people.shared.js";

export async function findCasePersonById(personId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        ${CASE_PERSON_WITH_DOSSIER_SELECT}
      FROM case_people p
      LEFT JOIN case_person_dossiers d ON d.person_id = p.id
      LEFT JOIN case_person_dossier_profiles dp ON dp.dossier_id = d.id
      WHERE p.id = ?
      LIMIT 1
    `,
    [personId]
  );

  return row ? mapCasePersonWithDossier(row) : null;
}

export async function getCasePeopleByCaseId(caseId) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        ${CASE_PERSON_WITH_DOSSIER_SELECT}
      FROM case_people p
      LEFT JOIN case_person_dossiers d ON d.person_id = p.id
      LEFT JOIN case_person_dossier_profiles dp ON dp.dossier_id = d.id
      WHERE p.case_id = ?
      ORDER BY p.id ASC
    `,
    [caseId]
  );

  return rows.map(mapCasePersonWithDossier);
}
