import { useCallback, useEffect, useState } from "react";
import { fetchCaseQuiz } from "../services/caseQuizApi";
import { CASE_WORKSPACE_MODES } from "../utils/routes";
import { useCaseQuizCreateState } from "./useCaseQuizCreateState";
import { useCaseQuizSolveState } from "./useCaseQuizSolveState";
import { useCaseReviewState } from "./useCaseReviewState";

export function useCaseQuizTabState({ caseId, mode, onUnauthorized, onResolved }) {
  const [caseSummary, setCaseSummary] = useState(null);
  const [passThresholdPercent, setPassThresholdPercent] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const isCreateMode = mode === CASE_WORKSPACE_MODES.CREATE;

  const createState = useCaseQuizCreateState({ caseId, onUnauthorized });
  const solveState = useCaseQuizSolveState({ caseId, onUnauthorized, onResolved });
  const reviewState = useCaseReviewState({
    caseId,
    isCreateMode,
    onUnauthorized,
    onReviewPersisted: (payload) => {
      if (payload?.case) {
        setCaseSummary(payload.case);
      }
      if (typeof onResolved === "function") {
        onResolved(payload);
      }
    },
  });

  const { applyLoadedQuestions, clearCreateMessages } = createState;
  const { applyLoadedSolvePayload, clearSolveMessages } = solveState;
  const { clearReviewMessages, loadReviews } = reviewState;

  const loadQuiz = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    clearCreateMessages();
    clearSolveMessages();
    clearReviewMessages();

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

    if (!isCreateMode) {
      const reviewLoad = await loadReviews();
      if (!reviewLoad.ok) {
        setIsLoading(false);
        return;
      }
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
    clearReviewMessages,
    loadReviews,
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
    reviewSummary: reviewState.reviewSummary,
    reviewItems: reviewState.reviewItems,
    solvedUsers: reviewState.solvedUsers,
    userReview: reviewState.userReview,
    reviewRatingInput: reviewState.reviewRatingInput,
    reviewCommentInput: reviewState.reviewCommentInput,
    isSubmittingReview: reviewState.isSubmittingReview,
    reviewErrorMessage: reviewState.reviewErrorMessage,
    reviewSuccessMessage: reviewState.reviewSuccessMessage,
    isReviewVisibilityLocked: reviewState.isReviewVisibilityLocked,
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
    handleReviewRatingChange: reviewState.handleReviewRatingChange,
    handleReviewCommentChange: reviewState.handleReviewCommentChange,
    handleSubmitReview: () =>
      reviewState.handleSubmitReview(solveState.progress?.progressStatus === "resolved"),
  };
}
