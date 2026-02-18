import { formatAverageRating, formatReviews } from "./loggedHomeData";
import { formatSolvedAt } from "./caseQuizHelpers";

function CaseQuizSolveInfoCards({ caseSummary, lastAttempt, blockers }) {
  return (
    <>
      {caseSummary ? (
        <section className="card case-quiz-case-summary-card">
          <p className="eyebrow">Opis slučaja</p>
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

      {lastAttempt ? (
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

      {Array.isArray(blockers) && blockers.length > 0 ? (
        <section className="card case-quiz-blockers-card">
          <h3>Sta je potrebno prije predaje kviza</h3>
          <ul>
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

export default CaseQuizSolveInfoCards;

