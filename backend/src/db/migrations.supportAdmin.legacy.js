import { getMany, runQuery } from "./sqliteClient.js";

async function tableHasColumn(database, tableName, columnName) {
  const rows = await getMany(database, `PRAGMA table_info(${tableName})`);
  return rows.some((row) => row?.name === columnName);
}

async function ensureAdminAccountsTable(database) {
  await runQuery(
    database,
    `
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
          CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
  );
  await runQuery(
    database,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_accounts_email
      ON admin_accounts(email);
    `
  );
  await runQuery(
    database,
    `
      CREATE INDEX IF NOT EXISTS idx_admin_accounts_is_active
      ON admin_accounts(is_active);
    `
  );
}

async function seedAdminAccountsFromLegacyUsers(database) {
  await runQuery(
    database,
    `
      INSERT INTO admin_accounts (first_name, last_name, email, password_hash, is_active)
      SELECT
        u.first_name,
        u.last_name,
        lower(u.email),
        u.password_hash,
        1
      FROM users u
      WHERE u.role = 'admin'
      ON CONFLICT(email) DO NOTHING
    `
  );
}

async function migrateLegacyAdminAnnouncementsTable(database) {
  const hasLegacyCreatorColumn = await tableHasColumn(
    database,
    "admin_announcements",
    "created_by_admin_user_id"
  );
  const hasNewCreatorColumn = await tableHasColumn(
    database,
    "admin_announcements",
    "created_by_admin_account_id"
  );
  if (!hasLegacyCreatorColumn || hasNewCreatorColumn) {
    return;
  }

  await runQuery(database, "PRAGMA foreign_keys = OFF;");
  try {
    await runQuery(database, "DROP TABLE IF EXISTS admin_announcements_v2;");
    await runQuery(
      database,
      `
        CREATE TABLE admin_announcements_v2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_by_admin_account_id INTEGER,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by_admin_account_id) REFERENCES admin_accounts(id) ON DELETE SET NULL
        );
      `
    );
    await runQuery(
      database,
      `
        INSERT INTO admin_announcements_v2 (
          id,
          title,
          content,
          created_by_admin_account_id,
          created_at,
          updated_at
        )
        SELECT
          aa.id,
          aa.title,
          aa.content,
          creator_account.id,
          aa.created_at,
          aa.updated_at
        FROM admin_announcements aa
        LEFT JOIN users creator_user
          ON creator_user.id = aa.created_by_admin_user_id
        LEFT JOIN admin_accounts creator_account
          ON creator_account.email = lower(creator_user.email)
      `
    );
    await runQuery(database, "DROP TABLE admin_announcements;");
    await runQuery(database, "ALTER TABLE admin_announcements_v2 RENAME TO admin_announcements;");
    await runQuery(
      database,
      `
        CREATE INDEX IF NOT EXISTS idx_admin_announcements_created_at
        ON admin_announcements(created_at);
      `
    );
    await runQuery(
      database,
      `
        CREATE INDEX IF NOT EXISTS idx_admin_announcements_created_by
        ON admin_announcements(created_by_admin_account_id);
      `
    );
  } finally {
    await runQuery(database, "PRAGMA foreign_keys = ON;");
  }
}

export async function applySupportAdminLegacyMigrations(database, ensureColumnExists) {
  await ensureColumnExists(
    database,
    "users",
    "role",
    "TEXT NOT NULL DEFAULT 'user'"
  );

  await ensureAdminAccountsTable(database);
  await seedAdminAccountsFromLegacyUsers(database);
  await migrateLegacyAdminAnnouncementsTable(database);
}
