export const QUIZ_MIN_OPTIONS = 2;
export const QUIZ_MAX_OPTIONS = 6;
export const QUIZ_DEFAULT_OPTIONS = 4;

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatOptionLabel(index) {
  return String.fromCharCode(65 + index);
}

export function buildEmptyQuestion(localQuestionKey, nextOptionKey) {
  const options = [];
  for (let index = 0; index < QUIZ_DEFAULT_OPTIONS; index += 1) {
    options.push({
      localKey: nextOptionKey(),
      optionText: "",
      isCorrect: index === 0,
      label: formatOptionLabel(index),
    });
  }

  return {
    localKey: localQuestionKey,
    questionText: "",
    explanationText: "",
    options,
  };
}

export function mapQuizQuestionsForEditor(rawQuestions, nextQuestionKey, nextOptionKey) {
  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  return rawQuestions.map((question) => {
    const mappedOptions = Array.isArray(question.options)
      ? question.options.map((option, optionIndex) => ({
          localKey: nextOptionKey(),
          optionText: option.optionText || "",
          isCorrect: Boolean(option.isCorrect),
          label: formatOptionLabel(optionIndex),
        }))
      : [];

    const hasCorrectOption = mappedOptions.some((option) => option.isCorrect);
    const normalizedOptions = mappedOptions.map((option, optionIndex) => ({
      ...option,
      isCorrect: hasCorrectOption ? option.isCorrect : optionIndex === 0,
      label: formatOptionLabel(optionIndex),
    }));

    return {
      localKey: nextQuestionKey(),
      questionText: question.questionText || "",
      explanationText: question.explanationText || "",
      options: normalizedOptions,
    };
  });
}

export function validateQuizQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "Dodaj bar jedno pitanje za završni kviz.";
  }

  for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
    const question = questions[questionIndex];
    if (toText(question.questionText).length < 8) {
      return `Pitanje #${questionIndex + 1} mora imati najmanje 8 karaktera.`;
    }

    if (toText(question.explanationText).length < 8) {
      return `Objašnjenje za pitanje #${questionIndex + 1} mora imati najmanje 8 karaktera.`;
    }

    if (!Array.isArray(question.options) || question.options.length < QUIZ_MIN_OPTIONS) {
      return `Pitanje #${questionIndex + 1} mora imati najmanje ${QUIZ_MIN_OPTIONS} odgovora.`;
    }

    if (question.options.length > QUIZ_MAX_OPTIONS) {
      return `Pitanje #${questionIndex + 1} može imati najviše ${QUIZ_MAX_OPTIONS} odgovora.`;
    }

    const correctCount = question.options.reduce(
      (total, option) => (option.isCorrect ? total + 1 : total),
      0
    );

    if (correctCount !== 1) {
      return `Pitanje #${questionIndex + 1} mora imati tačno jedan tačan odgovor.`;
    }

    for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
      const option = question.options[optionIndex];
      if (toText(option.optionText).length < 2) {
        return `Odgovor ${optionIndex + 1} u pitanju #${questionIndex + 1} mora imati najmanje 2 karaktera.`;
      }
    }
  }

  return "";
}

export function buildQuizSavePayload(questions) {
  return {
    questions: questions.map((question) => ({
      questionText: toText(question.questionText),
      explanationText: toText(question.explanationText),
      options: question.options.map((option) => ({
        optionText: toText(option.optionText),
        isCorrect: Boolean(option.isCorrect),
      })),
    })),
  };
}

export function buildQuizSubmitPayload(questions, selectedAnswers) {
  const answerItems = Array.isArray(questions)
    ? questions.map((question) => {
        const selectedOptionId = Number.parseInt(selectedAnswers?.[question.id], 10);
        return {
          questionId: question.id,
          selectedOptionId: Number.isInteger(selectedOptionId) ? selectedOptionId : 0,
        };
      })
    : [];

  return {
    payload: {
      answers: answerItems,
    },
    missingAnswers: answerItems.filter((item) => item.selectedOptionId <= 0).length,
  };
}

export function buildSelectedAnswersFromReview(review) {
  if (!Array.isArray(review)) {
    return {};
  }

  return review.reduce((accumulator, item) => {
    if (Number.isInteger(item?.questionId) && Number.isInteger(item?.selectedOptionId)) {
      accumulator[item.questionId] = item.selectedOptionId;
    }
    return accumulator;
  }, {});
}

export function pickFirstValidationMessage(errors) {
  if (!errors || typeof errors !== "object") {
    return "";
  }

  const keys = Object.keys(errors);
  for (const key of keys) {
    const message = errors[key];
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "";
}

export function formatSolvedAt(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString("sr-Latn-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
