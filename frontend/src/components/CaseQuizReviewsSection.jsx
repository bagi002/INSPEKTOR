import CaseReviewForm from "./CaseReviewForm";
import CaseReviewsPanel from "./CaseReviewsPanel";

function CaseQuizReviewsSection({
  isCreateMode,
  isCaseResolved,
  hasSubmittedCaseReview,
  reviewRatingInput,
  reviewCommentInput,
  isSubmittingReview,
  reviewErrorMessage,
  reviewSuccessMessage,
  reviewSummary,
  reviewItems,
  solvedUsers,
  isReviewVisibilityLocked,
  onReviewRatingChange,
  onReviewCommentChange,
  onSubmitReview,
}) {
  if (isCreateMode) {
    return null;
  }

  const shouldShowReviewComposer = isCaseResolved && !hasSubmittedCaseReview;
  const shouldShowReviewsPanel = hasSubmittedCaseReview;

  return (
    <>
      {shouldShowReviewComposer ? (
        <CaseReviewForm
          ratingValue={reviewRatingInput}
          commentValue={reviewCommentInput}
          isSubmitting={isSubmittingReview}
          errorMessage={reviewErrorMessage}
          successMessage={reviewSuccessMessage}
          onRatingChange={onReviewRatingChange}
          onCommentChange={onReviewCommentChange}
          onSubmit={onSubmitReview}
        />
      ) : null}

      {shouldShowReviewsPanel ? (
        <CaseReviewsPanel
          summary={reviewSummary}
          reviews={reviewItems}
          solvedUsers={solvedUsers}
          isCreateMode={false}
          title="Pregled recenzija"
        />
      ) : null}

      {reviewErrorMessage && !shouldShowReviewComposer ? (
        <section className="card">
          <p className="error-banner">{reviewErrorMessage}</p>
        </section>
      ) : null}

      {reviewSuccessMessage && !shouldShowReviewComposer ? (
        <section className="card">
          <p className="case-quiz-success">{reviewSuccessMessage}</p>
        </section>
      ) : null}

      {isReviewVisibilityLocked && !isCaseResolved ? (
        <section className="card case-reviews-gated-card">
          <p className="create-case-summary">
            Nakon sto uspjesno rijesis i ocijenis slucaj, dobices prikaz komentara i statistike
            recenzija.
          </p>
        </section>
      ) : null}
    </>
  );
}

export default CaseQuizReviewsSection;
