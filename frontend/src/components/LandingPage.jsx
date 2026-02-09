import {
  featureCards,
  processSteps,
} from "../data/publicLandingContent";
import PublicSidebar from "./PublicSidebar";
import { PUBLIC_ROUTES } from "../utils/routes";

function LandingPage() {
  return (
    <div className="app-shell" id="pocetna">
      <PublicSidebar activePath={PUBLIC_ROUTES.HOME} />

      <main className="content">
        <section className="hero card reveal delay-1">
          <p className="eyebrow">Analiza dokaza i simulacija istrage</p>
          <h2>Resavaj slucajeve kao vodeci istrazitelj.</h2>
          <p>
            INSPEKTOR je platforma gde svaki dokument i svaka izjava mogu da
            promene tok istrage. Fokus je na jasnoj analizi i preciznim
            zakljuccima.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href={PUBLIC_ROUTES.REGISTRATION}>
              Registruj se
            </a>
            <a className="btn btn-secondary" href={PUBLIC_ROUTES.LOGIN}>
              Prijavi se
            </a>
          </div>
        </section>

        <section className="card reveal delay-2">
          <h3>Kljucne funkcionalnosti</h3>
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
          <h3>Kako izgleda tok rada?</h3>
          <ol className="timeline">
            {processSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="card cta-panel reveal delay-4">
          <h3>Desktop istraga, bez kompromisa</h3>
          <p>
            Aktuelna verzija interfejsa je fokusirana na desktop prikaz sa vise
            prostora za dokumenta, vremensku liniju i paralelnu analizu tragova.
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
