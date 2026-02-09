import LoggedSidebar from "./LoggedSidebar";
import {
  activeCases,
  createdCases,
  quickStats,
  resolvedCases,
  topRatedPublicCases,
} from "../data/loggedHomeContent";
import { AUTH_ROUTES } from "../utils/routes";

function renderSimpleCaseCards(items, renderDetails) {
  return items.map((item) => (
    <article className="case-card" key={item.title}>
      <h4>{item.title}</h4>
      {renderDetails(item)}
    </article>
  ));
}

function LoggedHomePage({ user, onLogout }) {
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
            {renderSimpleCaseCards(activeCases, (item) => (
              <>
                <p className="case-meta">{item.meta}</p>
                <p>{item.description}</p>
              </>
            ))}
          </div>
        </section>

        <section className="card reveal delay-3">
          <h3>Reseni slucajevi</h3>
          <div className="case-grid case-grid-compact">
            {renderSimpleCaseCards(resolvedCases, (item) => (
              <p>
                Ocena: <strong>{item.rating}</strong> | {item.reviews}
              </p>
            ))}
          </div>
        </section>

        <section className="card reveal delay-3">
          <h3>Najocenjeniji javni slucajevi</h3>
          <div className="case-grid case-grid-compact">
            {renderSimpleCaseCards(topRatedPublicCases, (item) => (
              <p>
                Ocena: <strong>{item.rating}</strong> | {item.author}
              </p>
            ))}
          </div>
        </section>

        <section className="card reveal delay-4">
          <h3>Slucajevi koje si kreirao</h3>
          <div className="case-grid case-grid-compact">
            {renderSimpleCaseCards(createdCases, (item) => (
              <p>
                Status: <strong>{item.status}</strong> | Ocena: {item.score}
              </p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoggedHomePage;
