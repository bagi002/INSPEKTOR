export const CASE_PEOPLE_MIGRATIONS = [
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
    CREATE TABLE IF NOT EXISTS case_person_dossiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL UNIQUE,
      phone_number TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      height_cm INTEGER
        CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 260)),
      is_alive INTEGER NOT NULL DEFAULT 1
        CHECK (is_alive IN (0, 1)),
      prior_offenses TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES case_people(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_person_dossiers_person_id
    ON case_person_dossiers(person_id);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_person_dossier_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dossier_id INTEGER NOT NULL UNIQUE,
      dossier_number TEXT NOT NULL UNIQUE,
      dossier_status TEXT NOT NULL DEFAULT 'active'
        CHECK (dossier_status IN ('active', 'archived', 'restricted')),
      classification_level TEXT NOT NULL DEFAULT 'interno',
      revision_number INTEGER NOT NULL DEFAULT 1
        CHECK (revision_number > 0),
      generated_by_user_id INTEGER NOT NULL,
      generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_reviewed_at TEXT,
      birth_date TEXT NOT NULL DEFAULT '',
      birth_place TEXT NOT NULL DEFAULT '',
      nationality TEXT NOT NULL DEFAULT '',
      gender TEXT NOT NULL DEFAULT '',
      marital_status TEXT NOT NULL DEFAULT '',
      occupation TEXT NOT NULL DEFAULT '',
      employer TEXT NOT NULL DEFAULT '',
      education_level TEXT NOT NULL DEFAULT '',
      eye_color TEXT NOT NULL DEFAULT '',
      hair_color TEXT NOT NULL DEFAULT '',
      weight_kg INTEGER
        CHECK (weight_kg IS NULL OR (weight_kg >= 25 AND weight_kg <= 300)),
      identifying_marks TEXT NOT NULL DEFAULT '',
      known_associates TEXT NOT NULL DEFAULT '',
      risk_level TEXT NOT NULL DEFAULT 'unknown'
        CHECK (risk_level IN ('unknown', 'low', 'medium', 'high', 'critical')),
      last_known_location TEXT NOT NULL DEFAULT '',
      photo_data_url TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dossier_id) REFERENCES case_person_dossiers(id) ON DELETE CASCADE,
      FOREIGN KEY (generated_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_person_dossier_profiles_dossier_id
    ON case_person_dossier_profiles(dossier_id);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_person_role_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      person_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      assigned_role TEXT NOT NULL DEFAULT 'unknown'
        CHECK (assigned_role IN ('unknown', 'suspect', 'victim', 'witness')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (person_id) REFERENCES case_people(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (case_id, person_id, user_id)
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_person_role_assignments_case_user
    ON case_person_role_assignments(case_id, user_id);
  `,
];
