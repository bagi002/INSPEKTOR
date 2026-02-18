import { useCallback, useRef, useState } from "react";
import { saveCaseQuiz } from "../services/caseQuizApi";
import {
  QUIZ_MAX_OPTIONS,
  QUIZ_MIN_OPTIONS,
  buildEmptyQuestion,
  buildQuizSavePayload,
  mapQuizQuestionsForEditor,
  pickFirstValidationMessage,
  validateQuizQuestions,
} from "./caseQuizHelpers";

export function useCaseQuizCreateState({ caseId, onUnauthorized }) {
  const [questions, setQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const questionKeyRef = useRef(1);
  const optionKeyRef = useRef(1);

  const nextQuestionKey = useCallback(() => {
    const key = `quiz-question-${questionKeyRef.current}`;
    questionKeyRef.current += 1;
    return key;
  }, []);

  const nextOptionKey = useCallback(() => {
    const key = `quiz-option-${optionKeyRef.current}`;
    optionKeyRef.current += 1;
    return key;
  }, []);

  const applyLoadedQuestions = useCallback(
    (rawQuestions) => {
      setQuestions(mapQuizQuestionsForEditor(rawQuestions, nextQuestionKey, nextOptionKey));
    },
    [nextOptionKey, nextQuestionKey]
  );

  const clearCreateMessages = useCallback(() => {
    setSaveErrorMessage("");
    setSaveSuccessMessage("");
  }, []);

  function handleQuestionFieldChange(localQuestionKey, fieldName, value) {
    setQuestions((previous) =>
      previous.map((question) =>
        question.localKey === localQuestionKey ? { ...question, [fieldName]: value } : question
      )
    );
  }

  function handleOptionFieldChange(localQuestionKey, localOptionKey, value) {
    setQuestions((previous) =>
      previous.map((question) => {
        if (question.localKey !== localQuestionKey) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option) =>
            option.localKey === localOptionKey ? { ...option, optionText: value } : option
          ),
        };
      })
    );
  }

  function handleCorrectOptionChange(localQuestionKey, localOptionKey) {
    setQuestions((previous) =>
      previous.map((question) => {
        if (question.localKey !== localQuestionKey) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option) => ({
            ...option,
            isCorrect: option.localKey === localOptionKey,
          })),
        };
      })
    );
  }

  function handleAddQuestion() {
    setQuestions((previous) => [...previous, buildEmptyQuestion(nextQuestionKey(), nextOptionKey)]);
  }

  function handleRemoveQuestion(localQuestionKey) {
    setQuestions((previous) => previous.filter((question) => question.localKey !== localQuestionKey));
  }

  function handleAddOption(localQuestionKey) {
    setQuestions((previous) =>
      previous.map((question) => {
        if (question.localKey !== localQuestionKey || question.options.length >= QUIZ_MAX_OPTIONS) {
          return question;
        }

        return {
          ...question,
          options: [
            ...question.options,
            {
              localKey: nextOptionKey(),
              optionText: "",
              isCorrect: false,
              label: String.fromCharCode(65 + question.options.length),
            },
          ],
        };
      })
    );
  }

  function handleRemoveOption(localQuestionKey, localOptionKey) {
    setQuestions((previous) =>
      previous.map((question) => {
        if (question.localKey !== localQuestionKey || question.options.length <= QUIZ_MIN_OPTIONS) {
          return question;
        }

        const filteredOptions = question.options.filter((option) => option.localKey !== localOptionKey);
        const hasCorrectOption = filteredOptions.some((option) => option.isCorrect);

        return {
          ...question,
          options: filteredOptions.map((option, optionIndex) => ({
            ...option,
            isCorrect: hasCorrectOption ? option.isCorrect : optionIndex === 0,
            label: String.fromCharCode(65 + optionIndex),
          })),
        };
      })
    );
  }

  async function handleSaveQuiz() {
    setIsSaving(true);
    setSaveErrorMessage("");
    setSaveSuccessMessage("");

    const localValidationMessage = validateQuizQuestions(questions);
    if (localValidationMessage) {
      setSaveErrorMessage(localValidationMessage);
      setIsSaving(false);
      return;
    }

    const result = await saveCaseQuiz(caseId, buildQuizSavePayload(questions));
    if (!result.ok) {
      if (result.unauthorized) {
        setIsSaving(false);
        onUnauthorized();
        return;
      }

      setSaveErrorMessage(
        pickFirstValidationMessage(result.errors) || result.message || "Čuvanje kviza nije uspelo."
      );
      setIsSaving(false);
      return;
    }

    applyLoadedQuestions(result.data?.questions);
    setSaveSuccessMessage(result.message || "Kviz je uspešno sačuvan.");
    setIsSaving(false);
  }

  return {
    questions,
    isSaving,
    saveErrorMessage,
    saveSuccessMessage,
    applyLoadedQuestions,
    clearCreateMessages,
    handleQuestionFieldChange,
    handleOptionFieldChange,
    handleCorrectOptionChange,
    handleAddQuestion,
    handleRemoveQuestion,
    handleAddOption,
    handleRemoveOption,
    handleSaveQuiz,
  };
}
