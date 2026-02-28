import { getDatabase } from "../../db/database.js";
import { runQuery } from "../../db/sqliteClient.js";
import { findCasePersonById } from "./cases.repository.people.read.js";

export async function createCasePersonForCase(caseId, payload, authorUserId) {
  const database = getDatabase();
  await runQuery(database, "BEGIN");

  try {
    const personInsertResult = await runQuery(
      database,
      `
        INSERT INTO case_people (case_id, full_name, apparent_role, biography)
        VALUES (?, ?, ?, ?)
      `,
      [caseId, payload.fullName, payload.apparentRole, payload.biography]
    );
    const personId = personInsertResult.lastID;

    const dossierInsertResult = await runQuery(
      database,
      `
        INSERT INTO case_person_dossiers (
          person_id,
          phone_number,
          address,
          height_cm,
          is_alive,
          prior_offenses
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        personId,
        payload.phoneNumber,
        payload.address,
        payload.heightCm,
        payload.isAlive ? 1 : 0,
        payload.priorOffenses,
      ]
    );
    const dossierId = dossierInsertResult.lastID;
    const dossierNumber = `DOS-${String(caseId).padStart(4, "0")}-${String(personId).padStart(5, "0")}`;

    await runQuery(
      database,
      `
        INSERT INTO case_person_dossier_profiles (
          dossier_id,
          dossier_number,
          dossier_status,
          classification_level,
          revision_number,
          generated_by_user_id,
          generated_at,
          last_reviewed_at,
          birth_date,
          birth_place,
          nationality,
          gender,
          marital_status,
          occupation,
          employer,
          education_level,
          eye_color,
          hair_color,
          weight_kg,
          identifying_marks,
          known_associates,
          risk_level,
          last_known_location,
          photo_data_url,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        dossierId,
        dossierNumber,
        "active",
        "interno",
        1,
        authorUserId,
        payload.birthDate,
        payload.birthPlace,
        payload.nationality,
        payload.gender,
        payload.maritalStatus,
        payload.occupation,
        payload.employer,
        payload.educationLevel,
        payload.eyeColor,
        payload.hairColor,
        payload.weightKg,
        payload.identifyingMarks,
        payload.knownAssociates,
        payload.riskLevel,
        payload.lastKnownLocation,
        payload.photoDataUrl,
        payload.notes,
      ]
    );

    await runQuery(database, "COMMIT");
    return await findCasePersonById(personId);
  } catch (error) {
    await runQuery(database, "ROLLBACK").catch(() => null);
    throw error;
  }
}

export async function updateCasePersonForCase(caseId, personId, payload, authorUserId) {
  const database = getDatabase();
  await runQuery(database, "BEGIN");

  try {
    await runQuery(
      database,
      `
        UPDATE case_people
        SET
          full_name = ?,
          apparent_role = ?,
          biography = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND case_id = ?
      `,
      [payload.fullName, payload.apparentRole, payload.biography, personId, caseId]
    );

    await runQuery(
      database,
      `
        UPDATE case_person_dossiers
        SET
          phone_number = ?,
          address = ?,
          height_cm = ?,
          is_alive = ?,
          prior_offenses = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE person_id = ?
      `,
      [
        payload.phoneNumber,
        payload.address,
        payload.heightCm,
        payload.isAlive ? 1 : 0,
        payload.priorOffenses,
        personId,
      ]
    );

    await runQuery(
      database,
      `
        UPDATE case_person_dossier_profiles
        SET
          revision_number = revision_number + 1,
          last_reviewed_at = CURRENT_TIMESTAMP,
          birth_date = ?,
          birth_place = ?,
          nationality = ?,
          gender = ?,
          marital_status = ?,
          occupation = ?,
          employer = ?,
          education_level = ?,
          eye_color = ?,
          hair_color = ?,
          weight_kg = ?,
          identifying_marks = ?,
          known_associates = ?,
          risk_level = ?,
          last_known_location = ?,
          photo_data_url = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE dossier_id = (
          SELECT id
          FROM case_person_dossiers
          WHERE person_id = ?
          LIMIT 1
        )
      `,
      [
        payload.birthDate,
        payload.birthPlace,
        payload.nationality,
        payload.gender,
        payload.maritalStatus,
        payload.occupation,
        payload.employer,
        payload.educationLevel,
        payload.eyeColor,
        payload.hairColor,
        payload.weightKg,
        payload.identifyingMarks,
        payload.knownAssociates,
        payload.riskLevel,
        payload.lastKnownLocation,
        payload.photoDataUrl,
        payload.notes,
        personId,
      ]
    );

    await runQuery(database, "COMMIT");
    return await findCasePersonById(personId);
  } catch (error) {
    await runQuery(database, "ROLLBACK").catch(() => null);
    throw error;
  }
}
