import { useCallback, useEffect, useState } from "react";
import { fetchCaseReviews } from "../services/caseQuizApi";
import CaseReviewsPanel from "./CaseReviewsPanel";

function LoggedCreatedCaseStatsModal({ caseId, caseTitle, onClose, onUnauthorized }) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [solvedUsers, setSolvedUsers] = useState([]);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const result = await fetchCaseReviews(caseId, "create");
    if (!result.ok) {
      if (result.unauthorized) {
        onUnauthorized();
        return;
      }

      setSummary(null);
      setReviews([]);
      setSolvedUsers([]);
      setErrorMessage(result.message || "Ucitavanje statistike nije uspelo.");
      setIsLoading(false);
      return;
    }

    const payload = result.data || {};
    setSummary(payload.summary || null);
    setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
    setSolvedUsers(Array.isArray(payload.solvedUsers) ? payload.solvedUsers : []);
    setIsLoading(false);
  }, [caseId, onUnauthorized]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="created-case-stats-backdrop" role="presentation" onClick={onClose}>
      <section
        className="created-case-stats-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="created-case-stats-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="created-case-stats-header">
          <div>
            <p className="eyebrow">Statistika slucaja</p>
            <h3 id="created-case-stats-title">{caseTitle || "Objavljeni slucaj"}</h3>
          </div>
          <button type="button" className="btn btn-secondary inline-action" onClick={onClose}>
            Zatvori
          </button>
        </header>

        {isLoading ? (
          <section className="card">
            <p>Ucitavam statistiku slucaja...</p>
          </section>
        ) : null}

        {!isLoading && errorMessage ? (
          <section className="card">
            <p className="error-banner">{errorMessage}</p>
            <button type="button" className="btn btn-primary inline-action" onClick={loadStats}>
              Pokusaj ponovo
            </button>
          </section>
        ) : null}

        {!isLoading && !errorMessage ? (
          <CaseReviewsPanel
            summary={summary}
            reviews={reviews}
            solvedUsers={solvedUsers}
            isCreateMode
            title="Pregled recenzija i rjesavanja slucaja"
          />
        ) : null}
      </section>
    </div>
  );
}

export default LoggedCreatedCaseStatsModal;
