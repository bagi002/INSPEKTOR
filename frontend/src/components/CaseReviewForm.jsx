const REVIEW_RATING_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

function CaseReviewForm({
  ratingValue,
  commentValue,
  isSubmitting,
  errorMessage,
  successMessage,
  onRatingChange,
  onCommentChange,
  onSubmit,
}) {
  return (
    <section className="card case-review-form-card">
      <h3>Ocijeni slučaj</h3>
      <p className="create-case-summary">
        Ocjenu za isti slučaj možeš poslati samo jednom. Komentar je opcion.
      </p>

      <form
        className="case-review-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        <label className="case-quiz-field">
          Ocjena
          <select value={ratingValue} onChange={(event) => onRatingChange(event.target.value)}>
            <option value="">Izaberi ocjenu</option>
            {REVIEW_RATING_OPTIONS.map((option) => (
              <option key={option} value={String(option)}>
                {option.toFixed(1)}/5
              </option>
            ))}
          </select>
        </label>

        <label className="case-quiz-field">
          Komentar (opciono)
          <textarea
            rows={4}
            maxLength={1200}
            value={commentValue}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder="Napisi kratak utisak o slučaju..."
          />
        </label>

        <button type="submit" className="btn btn-primary case-quiz-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Slanje..." : "Posalji ocjenu"}
        </button>
      </form>

      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
      {successMessage ? <p className="case-quiz-success">{successMessage}</p> : null}
    </section>
  );
}

export default CaseReviewForm;

