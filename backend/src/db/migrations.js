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
  `
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      publication_status TEXT NOT NULL DEFAULT 'draft'
        CHECK (publication_status IN ('draft', 'published')),
      average_rating REAL NOT NULL DEFAULT 0
        CHECK (average_rating >= 0 AND average_rating <= 5),
      rating_count INTEGER NOT NULL DEFAULT 0
        CHECK (rating_count >= 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_cases_author_user_id
    ON cases(author_user_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_cases_publication_status
    ON cases(publication_status);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      apparent_role TEXT NOT NULL DEFAULT 'unknown'
        CHECK (apparent_role IN ('unknown', 'suspect', 'victim', 'witness')),
      biography TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_people_case_id
    ON case_people(case_id);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      document_type TEXT NOT NULL
        CHECK (
          document_type IN (
            'police_report',
            'forensic_report',
            'dossier',
            'witness_statement',
            'suspect_statement',
            'victim_statement'
          )
        ),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      sequence_order INTEGER NOT NULL DEFAULT 1
        CHECK (sequence_order > 0),
      is_unlocked_by_default INTEGER NOT NULL DEFAULT 0
        CHECK (is_unlocked_by_default IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_documents_case_id
    ON case_documents(case_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_documents_case_order
    ON case_documents(case_id, sequence_order);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_timeline_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      item_type TEXT NOT NULL
        CHECK (item_type IN ('document', 'person')),
      document_id INTEGER,
      person_id INTEGER,
      unlock_order INTEGER NOT NULL
        CHECK (unlock_order > 0),
      unlock_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES case_documents(id) ON DELETE CASCADE,
      FOREIGN KEY (person_id) REFERENCES case_people(id) ON DELETE CASCADE,
      CHECK (
        (item_type = 'document' AND document_id IS NOT NULL AND person_id IS NULL)
        OR
        (item_type = 'person' AND person_id IS NOT NULL AND document_id IS NULL)
      ),
      UNIQUE (case_id, unlock_order)
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id
    ON case_timeline_items(case_id);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      progress_status TEXT NOT NULL
        CHECK (progress_status IN ('in_progress', 'resolved')),
      progress_percent INTEGER NOT NULL DEFAULT 0
        CHECK (progress_percent >= 0 AND progress_percent <= 100),
      user_rating REAL
        CHECK (user_rating >= 0 AND user_rating <= 5),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (case_id, user_id)
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_user_progress_user_status
    ON case_user_progress(user_id, progress_status);
  `,
];

export async function applyMigrations(database) {
  for (const statement of MIGRATIONS) {
    await runQuery(database, statement);
  }
}
