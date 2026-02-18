import { formatAverageRating, formatReviews } from "./loggedHomeData";
import { formatSolvedAt } from "./caseQuizHelpers";

function renderReviewItems(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return <p className="case-quiz-empty">Još nema dostupnih recenzija za prikaz.</p>;
  }

  return (
    <div className="case-reviews-list">
      {reviews.map((item) => (
        <article key={`${item.userId}-${item.ratedAt || item.resolvedAt || ""}`} className="case-review-item">
          <h4>{item.userDisplayName || "Korisnik"}</h4>
          <p>
            Ocjena: <strong>{formatAverageRating(item.rating)}</strong>
          </p>
          <p className="case-review-comment">
            {item.comment && item.comment.trim().length > 0 ? item.comment : "Bez komentara."}
          </p>
          <p>
            Vrijeme ocjene: <strong>{formatSolvedAt(item.ratedAt || item.resolvedAt) || "-"}</strong>
          </p>
        </article>
      ))}
    </div>
  );
}

function renderSolvedUsers(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="case-quiz-empty">Još nema korisnika koji su rešili ovaj slučaj.</p>;
  }

  return (
    <div className="case-solved-users-list">
      {items.map((item) => (
        <article
          key={`${item.userId}-${item.resolvedAt || item.ratedAt || ""}`}
          className="case-solved-user-item"
        >
          <h4>{item.userDisplayName || "Korisnik"}</h4>
          <p>
            Riješio: <strong>{formatSolvedAt(item.resolvedAt) || "-"}</strong>
          </p>
          <p>
            Recenzija:{" "}
            <strong>{item.hasReview ? formatAverageRating(item.rating) : "Nije ostavljena"}</strong>
          </p>
        </article>
      ))}
    </div>
  );
}

function CaseReviewsPanel({ summary, reviews, solvedUsers, isCreateMode, title }) {
  const safeSummary = summary || {};

  return (
    <section className="card case-reviews-panel">
      <div className="case-reviews-panel-top">
        <h3>{title}</h3>
      </div>

      <div className="case-review-stat-grid">
        <article className="case-review-stat-card">
          <strong>{formatAverageRating(safeSummary.averageRating)}</strong>
          <span>Prosjecna ocjena</span>
        </article>
        <article className="case-review-stat-card">
          <strong>{formatReviews(safeSummary.ratingCount)}</strong>
          <span>Ukupno recenzija</span>
        </article>
        <article className="case-review-stat-card">
          <strong>{Number(safeSummary.activeSolverCount) || 0}</strong>
          <span>Trenutno rješava</span>
        </article>
        <article className="case-review-stat-card">
          <strong>{Number(safeSummary.resolvedSolverCount) || 0}</strong>
          <span>Riješilo korisnika</span>
        </article>
      </div>

      {isCreateMode ? (
        <>
          <h4>Korisnici koji su rešili slučaj</h4>
          {renderSolvedUsers(solvedUsers)}
        </>
      ) : null}

      <h4>Komentari i ocjene</h4>
      {renderReviewItems(reviews)}
    </section>
  );
}

export default CaseReviewsPanel;
