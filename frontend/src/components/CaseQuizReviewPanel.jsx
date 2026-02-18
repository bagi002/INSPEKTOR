function CaseQuizReviewPanel({ review }) {
  return (
    <section className="card case-quiz-review-card">
      <h3>Prikaz tačnih odgovora</h3>
      <p className="create-case-summary">
        Ovaj pregled je dostupan jer je slučaj uspjesno riješen.
      </p>
      <div className="case-quiz-review-list">
        {review.map((item, index) => (
          <article
            key={item.questionId}
            className={`case-quiz-review-item ${item.isCorrect ? "is-correct" : "is-incorrect"}`}
          >
            <h4>
              {index + 1}. {item.questionText}
            </h4>
            <p>
              Tvoj odgovor: <strong>{item.selectedOptionText || "Nije izabran"}</strong>
            </p>
            <p>
              Tačan odgovor: <strong>{item.correctOptionText || "-"}</strong>
            </p>
            <p>{item.explanationText}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CaseQuizReviewPanel;
