import CasePeopleCreateForm from "./CasePeopleCreateForm";
import CasePeopleOverviewPanel from "./CasePeopleOverviewPanel";
import CasePersonDossierModal from "./CasePersonDossierModal";
import { useCasePeopleTabState } from "./useCasePeopleTabState";

function CasePeopleTab({ caseId, mode, onUnauthorized }) {
  const {
    people,
    activePerson,
    isCreateMode,
    isCreateModalOpen,
    isDossierModalOpen,
    isLoading,
    errorMessage,
    isSubmitting,
    submitError,
    submitSuccessMessage,
    formData,
    formErrors,
    loadPeople,
    handleFieldChange,
    handlePhotoUpload,
    handlePhotoRemove,
    handleCreatePerson,
    openCreateModal,
    closeCreateModal,
    openDossierModal,
    closeDossierModal,
  } = useCasePeopleTabState({ caseId, mode, onUnauthorized });

  return (
    <>
      {isLoading ? (
        <section className="card reveal delay-3">
          <p>Ucitavam osobe i dosijee...</p>
        </section>
      ) : null}

      {!isLoading && errorMessage ? (
        <section className="card reveal delay-3">
          <p className="error-banner">{errorMessage}</p>
          <button type="button" className="btn btn-primary inline-action" onClick={loadPeople}>
            Pokusaj ponovo
          </button>
        </section>
      ) : null}

      {!isLoading && !errorMessage ? (
        <CasePeopleOverviewPanel
          people={people}
          onOpenCreateModal={openCreateModal}
          onOpenDossierModal={openDossierModal}
          isCreateMode={isCreateMode}
        />
      ) : null}

      {!isLoading && !errorMessage && isCreateMode && isCreateModalOpen ? (
        <div className="case-people-modal-overlay" role="dialog" aria-modal="true">
          <section className="case-people-modal">
            <CasePeopleCreateForm
              formData={formData}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              submitError={submitError}
              submitSuccessMessage={submitSuccessMessage}
              onFieldChange={handleFieldChange}
              onPhotoUpload={handlePhotoUpload}
              onPhotoRemove={handlePhotoRemove}
              onSubmit={handleCreatePerson}
              onCancel={closeCreateModal}
            />
          </section>
        </div>
      ) : null}

      {!isLoading && !errorMessage && isDossierModalOpen ? (
        <CasePersonDossierModal person={activePerson} onClose={closeDossierModal} />
      ) : null}
    </>
  );
}

export default CasePeopleTab;
