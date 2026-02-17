export const CASE_QUIZ_MIGRATIONS = [
  `
    CREATE TABLE IF NOT EXISTS case_quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      explanation_text TEXT NOT NULL DEFAULT '',
      sequence_order INTEGER NOT NULL DEFAULT 1
        CHECK (sequence_order > 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_quiz_questions_case_id
    ON case_quiz_questions(case_id, sequence_order);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_quiz_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0
        CHECK (is_correct IN (0, 1)),
      sequence_order INTEGER NOT NULL DEFAULT 1
        CHECK (sequence_order > 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES case_quiz_questions(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_quiz_options_question_id
    ON case_quiz_options(question_id, sequence_order);
  `,
  `
    CREATE TABLE IF NOT EXISTS case_quiz_user_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      score_percent INTEGER NOT NULL DEFAULT 0
        CHECK (score_percent >= 0 AND score_percent <= 100),
      correct_answers INTEGER NOT NULL DEFAULT 0
        CHECK (correct_answers >= 0),
      total_questions INTEGER NOT NULL DEFAULT 0
        CHECK (total_questions >= 0),
      passed INTEGER NOT NULL DEFAULT 0
        CHECK (passed IN (0, 1)),
      submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      answers_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (case_id, user_id)
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_case_quiz_user_results_case_user
    ON case_quiz_user_results(case_id, user_id);
  `,
];
