function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function sanitizeQuizOption(rawOption) {
  return {
    optionText: toText(rawOption?.optionText),
    isCorrect: Boolean(rawOption?.isCorrect),
  };
}

function sanitizeQuizQuestion(rawQuestion) {
  const rawOptions = Array.isArray(rawQuestion?.options) ? rawQuestion.options : [];

  return {
    questionText: toText(rawQuestion?.questionText),
    explanationText: toText(rawQuestion?.explanationText),
    options: rawOptions.map(sanitizeQuizOption),
  };
}

export function validateCaseQuizPayload(payload) {
  const errors = {};
  const rawQuestions = Array.isArray(payload?.questions) ? payload.questions : [];
  const sanitizedQuestions = rawQuestions.map(sanitizeQuizQuestion);

  sanitizedQuestions.forEach((question, questionIndex) => {
    if (question.questionText.length < 8) {
      errors[`questions.${questionIndex}.questionText`] =
        "Pitanje mora imati najmanje 8 karaktera.";
    }

    if (question.explanationText.length < 8) {
      errors[`questions.${questionIndex}.explanationText`] =
        "Objašnjenje mora imati najmanje 8 karaktera.";
    }

    if (question.options.length < 2 || question.options.length > 6) {
      errors[`questions.${questionIndex}.options`] =
        "Svako pitanje mora imati između 2 i 6 ponudjenih odgovora.";
      return;
    }

    let correctCount = 0;
    question.options.forEach((option, optionIndex) => {
      if (option.optionText.length < 2) {
        errors[`questions.${questionIndex}.options.${optionIndex}.optionText`] =
          "Odgovor mora imati najmanje 2 karaktera.";
      }

      if (option.isCorrect) {
        correctCount += 1;
      }
    });

    if (correctCount !== 1) {
      errors[`questions.${questionIndex}.options.correct`] =
        "Svako pitanje mora imati tačno jedan tačan odgovor.";
    }
  });

  return {
    errors,
    sanitized: {
      questions: sanitizedQuestions,
    },
  };
}

export function validateCaseQuizSubmissionPayload(payload, quizQuestions) {
  const errors = {};
  const rawAnswers = Array.isArray(payload?.answers) ? payload.answers : [];

  const expectedQuestions = Array.isArray(quizQuestions) ? quizQuestions : [];
  const questionDirectory = new Map(
    expectedQuestions.map((question) => [
      question.id,
      new Set(question.options.map((option) => option.id)),
    ])
  );

  const selectedAnswersByQuestion = new Map();

  rawAnswers.forEach((answer, answerIndex) => {
    const questionId = toInteger(answer?.questionId, 0);
    const selectedOptionId = toInteger(answer?.selectedOptionId, 0);

    if (!questionDirectory.has(questionId)) {
      errors[`answers.${answerIndex}.questionId`] = "Pitanje ne postoji u traženom kvizu.";
      return;
    }

    if (selectedAnswersByQuestion.has(questionId)) {
      errors[`answers.${answerIndex}.questionId`] = "Za svako pitanje je dozvoljen samo jedan odgovor.";
      return;
    }

    const validOptionIds = questionDirectory.get(questionId);
    if (!validOptionIds.has(selectedOptionId)) {
      errors[`answers.${answerIndex}.selectedOptionId`] =
        "Izabrani odgovor ne pripada traženom pitanju.";
      return;
    }

    selectedAnswersByQuestion.set(questionId, selectedOptionId);
  });

  expectedQuestions.forEach((question, questionIndex) => {
    if (selectedAnswersByQuestion.has(question.id)) {
      return;
    }

    errors[`answers.missing.${questionIndex}`] =
      "Potrebno je odgovoriti na svako pitanje prije predaje kviza.";
  });

  return {
    errors,
    sanitized: {
      answers: expectedQuestions.map((question) => ({
        questionId: question.id,
        selectedOptionId: selectedAnswersByQuestion.get(question.id) || 0,
      })),
    },
  };
}
