import { useCallback, useEffect, useState } from "react";
import { fetchCaseQuiz } from "../services/caseQuizApi";
import { CASE_WORKSPACE_MODES } from "../utils/routes";
import { useCaseQuizCreateState } from "./useCaseQuizCreateState";
import { useCaseQuizSolveState } from "./useCaseQuizSolveState";

export function useCaseQuizTabState({ caseId, mode, onUnauthorized, onResolved }) {
  const [caseSummary, setCaseSummary] = useState(null);
  const [passThresholdPercent, setPassThresholdPercent] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const isCreateMode = mode === CASE_WORKSPACE_MODES.CREATE;

  const createState = useCaseQuizCreateState({ caseId, onUnauthorized });
  const solveState = useCaseQuizSolveState({ caseId, onUnauthorized, onResolved });
  const { applyLoadedQuestions, clearCreateMessages } = createState;
  const { applyLoadedSolvePayload, clearSolveMessages } = solveState;

  const loadQuiz = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    clearCreateMessages();
    clearSolveMessages();

    const result = await fetchCaseQuiz(caseId, isCreateMode ? "create" : "solve");
    if (!result.ok) {
      if (result.unauthorized) {
        setIsLoading(false);
        onUnauthorized();
        return;
      }

      setErrorMessage(result.message || "Ucitavanje kviza nije uspelo.");
      setIsLoading(false);
      return;
    }

    const payload = result.data || {};
    setPassThresholdPercent(Number(payload.passThresholdPercent) || 80);
    setCaseSummary(payload.case || null);

    if (isCreateMode) {
      applyLoadedQuestions(payload.questions);
    } else {
      applyLoadedSolvePayload(payload);
    }

    setIsLoading(false);
  }, [
    caseId,
    isCreateMode,
    onUnauthorized,
    applyLoadedQuestions,
    applyLoadedSolvePayload,
    clearCreateMessages,
    clearSolveMessages,
  ]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  return {
    questions: isCreateMode ? createState.questions : solveState.questions,
    caseSummary,
    progress: solveState.progress,
    passThresholdPercent,
    canSubmit: solveState.canSubmit,
    blockers: solveState.blockers,
    review: solveState.review,
    lastAttempt: solveState.lastAttempt,
    selectedAnswers: solveState.selectedAnswers,
    isCreateMode,
    isLoading,
    errorMessage,
    isSaving: createState.isSaving,
    isSubmitting: solveState.isSubmitting,
    saveErrorMessage: createState.saveErrorMessage,
    saveSuccessMessage: createState.saveSuccessMessage,
    submitErrorMessage: solveState.submitErrorMessage,
    submitSuccessMessage: solveState.submitSuccessMessage,
    loadQuiz,
    handleQuestionFieldChange: createState.handleQuestionFieldChange,
    handleOptionFieldChange: createState.handleOptionFieldChange,
    handleCorrectOptionChange: createState.handleCorrectOptionChange,
    handleAddQuestion: createState.handleAddQuestion,
    handleRemoveQuestion: createState.handleRemoveQuestion,
    handleAddOption: createState.handleAddOption,
    handleRemoveOption: createState.handleRemoveOption,
    handleSaveQuiz: createState.handleSaveQuiz,
    handleSolveAnswerChange: solveState.handleSolveAnswerChange,
    handleSubmitQuiz: solveState.handleSubmitQuiz,
  };
}
