import { useCallback, useState } from "react";
import { submitCaseQuiz } from "../services/caseQuizApi";
import {
  buildQuizSubmitPayload,
  buildSelectedAnswersFromReview,
  pickFirstValidationMessage,
} from "./caseQuizHelpers";

export function useCaseQuizSolveState({ caseId, onUnauthorized, onResolved }) {
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [blockers, setBlockers] = useState([]);
  const [review, setReview] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");

  const applyLoadedSolvePayload = useCallback((payload) => {
    setQuestions(Array.isArray(payload?.questions) ? payload.questions : []);
    setProgress(payload?.progress || null);
    setCanSubmit(Boolean(payload?.canSubmit));
    setBlockers(Array.isArray(payload?.blockers) ? payload.blockers : []);
    setReview(Array.isArray(payload?.review) ? payload.review : null);
    setLastAttempt(payload?.lastAttempt || null);
    setSelectedAnswers(buildSelectedAnswersFromReview(payload?.review));
  }, []);

  const clearSolveMessages = useCallback(() => {
    setSubmitErrorMessage("");
    setSubmitSuccessMessage("");
  }, []);

  function handleSolveAnswerChange(questionId, selectedOptionId) {
    setSelectedAnswers((previous) => ({
      ...previous,
      [questionId]: selectedOptionId,
    }));
  }

  async function handleSubmitQuiz() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorMessage("");
    setSubmitSuccessMessage("");

    const { payload, missingAnswers } = buildQuizSubmitPayload(questions, selectedAnswers);
    if (missingAnswers > 0) {
      setSubmitErrorMessage("Odgovori na sva pitanja prije predaje kviza.");
      setIsSubmitting(false);
      return;
    }

    const result = await submitCaseQuiz(caseId, payload);
    if (!result.ok) {
      if (result.unauthorized) {
        setIsSubmitting(false);
        onUnauthorized();
        return;
      }

      setSubmitErrorMessage(
        pickFirstValidationMessage(result.errors) || result.message || "Predaja kviza nije uspela."
      );
      setIsSubmitting(false);
      return;
    }

    const payloadData = result.data || {};
    setProgress(payloadData.userProgress || progress);
    setLastAttempt(payloadData.lastAttempt || null);

    if (payloadData.passed) {
      setReview(Array.isArray(payloadData.review) ? payloadData.review : []);
      setSelectedAnswers(buildSelectedAnswersFromReview(payloadData.review));
      setCanSubmit(false);
      setBlockers([]);
      setSubmitSuccessMessage(result.message || "Slucaj je uspesno rijesen.");
      if (typeof onResolved === "function") {
        onResolved(payloadData);
      }
    } else {
      setReview(null);
      setCanSubmit(true);
      setSubmitErrorMessage(result.message || "Kviz nije polozen. Nastavi istragu i pokusaj ponovo.");
    }

    setIsSubmitting(false);
  }

  return {
    questions,
    progress,
    canSubmit,
    blockers,
    review,
    lastAttempt,
    selectedAnswers,
    isSubmitting,
    submitErrorMessage,
    submitSuccessMessage,
    applyLoadedSolvePayload,
    clearSolveMessages,
    handleSolveAnswerChange,
    handleSubmitQuiz,
  };
}
