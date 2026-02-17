import { useCallback, useEffect, useMemo, useState } from "react";
import CreateCaseSidebar from "./CreateCaseSidebar";
import CaseTimelineTab from "./CaseTimelineTab";
import CasePeopleTab from "./CasePeopleTab";
import CasePoliceDocumentsTab from "./CasePoliceDocumentsTab";
import CaseStatementsTab from "./CaseStatementsTab";
import CaseInterrogationsTab from "./CaseInterrogationsTab";
import CaseQuizTab from "./CaseQuizTab";
import {
  resolveModeDescription,
  resolveModeTexts,
  resolveSolveActionState,
} from "./caseWorkspaceModeHelpers";
import { CASE_WORKSPACE_TABS, findCaseWorkspaceTab } from "./caseWorkspaceTabs";
import { fetchCaseOverview } from "../services/casesApi";
import {
  AUTH_ROUTES,
  CASE_WORKSPACE_MODES,
  buildCaseWorkspaceRoute,
} from "../utils/routes";
function CaseWorkspacePage({ user, onLogout, caseId, mode, activeTabSlug }) {
  const [caseOverview, setCaseOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [publishStatusMessage, setPublishStatusMessage] = useState("");
  const activeTab = useMemo(() => findCaseWorkspaceTab(activeTabSlug) || CASE_WORKSPACE_TABS[0], [activeTabSlug]);
  const modeTexts = useMemo(() => resolveModeTexts(mode), [mode]);
  const isTimelineTab = activeTab.slug === "vremenska-linija";
  const isPeopleTab = activeTab.slug === "osobe-i-dosijei";
  const isPoliceDocumentsTab = activeTab.slug === "dokumenti";
  const isStatementsTab = activeTab.slug === "izjave";
  const isInterrogationsTab = activeTab.slug === "saslusanja";
  const isQuizTab = activeTab.slug === "kviz";
  const caseData = caseOverview?.case || null;
  const caseProgress = caseOverview?.progress || null;
  const roleProgress = caseOverview?.roleProgress || null;
  const quizInfo = caseOverview?.quiz || null;
  const quizTotalQuestions = Number(quizInfo?.totalQuestions) || 0;
  const { showSolveAction, solveActionLabel, solveActionDisabled, solveStatusMessage } = useMemo(
    () => resolveSolveActionState(mode, caseProgress, quizTotalQuestions, roleProgress),
    [mode, caseProgress, quizTotalQuestions, roleProgress]
  );
  const modeDescription = useMemo(
    () => resolveModeDescription(activeTab.slug, mode, modeTexts.description),
    [activeTab.slug, mode, modeTexts.description]
  );
  const loadCaseData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    const result = await fetchCaseOverview(caseId, mode === CASE_WORKSPACE_MODES.SOLVE ? "solve" : "create");
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }
      setErrorMessage(result.message || "Ucitavanje slucaja nije uspelo.");
      setIsLoading(false);
      return;
    }
    if (!result.data || !result.data.case?.id) {
      setErrorMessage("Slucaj nije pronadjen ili vise nije dostupan.");
      setIsLoading(false);
      return;
    }
    setCaseOverview(result.data);
    setIsLoading(false);
  }, [caseId, mode, onLogout]);
  useEffect(() => {
    void loadCaseData();
  }, [loadCaseData]);
  useEffect(() => {
    setPublishStatusMessage("");
  }, [caseId, mode]);
  function handlePublishClick() {
    setPublishStatusMessage("Objava slucaja je trenutno dostupna kao dugme u meniju. Potvrda objave i backend logika bice dodati u sledecoj fazi.");
  }
  function handleOpenSolveQuiz() {
    if (typeof window === "undefined") {
      return;
    }

    window.location.href = buildCaseWorkspaceRoute(caseId, CASE_WORKSPACE_MODES.SOLVE, "kviz");
  }
  function handleCaseResolved() {
    void loadCaseData();
  }
  function handleSolveRolesUpdated() {
    void loadCaseData();
  }
  function renderTabContent() {
    if (activeTab.slug === "vremenska-linija") {
      return <CaseTimelineTab caseId={caseId} mode={mode} onUnauthorized={onLogout} />;
    }
    if (activeTab.slug === "osobe-i-dosijei") {
      return (
        <CasePeopleTab
          caseId={caseId}
          mode={mode}
          onUnauthorized={onLogout}
          onSolveRolesUpdated={handleSolveRolesUpdated}
        />
      );
    }
    if (activeTab.slug === "dokumenti") {
      return <CasePoliceDocumentsTab caseId={caseId} mode={mode} onUnauthorized={onLogout} />;
    }
    if (activeTab.slug === "izjave") {
      return <CaseStatementsTab caseId={caseId} mode={mode} onUnauthorized={onLogout} />;
    }
    if (activeTab.slug === "saslusanja") {
      return <CaseInterrogationsTab caseId={caseId} mode={mode} onUnauthorized={onLogout} />;
    }
    if (activeTab.slug === "kviz") {
      return (
        <CaseQuizTab
          caseId={caseId}
          mode={mode}
          onUnauthorized={onLogout}
          onResolved={handleCaseResolved}
        />
      );
    }
    return (
      <section className="card reveal delay-3">
        <h3>Prazna stranica (placeholder)</h3>
        <p className="create-case-summary">{modeTexts.placeholder}</p>
      </section>
    );
  }
  const showPublishButton = mode === CASE_WORKSPACE_MODES.CREATE;
  const publishDisabled = !showPublishButton || !caseData || isLoading || Boolean(errorMessage);
  const showTabSummaryCard =
    !isTimelineTab &&
    !isPeopleTab &&
    !isPoliceDocumentsTab &&
    !isStatementsTab &&
    !isInterrogationsTab &&
    !isQuizTab;
  return (
    <div className="app-shell app-shell-create-case">
      <CreateCaseSidebar
        user={user}
        onLogout={onLogout}
        mode={mode}
        caseId={caseId}
        activeTabSlug={activeTab.slug}
        onPublish={handlePublishClick}
        publishDisabled={publishDisabled}
        publishStatusMessage={showPublishButton ? publishStatusMessage : ""}
        onOpenSolveQuiz={handleOpenSolveQuiz}
        showSolveAction={showSolveAction}
        solveActionDisabled={solveActionDisabled}
        solveStatusMessage={solveStatusMessage}
        solveActionLabel={solveActionLabel}
      />
      <main className="content create-case-content">
        {isLoading ? (
          <section className="card reveal delay-1">
            <p className="eyebrow">{modeTexts.label}</p>
            <h2>Ucitavam slucaj...</h2>
            <p>Pripremam prikaz trazenog taba.</p>
          </section>
        ) : null}
        {!isLoading && errorMessage ? (
          <section className="card reveal delay-1">
            <p className="error-banner">{errorMessage}</p>
            <div className="cta-row">
              <button type="button" className="btn btn-primary inline-action" onClick={loadCaseData}>
                Pokusaj ponovo
              </button>
              <a className="btn btn-secondary" href={AUTH_ROUTES.HOME}>
                Nazad na pocetnu
              </a>
            </div>
          </section>
        ) : null}
        {!isLoading && !errorMessage && caseData ? (
          <>
            <section className="card logged-hero reveal delay-1">
              <p className="eyebrow">{modeTexts.label}</p>
              <h2>{caseData.title}</h2>
              <p>{modeDescription}</p>
            </section>
            {showTabSummaryCard ? (
              <section className="card reveal delay-2">
                <p className="eyebrow">Tab</p>
                <h3>{activeTab.label}</h3>
                <p className="create-case-summary">{activeTab.description}</p>
              </section>
            ) : null}
            {renderTabContent()}
          </>
        ) : null}
      </main>
    </div>
  );
}
export default CaseWorkspacePage;
