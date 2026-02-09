import { CASE_WORKSPACE_TABS } from "./caseWorkspaceTabs";
import {
  AUTH_ROUTES,
  CASE_WORKSPACE_MODES,
  buildCaseWorkspaceRoute,
} from "../utils/routes";

function CreateCaseSidebar({
  user,
  onLogout,
  caseTitle = "",
  mode = CASE_WORKSPACE_MODES.CREATE,
  caseId = null,
  activeTabSlug = "",
  onPublish = null,
  publishDisabled = true,
  publishStatusMessage = "",
}) {
  const isCreateMode = mode === CASE_WORKSPACE_MODES.CREATE;
  const modeLabel = isCreateMode ? "Kreiranje slucaja" : "Resavanje slucaja";
  const sidebarLabel = isCreateMode
    ? "Meni za kreiranje slucaja"
    : "Meni za resavanje slucaja";
  const exitLabel = isCreateMode ? "Izlaz iz kreiranja" : "Izlaz iz resavanja";

  function resolveTabHref(tabSlug) {
    if (!caseId) {
      return "#";
    }

    return buildCaseWorkspaceRoute(caseId, mode, tabSlug);
  }

  return (
    <aside className="left-sidebar reveal create-case-sidebar">
      <div className="brand-block">
        <p className="brand-kicker">INSPEKTOR</p>
        <h1>{modeLabel}</h1>
      </div>

      <section className="user-summary" aria-label={modeLabel}>
        <p className="user-summary-name">
          {user.firstName} {user.lastName}
        </p>
        <p className="user-summary-email">{user.email}</p>
      </section>

      <nav aria-label={sidebarLabel}>
        <ul className="menu-list">
          {CASE_WORKSPACE_TABS.map((tab) => {
            const isActive = tab.slug === activeTabSlug;
            const isDisabled = !caseId;
            const className = [
              "menu-link",
              isActive ? "is-active" : "",
              isDisabled ? "is-disabled" : "",
            ]
              .join(" ")
              .trim();

            return (
              <li key={tab.slug}>
                <a className={className} href={resolveTabHref(tab.slug)} aria-disabled={isDisabled}>
                  {tab.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {isCreateMode ? (
        <div className="create-case-publish-panel">
          <button
            type="button"
            className="btn btn-primary create-case-publish-btn"
            onClick={onPublish || (() => null)}
            disabled={publishDisabled}
          >
            Objavi slucaj
          </button>
          {publishStatusMessage ? (
            <p className="create-case-publish-status">{publishStatusMessage}</p>
          ) : null}
        </div>
      ) : null}

      <section className="sidebar-note create-case-note-panel">
        {caseTitle ? <p className="create-case-active-title">Aktivni slucaj: {caseTitle}</p> : null}
        <p>
          Svi tabovi su isti u rezimu kreiranja i rezimu resavanja. Trenutno su podstranice
          pripremljene kao prazni placeholder prikazi.
        </p>
      </section>

      <a className="menu-link create-case-exit-link" href={AUTH_ROUTES.HOME}>
        {exitLabel}
      </a>

      <button type="button" className="btn btn-secondary logout-btn" onClick={onLogout}>
        Odjava
      </button>
    </aside>
  );
}

export default CreateCaseSidebar;
