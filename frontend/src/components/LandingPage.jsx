import {
  featureCards,
  menuItems,
  processSteps,
} from "../data/publicLandingContent";

function LandingPage() {
  return (
    <div className="app-shell" id="pocetna">
      <aside className="left-sidebar reveal">
        <div className="brand-block">
          <p className="brand-kicker">INSPEKTOR</p>
          <h1>Platforma za istrazne slucajeve i takticko razmisljanje</h1>
        </div>

        <nav aria-label="Javni meni">
          <ul className="menu-list">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-note">
          <p>
            U neulogovanom rezimu dostupne su kljucne informacije i direktan
            ulaz ka registraciji i prijavi.
          </p>
        </div>
      </aside>

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
            <a className="btn btn-primary" href="/registracija">
              Registruj se
            </a>
            <a className="btn btn-secondary" href="/prijava">
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
            <a className="btn btn-primary" href="/registracija">
              Otvori registraciju
            </a>
            <a className="btn btn-secondary" href="/prijava">
              Otvori prijavu
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
