import { getDatabase } from "../../db/database.js";
import { getOne, runQuery } from "../../db/sqliteClient.js";

const ACTIVE_APP_VERSION_KEY = "active_app_version";
export const DEFAULT_ACTIVE_APP_VERSION = "main-web-frontend";

function normalizeSettingValue(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || DEFAULT_ACTIVE_APP_VERSION;
}

export async function getActiveAppVersionSetting() {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT setting_value
      FROM app_settings
      WHERE setting_key = ?
      LIMIT 1
    `,
    [ACTIVE_APP_VERSION_KEY]
  );

  return normalizeSettingValue(row?.setting_value);
}

export async function setActiveAppVersionSetting(activeVersion) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      INSERT INTO app_settings (setting_key, setting_value)
      VALUES (?, ?)
      ON CONFLICT(setting_key)
      DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = CURRENT_TIMESTAMP
    `,
    [ACTIVE_APP_VERSION_KEY, normalizeSettingValue(activeVersion)]
  );

  return getActiveAppVersionSetting();
}
