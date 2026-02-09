import { runQuery } from "./sqliteClient.js";

const MIGRATIONS = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users(email);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_users_created_at
    ON users(created_at);
  `,
];

export async function applyMigrations(database) {
  for (const statement of MIGRATIONS) {
    await runQuery(database, statement);
  }
}
