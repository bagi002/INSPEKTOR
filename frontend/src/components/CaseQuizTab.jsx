import CaseQuizCreatePanel from "./CaseQuizCreatePanel";
import CaseQuizReviewPanel from "./CaseQuizReviewPanel";
import CaseQuizSolvePanel from "./CaseQuizSolvePanel";
import { formatAverageRating, formatReviews } from "./loggedHomeData";
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
  } = useCaseQuizTabState({ caseId, mode, onUnauthorized, onResolved });

  const hasReview = Array.isArray(review);

  if (isLoading) {
    return (
      <section className="card reveal delay-3">
        <p>Ucitavam zavrsni kviz...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="card reveal delay-3">
        <p className="error-banner">{errorMessage}</p>
        <button type="button" className="btn btn-primary inline-action" onClick={loadQuiz}>
          Pokusaj ponovo
        </button>
      </section>
    );
  }

  return (
    <div className="case-quiz-overview">
      <section className={`card case-quiz-hero-card ${isCreateMode ? "is-create" : "is-solve"}`}>
        <div className="case-quiz-hero-top">
          <div>
            <p className="eyebrow">Zavrsni kviz</p>
            <h3>{isCreateMode ? "Priprema kviza za potvrdu resenja" : "Kviz za potvrdu rijesenog slucaja"}</h3>
            <p className="create-case-summary">
              {isCreateMode
                ? "Kreator unaprijed definise pitanja i ponudjene odgovore. Prag za prolaz je strogo veci od 80%."
                : "Za prelazak slucaja u rijesene potrebno je ostvariti vise od 80% tacnih odgovora."}
            </p>
          </div>
          {isCreateMode ? (
            <button
              type="button"
              className="btn btn-primary case-quiz-primary-btn"
              onClick={handleSaveQuiz}
              disabled={isSaving}
            >
              {isSaving ? "Cuvanje..." : "Sacuvaj kviz"}
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
            <strong>{progress?.progressStatus === "resolved" ? "Rijesen" : "U toku"}</strong>
            <span>Status slucaja</span>
          </article>
          <article className="case-quiz-stat-card">
            <strong>{progress?.resolvedAt ? formatSolvedAt(progress.resolvedAt) : "-"}</strong>
            <span>Vrijeme rjesavanja</span>
          </article>
        </div>

        {saveErrorMessage ? <p className="error-banner">{saveErrorMessage}</p> : null}
        {saveSuccessMessage ? <p className="case-quiz-success">{saveSuccessMessage}</p> : null}
        {submitErrorMessage ? <p className="error-banner">{submitErrorMessage}</p> : null}
        {submitSuccessMessage ? <p className="case-quiz-success">{submitSuccessMessage}</p> : null}
      </section>

      {!isCreateMode && caseSummary ? (
        <section className="card case-quiz-case-summary-card">
          <p className="eyebrow">Opis slucaja</p>
          <h3>{caseSummary.title}</h3>
          <p className="create-case-summary">{caseSummary.description}</p>
          <div className="case-quiz-case-meta">
            <span>
              Autor: <strong>{caseSummary.author || "Nepoznato"}</strong>
            </span>
            <span>
              Ocjena: <strong>{formatAverageRating(caseSummary.averageRating)}</strong>
            </span>
            <span>{formatReviews(caseSummary.ratingCount)}</span>
          </div>
        </section>
      ) : null}

      {!isCreateMode && lastAttempt ? (
        <section className="card case-quiz-attempt-card">
          <p>
            Poslednji rezultat: <strong>{lastAttempt.scorePercent}%</strong> ({lastAttempt.correctAnswers}/
            {lastAttempt.totalQuestions})
          </p>
          <p>
            Vrijeme predaje: <strong>{formatSolvedAt(lastAttempt.submittedAt) || "-"}</strong>
          </p>
        </section>
      ) : null}

      {!isCreateMode && blockers.length > 0 ? (
        <section className="card case-quiz-blockers-card">
          <h3>Sta je potrebno prije predaje kviza</h3>
          <ul>
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </section>
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
    </div>
  );
}

export default CaseQuizTab;
