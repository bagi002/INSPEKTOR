import { useCallback, useEffect, useMemo, useState } from "react";
import CreateCaseSidebar from "./CreateCaseSidebar";
import CaseTimelineTab from "./CaseTimelineTab";
import CasePeopleTab from "./CasePeopleTab";
import CasePoliceDocumentsTab from "./CasePoliceDocumentsTab";
import CaseStatementsTab from "./CaseStatementsTab";
import CaseInterrogationsTab from "./CaseInterrogationsTab";
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
    };
  }
  return {
    label: "Creatorski mod",
    description:
      "U istom setu tabova pripremas strukturu slucaja, dokumente, izjave, saslusanja i kviz.",
    placeholder:
      "Ovo je prazna stranica za ovaj tab u rezimu kreiranja. Konkretni editori ce biti dodati u narednim fazama.",
  };
}
function CaseWorkspacePage({ user, onLogout, caseId, mode, activeTabSlug }) {
  const [caseData, setCaseData] = useState(null);
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
  const modeDescription = useMemo(() => {
    if (isTimelineTab) {
      return mode === CASE_WORKSPACE_MODES.SOLVE
        ? "Postepeno otkljucavanje redosleda osoba i dokumenata kroz akciju 'Dalje', uz prikaz trenutnog datuma istrage."
        : "Operativni panel za definisanje redosleda, napomena i vremena otkljucavanja osoba i dokumenata.";
    }
    if (!isPeopleTab) {
      if (isPoliceDocumentsTab) {
        if (mode === CASE_WORKSPACE_MODES.SOLVE) {
          return "Pregled policijskih izvjestaja i forenzickih nalaza u read-only rezimu sa formalnim prikazom dokumenta.";
        }
        return "Operativni panel za kreiranje policijskih izvjestaja i forenzickih nalaza kroz formalni modalni workflow.";
      }
      if (isStatementsTab) {
        if (mode === CASE_WORKSPACE_MODES.SOLVE) {
          return "Pregled svih izjava u slucaju, povezivanje sa osobama i formalni read-only prikaz u policijskom formatu.";
        }
        return "Operativni panel za unos i pregled izjava svjedoka, osumnjicenih i zrtava kroz strukturisane dokumente.";
      }
      if (isInterrogationsTab) {
        if (mode === CASE_WORKSPACE_MODES.SOLVE) {
          return "Pregled i pokretanje saslusanja po osobi kroz chat prikaz sa unapred definisanim granama pitanja.";
        }
        return "Operativni panel za kreiranje stabla pitanja i odgovora po osobi i testiranje toka saslusanja kroz chat modal.";
      }
      return modeTexts.description;
    }
    if (mode === CASE_WORKSPACE_MODES.SOLVE) {
      return "Pregled formalnih dosijea lica u read-only rezimu, sa fokusom na evidenciju i detalje profila.";
    }
    return "Operativni panel za kreiranje, uredjivanje i pregled dosijea osoba kroz strukturisan modalni workflow.";
  }, [isTimelineTab, isPeopleTab, isPoliceDocumentsTab, isStatementsTab, isInterrogationsTab, mode, modeTexts.description]);
  const loadCaseData = useCallback(async () => {
    if (mode === CASE_WORKSPACE_MODES.SOLVE) {
      setCaseData({
        id: caseId,
        title: `Slucaj #${caseId}`,
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
  function renderTabContent() {
    if (activeTab.slug === "vremenska-linija") {
      return <CaseTimelineTab caseId={caseId} mode={mode} onUnauthorized={onLogout} />;
    }
    if (activeTab.slug === "osobe-i-dosijei") {
      return <CasePeopleTab caseId={caseId} mode={mode} onUnauthorized={onLogout} />;
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
    return (
      <section className="card reveal delay-3">
        <h3>Prazna stranica (placeholder)</h3>
        <p className="create-case-summary">{modeTexts.placeholder}</p>
      </section>
    );
  }
  const showPublishButton = mode === CASE_WORKSPACE_MODES.CREATE;
  const publishDisabled = !showPublishButton || !caseData || isLoading || Boolean(errorMessage);
  const showTabSummaryCard = !isTimelineTab && !isPeopleTab && !isPoliceDocumentsTab && !isStatementsTab && !isInterrogationsTab;
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
