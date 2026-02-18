import LoggedSidebar from "./LoggedSidebar";
import PublicSidebar from "./PublicSidebar";
import {
  caseBuildingBlocks,
  caseDefinition,
  createGuideSteps,
  guideFaq,
  quickRoutes,
  solveGuideSteps,
} from "../data/wikiGuideContent";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "../utils/routes";

function GuideStepList({ steps }) {
  return (
    <ol className="wiki-guide-steps">
      {steps.map((step) => (
        <li key={step.title} className="wiki-guide-step">
          <h4>{step.title}</h4>
          <p>{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

function WikiPage({ user = null, onLogout = null }) {
  const isLoggedIn = Boolean(user);
  const handleLogout = typeof onLogout === "function" ? onLogout : () => null;

  return (
    <div className={`app-shell${isLoggedIn ? " app-shell-logged" : ""}`} id="wiki-igre">
      {isLoggedIn ? (
        <LoggedSidebar activePath={PUBLIC_ROUTES.WIKI} user={user} onLogout={handleLogout} />
      ) : (
        <PublicSidebar
          activePath={PUBLIC_ROUTES.WIKI}
          noteText="Ovo je vodič kroz aplikaciju: šta je slučaj, od čega se sastoji i kako se rešava."
        />
      )}

      <main className="content wiki-content">
        <section className="card wiki-hero reveal delay-1">
          <p className="eyebrow">INSPEKTOR VODIČ</p>
          <h2>Jasno objašnjenje kako igra funkcioniše</h2>
          <p>
            Ovaj vodič je pisan za igrače i kreatore: prvo razumeš strukturu slučaja,
            zatim korake rešavanja, a nakon toga i tok kreiranja.
          </p>
          <div className="cta-row">
            {isLoggedIn ? (
              <>
                <a className="btn btn-primary" href={AUTH_ROUTES.HOME}>Nazad na početnu</a>
                <a className="btn btn-secondary" href={AUTH_ROUTES.CREATE_CASE}>Kreiraj slučaj</a>
              </>
            ) : (
              <>
                <a className="btn btn-primary" href={PUBLIC_ROUTES.REGISTRATION}>Registracija</a>
                <a className="btn btn-secondary" href={PUBLIC_ROUTES.LOGIN}>Prijava</a>
              </>
            )}
          </div>
        </section>

        <section className="card reveal delay-2">
          <h3>{caseDefinition.title}</h3>
          <p className="wiki-lead">{caseDefinition.description}</p>
          <p className="wiki-note">{caseDefinition.note}</p>
          <div className="wiki-block-grid">
            {caseBuildingBlocks.map((block) => (
              <article key={block.title} className="wiki-block-card">
                <h4>{block.title}</h4>
                <p>{block.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card reveal delay-3">
          <h3>Kako se slučaj rešava? (korak po korak)</h3>
          <GuideStepList steps={solveGuideSteps} />
        </section>

        <section className="card reveal delay-3">
          <h3>Kako se slučaj kreira? (korak po korak)</h3>
          <GuideStepList steps={createGuideSteps} />
        </section>

        <section className="card reveal delay-4">
          <h3>Brza navigacija</h3>
          <div className="wiki-route-grid">
            {quickRoutes.map((entry) => (
              <article key={entry.route} className="wiki-route-card">
                <h4>{entry.label}</h4>
                <p className="wiki-route-path"><code>{entry.route}</code></p>
                <p>{entry.purpose}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card reveal delay-4">
          <h3>FAQ</h3>
          <div className="wiki-faq-list">
            {guideFaq.map((item) => (
              <article key={item.question} className="wiki-faq-item">
                <h4>{item.question}</h4>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default WikiPage;
