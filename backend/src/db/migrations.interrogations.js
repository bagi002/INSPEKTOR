export const CASE_INTERROGATIONS_MIGRATIONS = [
  `
    CREATE TABLE IF NOT EXISTS case_interrogations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      person_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      opening_prompt TEXT NOT NULL DEFAULT '',
      created_by_user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (case_id, person_id),
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (person_id) REFERENCES case_people(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_interrogations_case_person
    ON case_interrogations(case_id, person_id);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_interrogation_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interrogation_id INTEGER NOT NULL,
      node_key TEXT NOT NULL,
      parent_node_key TEXT,
      question_reference_key TEXT NOT NULL DEFAULT '',
      question_text TEXT NOT NULL,
      answer_text TEXT NOT NULL,
      sequence_order INTEGER NOT NULL DEFAULT 1
        CHECK (sequence_order > 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (interrogation_id, node_key),
      FOREIGN KEY (interrogation_id) REFERENCES case_interrogations(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_interrogation_nodes_interrogation
    ON case_interrogation_nodes(interrogation_id, sequence_order);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_interrogation_nodes_parent
    ON case_interrogation_nodes(interrogation_id, parent_node_key);
  `,
];
