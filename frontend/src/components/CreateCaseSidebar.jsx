import { useEffect, useMemo, useState } from "react";
import { CASE_WORKSPACE_TABS } from "./caseWorkspaceTabs";
import {
  AUTH_ROUTES,
  CASE_WORKSPACE_MODES,
  buildCaseWorkspaceRoute,
} from "../utils/routes";
import { resetCaseProgressToSolve } from "../services/caseProgressApi";

function CreateCaseSidebar({
  user,
  onLogout,
  mode = CASE_WORKSPACE_MODES.CREATE,
  caseId = null,
  activeTabSlug = "",
  onPublish = null,
  publishDisabled = true,
  isPublishing = false,
  publishActionLabel = "Objavi slucaj",
  publishStatusMessage = "",
  onOpenSolveQuiz = null,
  showSolveAction = false,
  solveActionDisabled = true,
  solveStatusMessage = "",
  solveActionLabel = "Rijesi slucaj",
}) {
  const [isResettingCaseProgress, setIsResettingCaseProgress] = useState(false);
  const [resetProgressStatusMessage, setResetProgressStatusMessage] = useState("");
  const isCreateMode = mode === CASE_WORKSPACE_MODES.CREATE;
  const modeLabel = isCreateMode ? "Kreiranje slucaja" : "Resavanje slucaja";
  const sidebarLabel = isCreateMode
    ? "Meni za kreiranje slucaja"
    : "Meni za resavanje slucaja";
  const exitLabel = isCreateMode ? "Izlaz iz kreiranja" : "Izlaz iz resavanja";
  const visibleTabs = useMemo(
    () =>
      CASE_WORKSPACE_TABS.filter(
        (tab) => isCreateMode || tab.slug !== "kviz" || showSolveAction
      ),
    [isCreateMode, showSolveAction]
  );

  function resolveTabHref(tabSlug) {
    if (!caseId) {
      return "#";
    }

    return buildCaseWorkspaceRoute(caseId, mode, tabSlug);
  }

  useEffect(() => {
    setResetProgressStatusMessage("");
  }, [caseId, mode]);

  async function handleResetToSolveClick() {
    if (!isCreateMode || !caseId || isResettingCaseProgress) {
      return;
    }

    setIsResettingCaseProgress(true);
    setResetProgressStatusMessage("");
    const result = await resetCaseProgressToSolve(caseId);

    if (!result.ok) {
      if (result.unauthorized) {
        setIsResettingCaseProgress(false);
        if (typeof onLogout === "function") {
          onLogout();
        }
        return;
      }

      setResetProgressStatusMessage(
        result.message || "Vracanje slucaja u rezim resavanja nije uspelo."
      );
      setIsResettingCaseProgress(false);
      return;
    }

    setResetProgressStatusMessage(
      result.message || "Status slucaja je vracen na rezim resavanja."
    );
    setIsResettingCaseProgress(false);
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
          {visibleTabs.map((tab) => {
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
            disabled={publishDisabled || isPublishing}
          >
            {isPublishing ? "Objavljujem..." : publishActionLabel}
          </button>
          {publishStatusMessage ? (
            <p className="create-case-publish-status">{publishStatusMessage}</p>
          ) : null}
          <button
            type="button"
            className="btn btn-secondary create-case-publish-btn"
            onClick={handleResetToSolveClick}
            disabled={!caseId || isResettingCaseProgress}
          >
            {isResettingCaseProgress
              ? "Vracam status..."
              : "Vrati slucaj u resavanje"}
          </button>
          {resetProgressStatusMessage ? (
            <p className="create-case-publish-status">{resetProgressStatusMessage}</p>
          ) : null}
        </div>
      ) : null}

      {!isCreateMode && showSolveAction ? (
        <div className="create-case-publish-panel">
          <button
            type="button"
            className="btn btn-primary create-case-publish-btn"
            onClick={onOpenSolveQuiz || (() => null)}
            disabled={solveActionDisabled}
          >
            {solveActionLabel}
          </button>
          {solveStatusMessage ? (
            <p className="create-case-publish-status">{solveStatusMessage}</p>
          ) : null}
        </div>
      ) : null}

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
