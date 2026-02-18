import CaseQuizCreatePanel from "./CaseQuizCreatePanel";
import CaseQuizReviewPanel from "./CaseQuizReviewPanel";
import CaseQuizSolvePanel from "./CaseQuizSolvePanel";
import CaseQuizReviewsSection from "./CaseQuizReviewsSection";
import CaseQuizSolveInfoCards from "./CaseQuizSolveInfoCards";
import { formatSolvedAt } from "./caseQuizHelpers";
import { useCaseQuizTabState } from "./useCaseQuizTabState";

function CaseQuizTab({ caseId, mode, onUnauthorized, onResolved }) {
  const {
    questions,
    caseSummary,
    progress,
    passThresholdPercent,
    canSubmit,
    blockers,
    review,
    lastAttempt,
    selectedAnswers,
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
    isCreateMode,
    isLoading,
    errorMessage,
    isSaving,
    isSubmitting,
    saveErrorMessage,
    saveSuccessMessage,
    submitErrorMessage,
    submitSuccessMessage,
    loadQuiz,
    handleQuestionFieldChange,
    handleOptionFieldChange,
    handleCorrectOptionChange,
    handleAddQuestion,
    handleRemoveQuestion,
    handleAddOption,
    handleRemoveOption,
    handleSaveQuiz,
    handleSolveAnswerChange,
    handleSubmitQuiz,
    handleReviewRatingChange,
    handleReviewCommentChange,
    handleSubmitReview,
  } = useCaseQuizTabState({ caseId, mode, onUnauthorized, onResolved });

  const hasReview = Array.isArray(review);
  const isCaseResolved = progress?.progressStatus === "resolved";
  const hasSubmittedCaseReview = Boolean(userReview);

  if (isLoading) {
    return (
      <section className="card reveal delay-3">
        <p>Učitavam završni kviz...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="card reveal delay-3">
        <p className="error-banner">{errorMessage}</p>
        <button type="button" className="btn btn-primary inline-action" onClick={loadQuiz}>
          Pokušaj ponovo
        </button>
      </section>
    );
  }

  return (
    <div className="case-quiz-overview">
      <section className={`card case-quiz-hero-card ${isCreateMode ? "is-create" : "is-solve"}`}>
        <div className="case-quiz-hero-top">
          <div>
            <p className="eyebrow">Završni kviz</p>
            <h3>{isCreateMode ? "Priprema kviza za potvrdu rešenja" : "Kviz za potvrdu riješenog slučaja"}</h3>
            <p className="create-case-summary">
              {isCreateMode
                ? "Kreator unaprijed definiše pitanja i ponuđene odgovore. Prag za prolaz je strogo veći od 80%."
                : "Za prelazak slučaja u riješene potrebno je ostvariti više od 80% tačnih odgovora."}
            </p>
          </div>
          {isCreateMode ? (
            <button
              type="button"
              className="btn btn-primary case-quiz-primary-btn"
              onClick={handleSaveQuiz}
              disabled={isSaving}
            >
              {isSaving ? "Čuvanje..." : "Sačuvaj kviz"}
            </button>
          ) : null}
        </div>

        <div className="case-quiz-stat-grid">
          <article className="case-quiz-stat-card">
            <strong>{questions.length}</strong>
            <span>Pitanja</span>
          </article>
          <article className="case-quiz-stat-card">
            <strong>{`>${passThresholdPercent}%`}</strong>
            <span>Prag prolaza</span>
          </article>
          <article className="case-quiz-stat-card">
            <strong>{progress?.progressStatus === "resolved" ? "Riješen" : "U toku"}</strong>
            <span>Status slučaja</span>
          </article>
          <article className="case-quiz-stat-card">
            <strong>{progress?.resolvedAt ? formatSolvedAt(progress.resolvedAt) : "-"}</strong>
            <span>Vrijeme rješavanja</span>
          </article>
        </div>

        {saveErrorMessage ? <p className="error-banner">{saveErrorMessage}</p> : null}
        {saveSuccessMessage ? <p className="case-quiz-success">{saveSuccessMessage}</p> : null}
        {submitErrorMessage ? <p className="error-banner">{submitErrorMessage}</p> : null}
        {submitSuccessMessage ? <p className="case-quiz-success">{submitSuccessMessage}</p> : null}
      </section>

      {!isCreateMode ? (
        <CaseQuizSolveInfoCards caseSummary={caseSummary} lastAttempt={lastAttempt} blockers={blockers} />
      ) : null}

      {isCreateMode ? (
        <CaseQuizCreatePanel
          questions={questions}
          onQuestionFieldChange={handleQuestionFieldChange}
          onOptionFieldChange={handleOptionFieldChange}
          onCorrectOptionChange={handleCorrectOptionChange}
          onAddQuestion={handleAddQuestion}
          onRemoveQuestion={handleRemoveQuestion}
          onAddOption={handleAddOption}
          onRemoveOption={handleRemoveOption}
        />
      ) : null}

      {!isCreateMode && !hasReview ? (
        <CaseQuizSolvePanel
          questions={questions}
          selectedAnswers={selectedAnswers}
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          hasReview={hasReview}
          onSolveAnswerChange={handleSolveAnswerChange}
          onSubmitQuiz={handleSubmitQuiz}
        />
      ) : null}

      {!isCreateMode && hasReview ? <CaseQuizReviewPanel review={review} /> : null}
      <CaseQuizReviewsSection
        isCreateMode={isCreateMode}
        isCaseResolved={isCaseResolved}
        hasSubmittedCaseReview={hasSubmittedCaseReview}
        reviewRatingInput={reviewRatingInput}
        reviewCommentInput={reviewCommentInput}
        isSubmittingReview={isSubmittingReview}
        reviewErrorMessage={reviewErrorMessage}
        reviewSuccessMessage={reviewSuccessMessage}
        reviewSummary={reviewSummary}
        reviewItems={reviewItems}
        solvedUsers={solvedUsers}
        isReviewVisibilityLocked={isReviewVisibilityLocked}
        onReviewRatingChange={handleReviewRatingChange}
        onReviewCommentChange={handleReviewCommentChange}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}

export default CaseQuizTab;
