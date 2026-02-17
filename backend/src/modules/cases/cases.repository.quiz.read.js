import { getDatabase } from "../../db/database.js";
import { getMany, getOne } from "../../db/sqliteClient.js";

function mapCaseQuizQuestions(rows, includeCorrectAnswers) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const questionsById = new Map();

  rows.forEach((row) => {
    if (!questionsById.has(row.question_id)) {
      questionsById.set(row.question_id, {
        id: row.question_id,
        questionText: row.question_text,
        explanationText: row.explanation_text || "",
        sequenceOrder: row.question_sequence_order,
        options: [],
      });
    }

    if (!Number.isInteger(row.option_id)) {
      return;
    }

    const question = questionsById.get(row.question_id);
    const option = {
      id: row.option_id,
      optionText: row.option_text,
      sequenceOrder: row.option_sequence_order,
    };

    if (includeCorrectAnswers) {
      option.isCorrect = row.option_is_correct === 1;
    }

    question.options.push(option);
  });

  return Array.from(questionsById.values())
    .sort((first, second) => first.sequenceOrder - second.sequenceOrder)
    .map((question) => ({
      ...question,
      options: question.options.sort((first, second) => first.sequenceOrder - second.sequenceOrder),
    }));
}

function safeParseAnswersJson(rawValue) {
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapCaseQuizUserResult(row) {
  if (!row) {
    return null;
  }

  return {
    caseId: row.case_id,
    userId: row.user_id,
    scorePercent: row.score_percent,
    correctAnswers: row.correct_answers,
    totalQuestions: row.total_questions,
    passed: row.passed === 1,
    submittedAt: row.submitted_at,
    answers: safeParseAnswersJson(row.answers_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCaseQuizQuestionsByCaseId(caseId, includeCorrectAnswers = true) {
  const database = getDatabase();
  const rows = await getMany(
    database,
    `
      SELECT
        q.id AS question_id,
        q.question_text,
        q.explanation_text,
        q.sequence_order AS question_sequence_order,
        o.id AS option_id,
        o.option_text,
        o.is_correct AS option_is_correct,
        o.sequence_order AS option_sequence_order
      FROM case_quiz_questions q
      LEFT JOIN case_quiz_options o ON o.question_id = q.id
      WHERE q.case_id = ?
      ORDER BY q.sequence_order ASC, q.id ASC, o.sequence_order ASC, o.id ASC
    `,
    [caseId]
  );

  return mapCaseQuizQuestions(rows, includeCorrectAnswers);
}

export async function getCaseQuizQuestionCount(caseId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT COUNT(*) AS total_questions
      FROM case_quiz_questions
      WHERE case_id = ?
    `,
    [caseId]
  );

  return Number.isInteger(row?.total_questions) ? row.total_questions : 0;
}

export async function getCaseQuizUserResult(caseId, userId) {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        case_id,
        user_id,
        score_percent,
        correct_answers,
        total_questions,
        passed,
        submitted_at,
        answers_json,
        created_at,
        updated_at
      FROM case_quiz_user_results
      WHERE case_id = ? AND user_id = ?
      LIMIT 1
    `,
    [caseId, userId]
  );

  return mapCaseQuizUserResult(row);
}
