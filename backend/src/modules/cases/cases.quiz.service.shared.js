export const CASE_QUIZ_PASS_THRESHOLD_PERCENT = 80;

export function formatCaseSummary(caseRow) {
  return {
    id: caseRow.id,
    title: caseRow.title,
    description: caseRow.description,
    publicationStatus: caseRow.publicationStatus,
    averageRating: caseRow.averageRating,
    ratingCount: caseRow.ratingCount,
    author: `${caseRow.authorFirstName || ""} ${caseRow.authorLastName || ""}`.trim(),
  };
}

export function mapQuizQuestionsForResponse(questions, includeCorrectAnswers) {
  return questions.map((question) => ({
    id: question.id,
    questionText: question.questionText,
    explanationText: question.explanationText,
    sequenceOrder: question.sequenceOrder,
    options: question.options.map((option) => {
      const mappedOption = {
        id: option.id,
        optionText: option.optionText,
        sequenceOrder: option.sequenceOrder,
      };

      if (includeCorrectAnswers) {
        mappedOption.isCorrect = Boolean(option.isCorrect);
      }

      return mappedOption;
    }),
  }));
}

export function buildQuizSolveBlockers(progress, totalQuestions, roleProgress = null) {
  const blockers = [];

  if (totalQuestions <= 0) {
    blockers.push("Kviz za zavrsetak slucaja jos nije definisan od strane kreatora.");
  }

  const isTimelineReady =
    Number.isInteger(progress?.totalItems) && progress.totalItems > 0 && !progress.hasNextItem;
  if (!Number.isInteger(progress?.totalItems) || progress.totalItems <= 0) {
    blockers.push("Vremenska linija slucaja nije definisana. Nije moguce potvrditi resenje.");
  } else if (progress.hasNextItem) {
    blockers.push("Prije zavrsnog kviza je potrebno otkljucati sve stavke vremenske linije.");
  }

  if (isTimelineReady && !roleProgress?.allRolesResolved) {
    blockers.push("Prije zavrsnog kviza je potrebno tacno postaviti uloge za sve otkljucane osobe.");
  }

  return blockers;
}

export function normalizeSubmittedAnswers(rawAnswers) {
  if (!Array.isArray(rawAnswers)) {
    return new Map();
  }

  return new Map(
    rawAnswers
      .filter(
        (item) =>
          Number.isInteger(item?.questionId) &&
          item.questionId > 0 &&
          Number.isInteger(item?.selectedOptionId) &&
          item.selectedOptionId > 0
      )
      .map((item) => [item.questionId, item.selectedOptionId])
  );
}

export function buildReviewEntries(questions, selectedAnswersByQuestion) {
  return questions.map((question) => {
    const selectedOptionId = selectedAnswersByQuestion.get(question.id) || null;
    const correctOption = question.options.find((option) => option.isCorrect) || null;
    const selectedOption =
      selectedOptionId === null
        ? null
        : question.options.find((option) => option.id === selectedOptionId) || null;

    return {
      questionId: question.id,
      questionText: question.questionText,
      explanationText: question.explanationText,
      selectedOptionId,
      selectedOptionText: selectedOption?.optionText || "",
      correctOptionId: correctOption?.id || null,
      correctOptionText: correctOption?.optionText || "",
      isCorrect: Boolean(correctOption && selectedOption && correctOption.id === selectedOption.id),
    };
  });
}

export function buildAttemptSummary(result) {
  if (!result) {
    return null;
  }

  return {
    scorePercent: result.scorePercent,
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
    passed: result.passed,
    submittedAt: result.submittedAt,
  };
}
