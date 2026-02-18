function CaseQuizSolvePanel({
  questions,
  selectedAnswers,
  isSubmitting,
  canSubmit,
  hasReview,
  onSolveAnswerChange,
  onSubmitQuiz,
}) {
  return (
    <section className="card case-quiz-solve-card">
      <h3>Pitanja</h3>
      {questions.length === 0 ? (
        <p className="case-quiz-empty">Kreator još nije definisao završni kviz za ovaj slučaj.</p>
      ) : (
        <form
          className="case-quiz-solve-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmitQuiz();
          }}
        >
          {questions.map((question, questionIndex) => (
            <article key={question.id} className="case-quiz-solve-question-card">
              <h4>
                {questionIndex + 1}. {question.questionText}
              </h4>
              <div className="case-quiz-solve-option-list">
                {question.options.map((option) => (
                  <label key={option.id} className="case-quiz-solve-option-row">
                    <input
                      type="radio"
                      name={`solve-question-${question.id}`}
                      checked={Number(selectedAnswers[question.id]) === option.id}
                      onChange={() => onSolveAnswerChange(question.id, option.id)}
                    />
                    <span>{option.optionText}</span>
                  </label>
                ))}
              </div>
            </article>
          ))}

          <button
            type="submit"
            className="btn btn-primary case-quiz-submit-btn"
            disabled={isSubmitting || !canSubmit || questions.length === 0 || hasReview}
          >
            {hasReview ? "Slučaj je riješen" : isSubmitting ? "Predaja u toku..." : "Predaj završni kviz"}
          </button>
        </form>
      )}
    </section>
  );
}

export default CaseQuizSolvePanel;
