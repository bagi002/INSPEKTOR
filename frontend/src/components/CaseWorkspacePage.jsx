import { useCallback, useEffect, useMemo, useState } from "react";
import CreateCaseSidebar from "./CreateCaseSidebar";
import { CASE_WORKSPACE_TABS, findCaseWorkspaceTab } from "./caseWorkspaceTabs";
import { fetchCreatorCase } from "../services/casesApi";
import { AUTH_ROUTES, CASE_WORKSPACE_MODES } from "../utils/routes";

function resolveModeTexts(mode) {
  if (mode === CASE_WORKSPACE_MODES.SOLVE) {
    return {
      label: "Rezim resavanja",
      description:
        "Otvori tragove, dokumente i izjave kroz iste tabove kao u kreiranju, ali u modu resavanja.",
      placeholder:
        "Ovo je prazna stranica za ovaj tab u rezimu resavanja. Sadrzaj ce biti dodat u narednim fazama.",
      missingCase: "Slucaj #",
    };
  }

  return {
    label: "Creatorski mod",
    description:
      "U istom setu tabova pripremas strukturu slucaja, dokumente, izjave, saslusanja i kviz.",
    placeholder:
      "Ovo je prazna stranica za ovaj tab u rezimu kreiranja. Konkretni editori ce biti dodati u narednim fazama.",
    missingCase: "Draft slucaj #",
  };
}

function CaseWorkspacePage({ user, onLogout, caseId, mode, activeTabSlug }) {
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [publishStatusMessage, setPublishStatusMessage] = useState("");

  const activeTab = useMemo(
    () => findCaseWorkspaceTab(activeTabSlug) || CASE_WORKSPACE_TABS[0],
    [activeTabSlug]
  );
  const modeTexts = useMemo(() => resolveModeTexts(mode), [mode]);

  const loadCaseData = useCallback(async () => {
    if (mode === CASE_WORKSPACE_MODES.SOLVE) {
      setCaseData({
        id: caseId,
        title: `${modeTexts.missingCase}${caseId}`,
        description: "Pocetna verzija prikaza za rezim resavanja slucaja.",
      });
      setErrorMessage("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const result = await fetchCreatorCase(caseId);
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }

      setErrorMessage(result.message || "Ucitavanje slucaja nije uspelo.");
      setIsLoading(false);
      return;
    }

    if (!result.data || !result.data.id) {
      setErrorMessage("Slucaj nije pronadjen ili vise nije dostupan.");
      setIsLoading(false);
      return;
    }

    setCaseData(result.data);
    setIsLoading(false);
  }, [caseId, mode, modeTexts.missingCase, onLogout]);

  useEffect(() => {
    void loadCaseData();
  }, [loadCaseData]);

  useEffect(() => {
    setPublishStatusMessage("");
  }, [caseId, mode]);

  function handlePublishClick() {
    setPublishStatusMessage(
      "Objava slucaja je trenutno dostupna kao dugme u meniju. Potvrda objave i backend logika bice dodati u sledecoj fazi."
    );
  }

  const showPublishButton = mode === CASE_WORKSPACE_MODES.CREATE;
  const publishDisabled = !showPublishButton || !caseData || isLoading || Boolean(errorMessage);

  return (
    <div className="app-shell app-shell-create-case">
      <CreateCaseSidebar
        user={user}
        onLogout={onLogout}
        mode={mode}
        caseId={caseId}
        activeTabSlug={activeTab.slug}
        caseTitle={caseData?.title || ""}
        onPublish={handlePublishClick}
        publishDisabled={publishDisabled}
        publishStatusMessage={showPublishButton ? publishStatusMessage : ""}
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
              <p>{modeTexts.description}</p>
            </section>

            <section className="card reveal delay-2">
              <p className="eyebrow">Tab</p>
              <h3>{activeTab.label}</h3>
              <p className="create-case-summary">{activeTab.description}</p>
            </section>

            <section className="card reveal delay-3">
              <h3>Prazna stranica (placeholder)</h3>
              <p className="create-case-summary">{modeTexts.placeholder}</p>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default CaseWorkspacePage;
