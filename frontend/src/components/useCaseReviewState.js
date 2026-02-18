import { useCallback, useState } from "react";
import { fetchCaseReviews, submitCaseReview } from "../services/caseQuizApi";
import { pickFirstValidationMessage } from "./caseQuizHelpers";

export function useCaseReviewState({
  caseId,
  isCreateMode,
  onUnauthorized,
  onReviewPersisted,
}) {
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewItems, setReviewItems] = useState([]);
  const [solvedUsers, setSolvedUsers] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewRatingInput, setReviewRatingInput] = useState("");
  const [reviewCommentInput, setReviewCommentInput] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewErrorMessage, setReviewErrorMessage] = useState("");
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("");
  const [isReviewVisibilityLocked, setIsReviewVisibilityLocked] = useState(false);

  const applyReviewPayload = useCallback((payload, lockedVisibility) => {
    if (lockedVisibility) {
      setReviewSummary(null);
      setReviewItems([]);
      setSolvedUsers([]);
      setUserReview(null);
      setReviewRatingInput("");
      setReviewCommentInput("");
      return;
    }

    setReviewSummary(payload?.summary || null);
    setReviewItems(Array.isArray(payload?.reviews) ? payload.reviews : []);
    setSolvedUsers(Array.isArray(payload?.solvedUsers) ? payload.solvedUsers : []);

    const resolvedUserReview = payload?.userReview || null;
    setUserReview(resolvedUserReview);
    if (resolvedUserReview) {
      setReviewRatingInput(String(resolvedUserReview.rating ?? ""));
      setReviewCommentInput(resolvedUserReview.comment || "");
    } else {
      setReviewRatingInput("");
      setReviewCommentInput("");
    }
  }, []);

  const clearReviewMessages = useCallback(() => {
    setReviewErrorMessage("");
    setReviewSuccessMessage("");
  }, []);

  const loadReviews = useCallback(async () => {
    clearReviewMessages();
    setIsReviewVisibilityLocked(false);

    const reviewScope = isCreateMode ? "create" : "solve";
    const reviewResult = await fetchCaseReviews(caseId, reviewScope);
    if (!reviewResult.ok) {
      if (reviewResult.unauthorized) {
        onUnauthorized();
        return { ok: false, unauthorized: true };
      }

      const isLockedByPolicy = !isCreateMode && reviewResult.statusCode === 403;
      setIsReviewVisibilityLocked(isLockedByPolicy);
      if (isLockedByPolicy) {
        applyReviewPayload(null, true);
        return { ok: true, unauthorized: false };
      }

      applyReviewPayload(null, false);
      setReviewErrorMessage(reviewResult.message || "Učitavanje recenzija nije uspelo.");
      return { ok: false, unauthorized: false };
    }

    setIsReviewVisibilityLocked(false);
    applyReviewPayload(reviewResult.data, false);
    return { ok: true, unauthorized: false };
  }, [applyReviewPayload, caseId, clearReviewMessages, isCreateMode, onUnauthorized]);

  const handleReviewRatingChange = useCallback((value) => {
    setReviewRatingInput(value);
  }, []);

  const handleReviewCommentChange = useCallback((value) => {
    setReviewCommentInput(value);
  }, []);

  const handleSubmitReview = useCallback(
    async (isCaseResolved) => {
      if (isCreateMode || isSubmittingReview) {
        return;
      }

      if (!isCaseResolved) {
        setReviewErrorMessage("Ocjena je dostupna tek nakon sto uspjesno riješiš slučaj.");
        return;
      }

      const parsedRating = Number(reviewRatingInput);
      if (!Number.isFinite(parsedRating) || parsedRating <= 0) {
        setReviewErrorMessage("Izaberi ocjenu prije slanja recenzije.");
        return;
      }

      setIsSubmittingReview(true);
      setReviewErrorMessage("");
      setReviewSuccessMessage("");

      const result = await submitCaseReview(caseId, {
        rating: parsedRating,
        comment: reviewCommentInput,
      });

      if (!result.ok) {
        if (result.unauthorized) {
          setIsSubmittingReview(false);
          onUnauthorized();
          return;
        }

        setReviewErrorMessage(
          pickFirstValidationMessage(result.errors) ||
            result.message ||
            "Čuvanje recenzije nije uspelo."
        );
        setIsSubmittingReview(false);
        return;
      }

      const payload = result.data || {};
      applyReviewPayload(payload, false);
      setIsReviewVisibilityLocked(false);
      const successMessage = result.message || "Ocjena je uspjesno sačuvana.";
      setReviewSuccessMessage(successMessage);
      if (typeof onReviewPersisted === "function") {
        onReviewPersisted(payload, successMessage);
      }
      setIsSubmittingReview(false);
    },
    [
      applyReviewPayload,
      caseId,
      isCreateMode,
      isSubmittingReview,
      onReviewPersisted,
      onUnauthorized,
      reviewCommentInput,
      reviewRatingInput,
    ]
  );

  return {
    reviewSummary,
    reviewItems,
    solvedUsers,
    userReview,
    reviewRatingInput,
    reviewCommentInput,
    isSubmittingReview,
    reviewErrorMessage,
    reviewSuccessMessage,
    isReviewVisibilityLocked,
    clearReviewMessages,
    loadReviews,
    handleReviewRatingChange,
    handleReviewCommentChange,
    handleSubmitReview,
  };
}

