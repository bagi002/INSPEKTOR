import {
  heroHighlights,
  featureCards,
  playerBenefitCards,
  processSteps,
  trustSignals,
} from "../data/publicLandingContent";
import PublicSidebar from "./PublicSidebar";
import { PUBLIC_ROUTES } from "../utils/routes";

function LandingPage() {
  return (
    <div className="app-shell" id="početna">
      <PublicSidebar activePath={PUBLIC_ROUTES.HOME} />

      <main className="content">
        <section className="hero card reveal delay-1">
          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <p className="eyebrow">Kriminalistička igra dedukcije</p>
              <h2>Uđi u slučaj pre svih i pronađi trag koji drugi propuštaju.</h2>
              <p>
                INSPEKTOR je igra istrage u kojoj svaki dokument, izjava i potez
                menjaju tok slučaja. Tvoj cilj je da povežeš činjenice, postaviš
                uloge i dokažeš rešenje završnim kvizom.
              </p>

              <div className="cta-row">
                <a className="btn btn-primary" href={PUBLIC_ROUTES.REGISTRATION}>
                  Registruj se
                </a>
                <a className="btn btn-secondary" href={PUBLIC_ROUTES.LOGIN}>
                  Prijavi se
                </a>
              </div>

              <ul className="hero-highlight-list">
                {heroHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>

            <aside className="hero-signal-panel" aria-label="Razlozi za ulazak u igru">
              <p className="hero-signal-title">Zašto novi igrači ostaju u igri</p>
              <ul className="hero-signal-list">
                {trustSignals.map((signal) => (
                  <li key={signal.label}>
                    <strong>{signal.value}</strong>
                    <span>{signal.label}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="card reveal delay-2">
          <h3>Ključne funkcionalnosti</h3>
          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card reveal delay-3">
          <h3>Kako izgleda tvoj prvi slučaj?</h3>
          <ol className="timeline">
            {processSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="card reveal delay-4">
          <h3>Uđi u igru po svom stilu</h3>
          <div className="benefit-grid">
            {playerBenefitCards.map((benefit) => (
              <article className="benefit-card" key={benefit.title}>
                <h4>{benefit.title}</h4>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card cta-panel reveal delay-4">
          <h3>Preuzmi kontrolu nad istragom</h3>
          <p>
            Aktuelna verzija interfejsa je fokusirana na desktop prikaz sa više
            prostora za dokumente, vremensku liniju i paralelnu analizu tragova.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href={PUBLIC_ROUTES.REGISTRATION}>
              Otvori registraciju
            </a>
            <a className="btn btn-secondary" href={PUBLIC_ROUTES.LOGIN}>
              Otvori prijavu
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
