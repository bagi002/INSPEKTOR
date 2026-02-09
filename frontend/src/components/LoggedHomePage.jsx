import { useCallback, useEffect, useMemo, useState } from "react";
import LoggedSidebar from "./LoggedSidebar";
import {
  EMPTY_HOME_DATA,
  formatAverageRating,
  formatReviews,
  formatStatus,
  normalizeHomeData,
} from "./loggedHomeData";
import { fetchLoggedHomeCases } from "../services/casesApi";
import { AUTH_ROUTES } from "../utils/routes";

function renderSimpleCaseCards(items, renderDetails, emptyMessage) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return items.map((item) => (
    <article className="case-card" key={item.id || item.title}>
      <h4>{item.title}</h4>
      {renderDetails(item)}
    </article>
  ));
}

function LoggedHomePage({ user, onLogout }) {
  const [homeData, setHomeData] = useState(EMPTY_HOME_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const quickStats = useMemo(
    () => [
      { label: "Aktivni slucajevi", value: String(homeData.summary.activeCount) },
      { label: "Reseni slucajevi", value: String(homeData.summary.resolvedCount) },
      { label: "Kreirani slucajevi", value: String(homeData.summary.createdCount) },
      {
        label: "Prosecna ocena",
        value: formatAverageRating(homeData.summary.averageResolvedRating),
      },
    ],
    [homeData.summary]
  );

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const result = await fetchLoggedHomeCases();
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }

      setErrorMessage(result.message || "Ucitavanje slucajeva nije uspelo.");
      setIsLoading(false);
      return;
    }

    setHomeData(normalizeHomeData(result.data));
    setIsLoading(false);
  }, [onLogout]);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  return (
    <div className="app-shell app-shell-logged" id="ulogovani-home">
      <LoggedSidebar activePath={AUTH_ROUTES.HOME} user={user} onLogout={onLogout} />

      <main className="content logged-content">
        <section className="card logged-hero reveal delay-1">
          <p className="eyebrow">Ulogovani rezim</p>
          <h2>Dobrodosao nazad, {user.firstName}.</h2>
          <p>
            U nastavku imas pregled slucajeva koje trenutno resavas, zavrsenih
            istraga, najocenjenijih javnih slucajeva i scenarija koje si kreirao.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href={AUTH_ROUTES.CREATE_CASE}>
              Kreiraj novi slucaj
            </a>
            <a className="btn btn-secondary" href={AUTH_ROUTES.PROFILE}>
              Otvori profil
            </a>
          </div>
        </section>

        {isLoading ? (
          <section className="card reveal delay-2">
            <p className="eyebrow">Ucitavanje podataka</p>
            <h3>Pripremam stvarne slucajeve iz baze...</h3>
          </section>
        ) : null}

        {!isLoading && errorMessage ? (
          <section className="card reveal delay-2">
            <p className="error-banner">{errorMessage}</p>
            <button type="button" className="btn btn-primary inline-action" onClick={loadHomeData}>
              Pokusaj ponovo
            </button>
          </section>
        ) : null}

        {!isLoading && !errorMessage ? (
          <>
            <section className="card reveal delay-2">
              <h3>Tvoj brzi pregled</h3>
              <div className="stat-grid">
                {quickStats.map((stat) => (
                  <article className="stat-card" key={stat.label}>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className="card reveal delay-2">
              <h3>Slucajevi koje trenutno resavas</h3>
              <div className="case-grid">
                {renderSimpleCaseCards(
                  homeData.sections.activeCases,
                  (item) => (
                    <>
                      <p className="case-meta">Faza istrage: {item.progressPercent || 0}%</p>
                      <p>{item.description}</p>
                    </>
                  ),
                  "Trenutno nemas aktivnih slucajeva."
                )}
              </div>
            </section>

            <section className="card reveal delay-3">
              <h3>Reseni slucajevi</h3>
              <div className="case-grid case-grid-compact">
                {renderSimpleCaseCards(
                  homeData.sections.resolvedCases,
                  (item) => (
                    <p>
                      Ocena: <strong>{formatAverageRating(item.rating)}</strong> |{" "}
                      {formatReviews(item.reviews)}
                    </p>
                  ),
                  "Jos nemas resene slucajeve."
                )}
              </div>
            </section>

            <section className="card reveal delay-3">
              <h3>Najocenjeniji javni slucajevi</h3>
              <div className="case-grid case-grid-compact">
                {renderSimpleCaseCards(
                  homeData.sections.topRatedPublicCases,
                  (item) => (
                    <p>
                      Ocena: <strong>{formatAverageRating(item.rating)}</strong> | Autor:{" "}
                      {item.author}
                    </p>
                  ),
                  "Nema javnih slucajeva za prikaz."
                )}
              </div>
            </section>

            <section className="card reveal delay-4">
              <h3>Slucajevi koje si kreirao</h3>
              <div className="case-grid case-grid-compact">
                {renderSimpleCaseCards(
                  homeData.sections.createdCases,
                  (item) => (
                    <p>
                      Status: <strong>{formatStatus(item.publicationStatus)}</strong> | Ocena:{" "}
                      {formatAverageRating(item.rating)} ({formatReviews(item.reviews)})
                    </p>
                  ),
                  "Jos nemas kreirane slucajeve."
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default LoggedHomePage;
