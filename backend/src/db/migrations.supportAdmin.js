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
];

export async function applySupportAdminColumnMigrations(database, ensureColumnExists) {
  await ensureColumnExists(
    database,
    "users",
    "role",
    "TEXT NOT NULL DEFAULT 'user'"
  );
}
