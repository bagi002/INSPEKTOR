import { useCallback, useEffect, useMemo, useState } from "react";
import LoggedCaseSection from "./LoggedCaseSection";
import LoggedSidebar from "./LoggedSidebar";
import {
  EMPTY_HOME_DATA,
  formatAverageRating,
  formatReviews,
  formatStatus,
  normalizeHomeData,
} from "./loggedHomeData";
import { fetchLoggedHomeCases } from "../services/casesApi";
import { AUTH_ROUTES, CASE_WORKSPACE_MODES, buildCaseWorkspaceRoute } from "../utils/routes";

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

            <LoggedCaseSection
              title="Slucajevi koje trenutno resavas"
              items={homeData.sections.activeCases}
              emptyMessage="Trenutno nemas aktivnih slucajeva."
              renderDetails={(item) => (
                <>
                  <p className="case-meta">Faza istrage: {item.progressPercent || 0}%</p>
                  <p>{item.description}</p>
                  <a
                    className="btn btn-secondary inline-action case-inline-link"
                    href={buildCaseWorkspaceRoute(item.id, CASE_WORKSPACE_MODES.SOLVE)}
                  >
                    Nastavi resavanje
                  </a>
                </>
              )}
            />

            <LoggedCaseSection
              title="Reseni slucajevi"
              items={homeData.sections.resolvedCases}
              gridClassName="case-grid case-grid-compact"
              delayClass="delay-3"
              emptyMessage="Jos nemas resene slucajeve."
              renderDetails={(item) => (
                <p>
                  Ocena: <strong>{formatAverageRating(item.rating)}</strong> |{" "}
                  {formatReviews(item.reviews)}
                </p>
              )}
            />

            <LoggedCaseSection
              title="Slucajevi u fazi kreiranja"
              items={draftCreationCases}
              gridClassName="case-grid case-grid-compact"
              delayClass="delay-3"
              emptyMessage="Trenutno nemas slucajeve u fazi kreiranja."
              renderDetails={(item) => (
                <>
                  <p>
                    Status: <strong>{formatStatus(item.publicationStatus)}</strong>
                  </p>
                  <a
                    className="btn btn-secondary inline-action case-inline-link"
                    href={buildCaseWorkspaceRoute(item.id, CASE_WORKSPACE_MODES.CREATE)}
                  >
                    Nastavi kreiranje
                  </a>
                </>
              )}
            />

            <LoggedCaseSection
              title="Najocenjeniji javni slucajevi"
              items={homeData.sections.topRatedPublicCases}
              gridClassName="case-grid case-grid-compact"
              delayClass="delay-3"
              emptyMessage="Nema javnih slucajeva za prikaz."
              renderDetails={(item) => (
                <p>
                  Ocena: <strong>{formatAverageRating(item.rating)}</strong> | Autor: {item.author}
                </p>
              )}
            />

            <LoggedCaseSection
              title="Slucajevi koje si kreirao"
              items={homeData.sections.createdCases}
              gridClassName="case-grid case-grid-compact"
              delayClass="delay-4"
              emptyMessage="Jos nemas kreirane slucajeve."
              renderDetails={(item) => (
                <p>
                  Status: <strong>{formatStatus(item.publicationStatus)}</strong> | Ocena:{" "}
                  {formatAverageRating(item.rating)} ({formatReviews(item.reviews)})
                </p>
              )}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}

export default LoggedHomePage;
