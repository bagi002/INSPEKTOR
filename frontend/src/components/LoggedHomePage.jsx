import { useCallback, useEffect, useMemo, useState } from "react";
import LoggedCaseSection from "./LoggedCaseSection";
import LoggedCreatedCaseDetails from "./LoggedCreatedCaseDetails";
import LoggedCreatedCaseStatsModal from "./LoggedCreatedCaseStatsModal";
import LoggedSidebar from "./LoggedSidebar";
import {
  EMPTY_HOME_DATA,
  formatAverageRating,
  formatResolvedAt,
  formatReviews,
  normalizeHomeData,
} from "./loggedHomeData";
import { fetchLoggedHomeCases } from "../services/casesApi";
import { AUTH_ROUTES, CASE_WORKSPACE_MODES, buildCaseWorkspaceRoute } from "../utils/routes";

function LoggedHomePage({ user, onLogout }) {
  const [homeData, setHomeData] = useState(EMPTY_HOME_DATA);
  const [selectedCreatedCaseForStats, setSelectedCreatedCaseForStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const quickStats = useMemo(
    () => [
      { label: "Aktivni slučajevi", value: String(homeData.summary.activeCount) },
      { label: "Rešeni slučajevi", value: String(homeData.summary.resolvedCount) },
      { label: "Kreirani slučajevi", value: String(homeData.summary.createdCount) },
      { label: "Prosečna ocena", value: formatAverageRating(homeData.summary.averageResolvedRating) },
    ],
    [homeData.summary]
  );
  const draftCreationCases = useMemo(
    () => homeData.sections.createdCases.filter((item) => item.publicationStatus === "draft"),
    [homeData.sections.createdCases]
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

      setErrorMessage(result.message || "Učitavanje slučajeva nije uspelo.");
      setIsLoading(false);
      return;
    }

    setHomeData(normalizeHomeData(result.data));
    setIsLoading(false);
  }, [onLogout]);

  const handleOpenCreatedCaseStats = useCallback((item) => {
    if (!item?.id) return;
    setSelectedCreatedCaseForStats({ id: item.id, title: item.title || "Objavljeni slučaj" });
  }, []);

  const handleCloseCreatedCaseStats = useCallback(() => {
    setSelectedCreatedCaseForStats(null);
  }, []);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  return (
    <div className="app-shell app-shell-logged" id="ulogovani-home">
      <LoggedSidebar activePath={AUTH_ROUTES.HOME} user={user} onLogout={onLogout} />
      <main className="content logged-content">
        <section className="card logged-hero reveal delay-1">
          <p className="eyebrow">Ulogovani režim</p>
          <h2>Dobrodošao nazad, {user.firstName}.</h2>
          <p>U nastavku imaš pregled slučajeva koje trenutno rešavaš, završenih istraga, najocenjenijih javnih slučajeva i scenarija koje si kreirao.</p>
          <div className="cta-row">
            <a className="btn btn-primary" href={AUTH_ROUTES.CREATE_CASE}>Kreiraj novi slučaj</a>
            <a className="btn btn-secondary" href={AUTH_ROUTES.PROFILE}>Otvori profil</a>
          </div>
        </section>
        {isLoading ? (
          <section className="card reveal delay-2">
            <p className="eyebrow">Učitavanje podataka</p>
            <h3>Pripremam stvarne slučajeve iz baze...</h3>
          </section>
        ) : null}
        {!isLoading && errorMessage ? (
          <section className="card reveal delay-2">
            <p className="error-banner">{errorMessage}</p>
            <button type="button" className="btn btn-primary inline-action" onClick={loadHomeData}>
              Pokušaj ponovo
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
            <LoggedCaseSection
              title="Slučajevi koje trenutno rešavaš"
              items={homeData.sections.activeCases}
              emptyMessage="Trenutno nemaš aktivnih slučajeva."
              renderDetails={(item) => (
                <>
                  <p className="case-meta">Faza istrage: {item.progressPercent || 0}%</p>
                  <p>{item.description}</p>
                  <a className="btn btn-secondary inline-action case-inline-link" href={buildCaseWorkspaceRoute(item.id, CASE_WORKSPACE_MODES.SOLVE)}>Nastavi rešavanje</a>
                </>
              )}
            />
            <LoggedCaseSection
              title="Rešeni slučajevi"
              items={homeData.sections.resolvedCases}
              gridClassName="case-grid case-grid-compact"
              delayClass="delay-3"
              emptyMessage="Još nemaš rešene slučajeve."
              renderDetails={(item) => (
                <>
                  <p>Ocena: <strong>{formatAverageRating(item.rating)}</strong> | {formatReviews(item.reviews)}</p>
                  <p>Riješeno: <strong>{formatResolvedAt(item.resolvedAt)}</strong></p>
                </>
              )}
            />
            <LoggedCaseSection
              title="Slučajevi u fazi kreiranja"
              items={draftCreationCases}
              gridClassName="case-grid case-grid-compact"
              delayClass="delay-3"
              emptyMessage="Trenutno nemaš slučajeve u fazi kreiranja."
              renderDetails={(item) => (
                <>
                  <p>Status: <strong>U izradi</strong></p>
                  <a className="btn btn-secondary inline-action case-inline-link" href={buildCaseWorkspaceRoute(item.id, CASE_WORKSPACE_MODES.CREATE)}>Nastavi kreiranje</a>
                </>
              )}
            />
            <LoggedCaseSection
              title="Najocenjeniji javni slučajevi"
              items={homeData.sections.topRatedPublicCases}
              gridClassName="case-grid case-grid-compact"
              delayClass="delay-3"
              emptyMessage="Nema javnih slučajeva za prikaz."
              renderDetails={(item) => (
                <>
                  <p>Ocena: <strong>{formatAverageRating(item.rating)}</strong> | Autor: {item.author}</p>
                  <a className="btn btn-secondary inline-action case-inline-link" href={buildCaseWorkspaceRoute(item.id, CASE_WORKSPACE_MODES.SOLVE)}>Pokreni rešavanje</a>
                </>
              )}
            />
            <LoggedCaseSection
              title="Slučajevi koje si kreirao"
              items={homeData.sections.createdCases}
              gridClassName="case-grid case-grid-compact"
              delayClass="delay-4"
              emptyMessage="Još nemaš kreirane slučajeve."
              renderDetails={(item) => <LoggedCreatedCaseDetails item={item} onOpenStatistics={handleOpenCreatedCaseStats} />}
            />
          </>
        ) : null}
      </main>
      {selectedCreatedCaseForStats ? (
        <LoggedCreatedCaseStatsModal
          caseId={selectedCreatedCaseForStats.id}
          caseTitle={selectedCreatedCaseForStats.title}
          onClose={handleCloseCreatedCaseStats}
          onUnauthorized={onLogout}
        />
      ) : null}
    </div>
  );
}

export default LoggedHomePage;
