import { getDatabase } from "../../db/database.js";
import { runQuery } from "../../db/sqliteClient.js";
import {
  getCaseQuizQuestionsByCaseId,
  getCaseQuizUserResult,
} from "./cases.repository.quiz.read.js";

export async function replaceCaseQuizQuestions(caseId, questions) {
  const database = getDatabase();
  await runQuery(database, "BEGIN");

  try {
    await runQuery(database, `DELETE FROM case_quiz_questions WHERE case_id = ?`, [caseId]);

    for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
      const question = questions[questionIndex];
      const questionResult = await runQuery(
        database,
        `
          INSERT INTO case_quiz_questions (
            case_id,
            question_text,
            explanation_text,
            sequence_order
          )
          VALUES (?, ?, ?, ?)
        `,
        [caseId, question.questionText, question.explanationText, questionIndex + 1]
      );

      for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
        const option = question.options[optionIndex];
        await runQuery(
          database,
          `
            INSERT INTO case_quiz_options (
              question_id,
              option_text,
              is_correct,
              sequence_order
            )
            VALUES (?, ?, ?, ?)
          `,
          [questionResult.lastID, option.optionText, option.isCorrect ? 1 : 0, optionIndex + 1]
        );
      }
    }

    await runQuery(database, "COMMIT");
    return await getCaseQuizQuestionsByCaseId(caseId, true);
  } catch (error) {
    await runQuery(database, "ROLLBACK").catch(() => null);
    throw error;
  }
}

export async function upsertCaseQuizUserResult(caseId, userId, payload) {
  const database = getDatabase();
  await runQuery(
    database,
    `
      INSERT INTO case_quiz_user_results (
        case_id,
        user_id,
        score_percent,
        correct_answers,
        total_questions,
        passed,
        submitted_at,
        answers_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(case_id, user_id) DO UPDATE SET
        score_percent = excluded.score_percent,
        correct_answers = excluded.correct_answers,
        total_questions = excluded.total_questions,
        passed = excluded.passed,
        submitted_at = excluded.submitted_at,
        answers_json = excluded.answers_json,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      caseId,
      userId,
      payload.scorePercent,
      payload.correctAnswers,
      payload.totalQuestions,
      payload.passed ? 1 : 0,
      payload.submittedAt,
      JSON.stringify(Array.isArray(payload.answers) ? payload.answers : []),
    ]
  );

  return await getCaseQuizUserResult(caseId, userId);
}
