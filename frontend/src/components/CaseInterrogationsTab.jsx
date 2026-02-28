import CaseInterrogationChatModal from "./CaseInterrogationChatModal";
import CaseInterrogationCreateModal from "./CaseInterrogationCreateModal";
import { buildInterrogationsStats } from "./caseInterrogationsHelpers";
import { toRoleLabel } from "./casePeopleHelpers";
import { useCaseInterrogationsTabState } from "./useCaseInterrogationsTabState";

function CaseInterrogationsTab({ caseId, mode, onUnauthorized }) {
  const {
    interrogations,
    peopleDirectory,
    alivePeople,
    selectedPersonId,
    activeInterrogation,
    isCreateMode,
    isCreateModalOpen,
    isChatModalOpen,
    isLoading,
    errorMessage,
    actionMessage,
    isSubmitting,
    submitError,
    submitSuccessMessage,
    isEditMode,
    formData,
    formErrors,
    nodeDraft,
    nodeDraftError,
    loadInterrogations,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    openChatModal,
    closeChatModal,
    handleSelectedPersonChange,
    startInterrogationForSelectedPerson,
    handleFieldChange,
    handleNodeDraftChange,
    handleAddNode,
    handleRemoveNode,
    handleCreateInterrogation,
  } = useCaseInterrogationsTabState({ caseId, mode, onUnauthorized });

  const stats = buildInterrogationsStats(interrogations, peopleDirectory);

  return (
    <>
      {isLoading ? (
        <section className="card reveal delay-3">
          <p>Učitavam saslušanja...</p>
        </section>
      ) : null}

      {!isLoading && errorMessage ? (
        <section className="card reveal delay-3">
          <p className="error-banner">{errorMessage}</p>
          <button type="button" className="btn btn-primary inline-action" onClick={loadInterrogations}>
            Pokušaj ponovo
          </button>
        </section>
      ) : null}

      {!isLoading && !errorMessage ? (
        <div className="case-interrogations-overview">
          <section
            className={`card reveal delay-3 case-interrogations-hero-card ${isCreateMode ? "is-create" : "is-solve"}`}
          >
            <div className="case-interrogations-hero-top">
              <div>
                <p className="eyebrow">{isCreateMode ? "Creatorski centar" : "Rešavanje slučaja"}</p>
                <h3>{isCreateMode ? "Operativni centar saslušanja" : "Pregled saslušanja po osobi"}</h3>
                <p className="create-case-summary">
                  {isCreateMode
                    ? "Izaberi osobu, definiši stablo pitanja i odgovora i proveri tok razgovora kroz chat modal."
                    : "Izaberi osobu i pokreni saslušanje kroz chat da pregledaš tok pitanja i odgovora."}
                </p>
              </div>
              {isCreateMode ? (
                <button
                  type="button"
                  className="btn btn-primary case-interrogations-primary-action"
                  onClick={() => openCreateModal()}
                  disabled={alivePeople.length === 0}
                >
                  + Novo saslušanje
                </button>
              ) : null}
            </div>
            <div className="case-interrogations-stat-grid">
              {stats.map((item) => (
                <article className="case-interrogations-stat-card" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="card reveal delay-3 case-interrogations-toolbar-card">
            <div className="case-interrogations-toolbar">
              <label className="create-case-field">
                Izaberi osobu
                <select
                  className="create-case-input"
                  value={selectedPersonId}
                  onChange={handleSelectedPersonChange}
                  disabled={alivePeople.length === 0}
                >
                  {alivePeople.length === 0 ? <option value="">Nema živih osoba</option> : null}
                  {alivePeople.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.fullName} ({toRoleLabel(person.apparentRole)})
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn btn-secondary case-interrogations-start-btn"
                onClick={startInterrogationForSelectedPerson}
                disabled={alivePeople.length === 0}
              >
                {isCreateMode ? "Pokreni / kreiraj saslušanje" : "Pokreni saslušanje"}
              </button>
            </div>
            {actionMessage ? <p className="case-interrogations-note">{actionMessage}</p> : null}
          </section>

          <section className="card reveal delay-3 case-interrogations-directory-card">
            {interrogations.length === 0 ? (
              <p className="case-interrogation-empty">Nema evidentiranih saslušanja u ovom slučaju.</p>
            ) : (
              <ul className="case-interrogations-directory-list">
                {interrogations.map((interrogation) => (
                  <li key={interrogation.id}>
                    <div className="case-interrogations-directory-row-wrap">
                      <button
                        type="button"
                        className="case-interrogations-directory-row"
                        onClick={() => openChatModal(interrogation.id)}
                      >
                        <span className="case-interrogations-directory-main">
                          <strong>{interrogation.title || "Saslušanje bez naslova"}</strong>
                          <small>
                            Osoba: {interrogation.person?.fullName || "Nepoznata osoba"} |{" "}
                            {toRoleLabel(interrogation.person?.apparentRole || "unknown")}
                          </small>
                        </span>
                        <span className="case-interrogations-directory-meta">
                          <small>Čvorova pitanja: {interrogation.nodes?.length || 0}</small>
                          <small>Ažurirano: {interrogation.updatedAt || "N/A"}</small>
                        </span>
                        <span className="case-interrogations-directory-action">Otvori chat</span>
                      </button>
                      {isCreateMode ? (
                        <button
                          type="button"
                          className="btn btn-secondary case-interrogations-edit-btn"
                          onClick={() => openEditModal(interrogation.id)}
                        >
                          Izmeni
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {!isLoading && !errorMessage && isCreateMode && isCreateModalOpen ? (
        <div className="case-interrogation-modal-overlay" role="dialog" aria-modal="true">
          <section className="case-interrogation-create-modal">
            <CaseInterrogationCreateModal
              people={peopleDirectory}
              formData={formData}
              formErrors={formErrors}
              nodeDraft={nodeDraft}
              nodeDraftError={nodeDraftError}
              isSubmitting={isSubmitting}
              submitError={submitError}
              submitSuccessMessage={submitSuccessMessage}
              isEditMode={isEditMode}
              onFieldChange={handleFieldChange}
              onNodeDraftChange={handleNodeDraftChange}
              onAddNode={handleAddNode}
              onRemoveNode={handleRemoveNode}
              onSubmit={handleCreateInterrogation}
              onCancel={closeCreateModal}
            />
          </section>
        </div>
      ) : null}

      {!isLoading && !errorMessage && isChatModalOpen ? (
        <CaseInterrogationChatModal interrogation={activeInterrogation} onClose={closeChatModal} />
      ) : null}
    </>
  );
}

export default CaseInterrogationsTab;
