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
import { fetchCaseOverview, publishCase } from "../services/casesApi";
import {
  AUTH_ROUTES,
  CASE_WORKSPACE_MODES,
  buildCaseWorkspaceRoute,
} from "../utils/routes";

function resolvePublishErrorMessage(result) {
  const blockers = Array.isArray(result?.errors?.publish)
    ? result.errors.publish.filter(
        (blocker) => typeof blocker === "string" && blocker.trim().length > 0
      )
    : [];

  if (blockers.length > 0) {
    return [result?.message || "Objava slučaja nije uspela.", ...blockers].join(" ");
  }

  return result?.message || "Objava slučaja nije uspela.";
}

function CaseWorkspacePage({ user, onLogout, caseId, mode, activeTabSlug }) {
  const [caseOverview, setCaseOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [publishStatusMessage, setPublishStatusMessage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
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
      setErrorMessage(result.message || "Učitavanje slučaja nije uspelo.");
      setIsLoading(false);
      return;
    }
    if (!result.data || !result.data.case?.id) {
      setErrorMessage("Slučaj nije pronađen ili više nije dostupan.");
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
  async function handlePublishClick() {
    if (!caseData || isPublishing || caseData.publicationStatus === "published") {
      return;
    }

    setIsPublishing(true);
    setPublishStatusMessage("");
    const result = await publishCase(caseId);

    if (!result.ok) {
      if (result.unauthorized) {
        setIsPublishing(false);
        onLogout();
        return;
      }

      setPublishStatusMessage(resolvePublishErrorMessage(result));
      setIsPublishing(false);
      return;
    }

    setPublishStatusMessage(result.message || "Slučaj je uspešno objavljen.");
    await loadCaseData();
    setIsPublishing(false);
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
  const isCasePublished = caseData?.publicationStatus === "published";
  const publishDisabled =
    !showPublishButton ||
    !caseData ||
    isLoading ||
    isPublishing ||
    isCasePublished ||
    Boolean(errorMessage);
  const publishActionLabel = isCasePublished ? "Slučaj je objavljen" : "Objavi slučaj";
  const resolvedPublishStatusMessage = showPublishButton
    ? publishStatusMessage ||
      (isCasePublished ? "Slučaj je već objavljen i dostupan za rešavanje." : "")
    : "";
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
        isPublishing={isPublishing}
        publishActionLabel={publishActionLabel}
        publishStatusMessage={resolvedPublishStatusMessage}
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
            <h2>Učitavam slučaj...</h2>
            <p>Pripremam prikaz traženog taba.</p>
          </section>
        ) : null}
        {!isLoading && errorMessage ? (
          <section className="card reveal delay-1">
            <p className="error-banner">{errorMessage}</p>
            <div className="cta-row">
              <button type="button" className="btn btn-primary inline-action" onClick={loadCaseData}>
                Pokušaj ponovo
              </button>
              <a className="btn btn-secondary" href={AUTH_ROUTES.HOME}>
                Nazad na početnu
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
