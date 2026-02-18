export const SUPPORT_ADMIN_MIGRATIONS = [
  `
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_user_id INTEGER NOT NULL,
      ticket_type TEXT NOT NULL
        CHECK (ticket_type IN ('bug_report', 'improvement_suggestion')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      app_location TEXT NOT NULL DEFAULT '',
      app_version TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'reviewed', 'in_progress', 'rejected', 'closed')),
      admin_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_support_tickets_reporter_user_id
    ON support_tickets(reporter_user_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_support_tickets_status
    ON support_tickets(status);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at
    ON support_tickets(created_at);
  `,
  `
    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    INSERT INTO app_settings (setting_key, setting_value)
    VALUES ('active_app_version', 'main-web-frontend')
    ON CONFLICT(setting_key) DO NOTHING;
  `,
  `
    CREATE TABLE IF NOT EXISTS admin_announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_by_admin_user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by_admin_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_admin_announcements_created_at
    ON admin_announcements(created_at);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_admin_announcements_created_by
    ON admin_announcements(created_by_admin_user_id);
  `,
  `
    CREATE TABLE IF NOT EXISTS admin_announcement_dismissals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      announcement_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      dismissed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (announcement_id) REFERENCES admin_announcements(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (announcement_id, user_id)
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_admin_announcement_dismissals_user_id
    ON admin_announcement_dismissals(user_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_admin_announcement_dismissals_announcement_id
    ON admin_announcement_dismissals(announcement_id);
  `,
];

export async function applySupportAdminColumnMigrations(database, ensureColumnExists) {
  await ensureColumnExists(
    database,
    "users",
    "role",
    "TEXT NOT NULL DEFAULT 'user'"
  );
}
